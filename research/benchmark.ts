/**
 * The AquaLeak benchmark: find a random leak with four methods and count the dry holes.
 * Run with:  node research/benchmark.ts          (about 10-15 minutes; writes research/results/benchmark.json)
 * The design, hypotheses and decision rules are in research/PREREGISTRATION.md and were fixed before this ran.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { cpus } from 'node:os'
import { createFingerprintRanker, createModelFitRanker, rankNaive, rankRandom, runDigs } from '../src/utils/network/localize.ts'
import { createRng } from '../src/utils/network/random.ts'
import { createWorld, makeScenario, type ScenarioOptions } from '../src/utils/network/scenario.ts'
import { BOOTSTRAP_RESAMPLES, CANDIDATE_SPACING, DEMAND_UNCERTAINTY, LEAK_SHARE, MAX_DIGS, REFERENCE_HEAD_M, ROBUSTNESS, SCENARIOS, SEEDS, SENSORS, TARGETS } from './config.ts'
import { bootstrap, mean, meanAt, median, shareAt, verdictH1, verdictH2, type Interval } from './stats.ts'

const METHODS = ['random', 'naive', 'fingerprint', 'fit'] as const
type Method = (typeof METHODS)[number]

interface Run {
  dryHoles: number[]
  found: boolean[]
  firstError: number[]
  milliseconds: number[]
}

interface Condition {
  label: string
  sensorCount: number
  noiseM: number
  demandFactor: number
  scenarios: number
}

interface Experiment {
  condition: Condition
  runs: Record<Method, Run>
  leaks: { share: number; onMainLine: boolean }[]
  fingerprintPrepareMs: number
}

function optionsFor(c: Condition): ScenarioOptions {
  return {
    leakShare: LEAK_SHARE,
    referenceHead: REFERENCE_HEAD_M,
    demand: { perJunction: DEMAND_UNCERTAINTY.perJunction * c.demandFactor, common: DEMAND_UNCERTAINTY.common * c.demandFactor },
    sensorNoise: c.noiseM,
  }
}

function runExperiment(c: Condition): Experiment {
  const world = createWorld(c.sensorCount, CANDIDATE_SPACING)
  const prepareStart = performance.now()
  const fingerprint = createFingerprintRanker(world)
  const fingerprintPrepareMs = performance.now() - prepareStart
  const fit = createModelFitRanker(world)

  const empty = (): Run => ({ dryHoles: [], found: [], firstError: [], milliseconds: [] })
  const runs: Record<Method, Run> = { random: empty(), naive: empty(), fingerprint: empty(), fit: empty() }
  const leaks: Experiment['leaks'] = []
  const rng = createRng(SEEDS.benchmark)
  const options = optionsFor(c)

  for (let i = 0; i < c.scenarios; i++) {
    const scenario = makeScenario(world, rng, options)
    leaks.push({ share: scenario.leak.share, onMainLine: world.graph.pipes[scenario.leak.pipe].segment === 0 })
    const record = (method: Method, rank: () => ReturnType<typeof rankNaive>) => {
      const start = performance.now()
      const ranking = rank()
      const milliseconds = performance.now() - start
      const outcome = runDigs(ranking, scenario.leak, MAX_DIGS)
      runs[method].dryHoles.push(outcome.dryHoles)
      runs[method].found.push(outcome.found)
      runs[method].firstError.push(outcome.firstError)
      runs[method].milliseconds.push(milliseconds)
    }
    record('random', () => rankRandom(world, rng))
    record('naive', () => rankNaive(world, scenario.drop))
    record('fingerprint', () => fingerprint(scenario.drop))
    record('fit', () => fit(scenario.drop))
    if ((i + 1) % 100 === 0) console.error(`${c.label}: ${i + 1}/${c.scenarios}`)
  }
  return { condition: c, runs, leaks, fingerprintPrepareMs }
}

/** Reduction in mean dry holes of `method` against the naive method, over the scenarios at `subset`. */
function reduction(e: Experiment, method: Method, subset: readonly number[]): Interval {
  const naive = e.runs.naive.dryHoles
  const other = e.runs[method].dryHoles
  return bootstrap(subset.length, (idx) => {
    const picked = idx.map((k) => subset[k])
    return 1 - meanAt(other, picked) / meanAt(naive, picked)
  }, BOOTSTRAP_RESAMPLES, SEEDS.bootstrap)
}

const everyone = (e: Experiment) => Array.from({ length: e.condition.scenarios }, (_, i) => i)
const within = (limit: number) => (v: number) => v <= limit

function summarise(e: Experiment) {
  const all = everyone(e)
  const methods = Object.fromEntries(
    METHODS.map((m) => {
      const r = e.runs[m]
      const dry = bootstrap(all.length, (idx) => meanAt(r.dryHoles, idx), BOOTSTRAP_RESAMPLES, SEEDS.bootstrap)
      return [
        m,
        {
          meanDryHoles: dry,
          firstDigFinds: shareAt(r.dryHoles, all, (v) => v === 0),
          withinThreeDigs: shareAt(r.dryHoles, all, within(TARGETS.h2DryHoles)),
          neverFound: shareAt(r.found.map(Number), all, (v) => v === 0),
          medianFirstDigErrorUnits: median(r.firstError),
          medianMilliseconds: median(r.milliseconds),
        },
      ]
    }),
  )
  return {
    condition: e.condition,
    methods,
    reductionVersusNaive: { fingerprint: reduction(e, 'fingerprint', all), fit: reduction(e, 'fit', all) },
  }
}

function subgroup(e: Experiment, label: string, pick: (i: number) => boolean) {
  const subset = everyone(e).filter(pick)
  return {
    label,
    scenarios: subset.length,
    meanDryHoles: Object.fromEntries(METHODS.map((m) => [m, mean(subset.map((i) => e.runs[m].dryHoles[i]))])),
    reductionVersusNaive: { fingerprint: reduction(e, 'fingerprint', subset), fit: reduction(e, 'fit', subset) },
  }
}

// ---------------------------------------------------------------------------------------------------------------------

const started = Date.now()
const mainCondition: Condition = { label: 'main', sensorCount: SENSORS.count, noiseM: SENSORS.noiseM, demandFactor: 1, scenarios: SCENARIOS.main }
const main = runExperiment(mainCondition)
const mainSummary = summarise(main)
const all = everyone(main)

// H1 and H2
const h1 = mainSummary.reductionVersusNaive.fit
const h1Verdict = verdictH1(h1, TARGETS.h1Reduction)
const gap = bootstrap(all.length, (idx) => shareAt(main.runs.fit.dryHoles, idx, within(TARGETS.h2DryHoles)) - shareAt(main.runs.fingerprint.dryHoles, idx, within(TARGETS.h2DryHoles)), BOOTSTRAP_RESAMPLES, SEEDS.bootstrap)
const speedUp = median(main.runs.fit.milliseconds) / median(main.runs.fingerprint.milliseconds)
const h2Verdict = verdictH2(gap, TARGETS.h2MarginShare, TARGETS.h2SpeedUp, speedUp)

// subgroups of the main experiment
const edges = [LEAK_SHARE.min * Math.pow(LEAK_SHARE.max / LEAK_SHARE.min, 1 / 3), LEAK_SHARE.min * Math.pow(LEAK_SHARE.max / LEAK_SHARE.min, 2 / 3)]
const subgroups = [
  subgroup(main, 'small leaks (lowest third of the log scale)', (i) => main.leaks[i].share < edges[0]),
  subgroup(main, 'medium leaks', (i) => main.leaks[i].share >= edges[0] && main.leaks[i].share < edges[1]),
  subgroup(main, 'large leaks (highest third)', (i) => main.leaks[i].share >= edges[1]),
  subgroup(main, 'leak on the main line from the plant', (i) => main.leaks[i].onMainLine),
  subgroup(main, 'leak elsewhere', (i) => !main.leaks[i].onMainLine),
]

// robustness checks: one change each
const conditions: Condition[] = [
  ...ROBUSTNESS.noiseM.map((noiseM) => ({ label: `sensor error ${noiseM} m`, sensorCount: SENSORS.count, noiseM, demandFactor: 1, scenarios: SCENARIOS.sweep })),
  ...ROBUSTNESS.sensorCounts.map((sensorCount) => ({ label: `${sensorCount} sensors`, sensorCount, noiseM: SENSORS.noiseM, demandFactor: 1, scenarios: SCENARIOS.sweep })),
  ...ROBUSTNESS.demandFactors.map((demandFactor) => ({ label: `demand uncertainty x${demandFactor}`, sensorCount: SENSORS.count, noiseM: SENSORS.noiseM, demandFactor, scenarios: SCENARIOS.sweep })),
]
const robustness = conditions.map((c) => summarise(runExperiment(c)))

const result = {
  meta: {
    generatedAt: new Date().toISOString(),
    minutes: Number(((Date.now() - started) / 60000).toFixed(1)),
    machine: `${cpus()[0]?.model.trim()} (${cpus().length} threads), Node ${process.version}`,
    seeds: SEEDS,
    candidatePlaces: createWorld(SENSORS.count, CANDIDATE_SPACING).candidates.length,
    sensorJunctions: createWorld(SENSORS.count, CANDIDATE_SPACING).sensors,
  },
  main: mainSummary,
  fingerprintPrepareMilliseconds: main.fingerprintPrepareMs,
  hypotheses: {
    h1: { target: TARGETS.h1Reduction, reduction: h1, verdict: h1Verdict },
    h2: { marginShare: TARGETS.h2MarginShare, gapFitMinusFingerprint: gap, speedUp, requiredSpeedUp: TARGETS.h2SpeedUp, verdict: h2Verdict },
  },
  subgroups,
  robustness,
}

mkdirSync(new URL('./results/', import.meta.url), { recursive: true })
writeFileSync(new URL('./results/benchmark.json', import.meta.url), JSON.stringify(result, null, 2) + '\n')

const pct = (x: number) => `${(x * 100).toFixed(1)}%`
const ci = (i: Interval) => `${pct(i.estimate)} (95% ${pct(i.low)} to ${pct(i.high)})`
console.log(`\nMain experiment, ${main.condition.scenarios} scenarios`)
for (const m of METHODS) {
  const s = mainSummary.methods[m]
  console.log(`  ${m.padEnd(12)} dry holes ${s.meanDryHoles.estimate.toFixed(2)} (${s.meanDryHoles.low.toFixed(2)}-${s.meanDryHoles.high.toFixed(2)})  first dig ${pct(s.firstDigFinds)}  within 3 ${pct(s.withinThreeDigs)}  never ${pct(s.neverFound)}  ${s.medianMilliseconds.toFixed(3)} ms`)
}
console.log(`H1: reduction of M3 vs naive ${ci(h1)} -> ${h1Verdict}`)
console.log(`H2: gap M3-M2 ${ci(gap)}, speed-up ${speedUp.toFixed(0)}x -> ${h2Verdict}`)
console.log('wrote research/results/benchmark.json')
