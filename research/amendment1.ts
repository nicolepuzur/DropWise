/**
 * Amendment 1 of the pre-registration (section 8.3): does fixing the demand factor (leak-only fit, M3b) help when
 * demand is known? Fresh seed, 500 scenarios at demand factor 0 (the test of H4) and at factor 1 (context only).
 * Run with:  node research/amendment1.ts      (writes research/results/amendment-1.json)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { createFingerprintRanker, createLeakOnlyFitRanker, createModelFitRanker, rankNaive, runDigs } from '../src/utils/network/localize.ts'
import { createRng } from '../src/utils/network/random.ts'
import { createWorld, makeScenario, type ScenarioOptions } from '../src/utils/network/scenario.ts'
import { AMENDMENT1, BOOTSTRAP_RESAMPLES, CANDIDATE_SPACING, DEMAND_UNCERTAINTY, LEAK_SHARE, MAX_DIGS, REFERENCE_HEAD_M, SEEDS, SENSORS } from './config.ts'
import { bootstrap, meanAt, verdictH1 } from './stats.ts'

const METHODS = ['naive', 'fingerprint', 'fit', 'leakOnly'] as const
type Method = (typeof METHODS)[number]

const world = createWorld(SENSORS.count, CANDIDATE_SPACING)
const rankers = {
  naive: (drop: readonly number[]) => rankNaive(world, drop),
  fingerprint: createFingerprintRanker(world),
  fit: createModelFitRanker(world),
  leakOnly: createLeakOnlyFitRanker(world),
}

function run(demandFactor: number) {
  const options: ScenarioOptions = {
    leakShare: LEAK_SHARE,
    referenceHead: REFERENCE_HEAD_M,
    demand: { perJunction: DEMAND_UNCERTAINTY.perJunction * demandFactor, common: DEMAND_UNCERTAINTY.common * demandFactor },
    sensorNoise: SENSORS.noiseM,
  }
  const rng = createRng(AMENDMENT1.seed)
  const dry: Record<Method, number[]> = { naive: [], fingerprint: [], fit: [], leakOnly: [] }
  for (let i = 0; i < AMENDMENT1.scenarios; i++) {
    const scenario = makeScenario(world, rng, options)
    for (const m of METHODS) dry[m].push(runDigs(rankers[m](scenario.drop), scenario.leak, MAX_DIGS).dryHoles)
    if ((i + 1) % 100 === 0) console.error(`factor ${demandFactor}: ${i + 1}/${AMENDMENT1.scenarios}`)
  }
  const all = Array.from({ length: AMENDMENT1.scenarios }, (_, i) => i)
  const mean = Object.fromEntries(METHODS.map((m) => [m, bootstrap(all.length, (idx) => meanAt(dry[m], idx), BOOTSTRAP_RESAMPLES, SEEDS.bootstrap)]))
  const saved = (a: Method, b: Method) => bootstrap(all.length, (idx) => 1 - meanAt(dry[a], idx) / meanAt(dry[b], idx), BOOTSTRAP_RESAMPLES, SEEDS.bootstrap)
  return {
    demandFactor,
    scenarios: AMENDMENT1.scenarios,
    meanDryHoles: mean,
    leakOnlyVersusFit: saved('leakOnly', 'fit'),
    leakOnlyVersusFingerprint: saved('leakOnly', 'fingerprint'),
    fitVersusNaive: saved('fit', 'naive'),
  }
}

const known = run(0)
const context = run(1)
const h4 = { target: AMENDMENT1.target, reduction: known.leakOnlyVersusFit, verdict: verdictH1(known.leakOnlyVersusFit, AMENDMENT1.target) }
const result = { meta: { generatedAt: new Date().toISOString(), seed: AMENDMENT1.seed }, h4, demandKnown: known, mainSettingsContext: context }

mkdirSync(new URL('./results/', import.meta.url), { recursive: true })
writeFileSync(new URL('./results/amendment-1.json', import.meta.url), JSON.stringify(result, null, 2) + '\n')

const pct = (x: number) => `${(x * 100).toFixed(1)}%`
for (const [label, e] of [['factor 0', known], ['factor 1 (context)', context]] as const) {
  console.log(label, METHODS.map((m) => `${m} ${e.meanDryHoles[m].estimate.toFixed(2)}`).join(' | '), `| leak-only vs fit ${pct(e.leakOnlyVersusFit.estimate)} (${pct(e.leakOnlyVersusFit.low)} to ${pct(e.leakOnlyVersusFit.high)})`)
}
console.log(`H4: ${h4.verdict}`)
