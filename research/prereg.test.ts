import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AMENDMENT1, BOOTSTRAP_RESAMPLES, CANDIDATE_SPACING, DEMAND_UNCERTAINTY, LEAK_SHARE, MAX_DIGS, REFERENCE_HEAD_M, ROBUSTNESS, SCENARIOS, SEEDS, SENSORS, TARGETS } from './config.ts'

/** The document that fixes the hypotheses must say what the code is configured to do. */
const doc = readFileSync(new URL('./PREREGISTRATION.md', import.meta.url), 'utf8')
const percent = (x: number) => `${Math.round(x * 100)}%`

describe('PREREGISTRATION.md agrees with research/config.ts', () => {
  it('states the sample sizes and the seeds', () => {
    expect(doc).toContain(`**${SCENARIOS.main.toLocaleString('en-US')}** scenarios`)
    expect(doc).toContain(`each with ${SCENARIOS.sweep} scenarios`)
    expect(doc).toContain(`seed ${SEEDS.bootstrap}`)
    expect(doc).toContain(`${BOOTSTRAP_RESAMPLES.toLocaleString('en-US')} resamples`)
    expect(doc).toContain(`a fresh seed (${SEEDS.benchmark})`)
    expect(doc).toContain(`separate random seed (${SEEDS.development})`)
  })

  it('states the targets of the two hypotheses', () => {
    expect(doc).toContain(`**${percent(TARGETS.h1Reduction)} fewer dry holes**`)
    expect(doc).toContain(`**no more than ${TARGETS.h2MarginShare * 100} percentage points below**`)
    expect(doc).toContain(`**at least ${TARGETS.h2SpeedUp} times shorter**`)
    expect(doc).toContain(`at most ${['zero', 'one', 'two', 'three'][TARGETS.h2DryHoles]} dry holes`)
  })

  it('states the simulated world', () => {
    expect(doc).toContain(`**${SENSORS.count}** pressure sensors`)
    expect(doc).toContain(`standard deviation **${SENSORS.noiseM.toFixed(2)} m**`)
    expect(doc).toContain(`standard deviation **${DEMAND_UNCERTAINTY.perJunction.toFixed(2)}**`)
    expect(doc).toContain(`standard deviation **${DEMAND_UNCERTAINTY.common.toFixed(2)}**`)
    expect(doc).toContain(`between **${percent(LEAK_SHARE.min)} and ${percent(LEAK_SHARE.max)}** of the demand, measured at ${REFERENCE_HEAD_M} m of head`)
  })

  it('states the search settings', () => {
    expect(doc).toContain(`${CANDIDATE_SPACING} map units apart`)
    expect(doc).toContain(`after **${MAX_DIGS} digs**`)
  })

  it('states Amendment 1 (a fresh seed, its size and its target)', () => {
    expect(doc).toContain(`**fresh seed (${AMENDMENT1.seed})**`)
    expect(doc).toContain(`**${AMENDMENT1.scenarios}** scenarios at factor 0`)
    expect(doc).toContain(`**at least ${Math.round(AMENDMENT1.target * 100)}% fewer dry holes**`)
  })

  it('lists the robustness checks', () => {
    for (const noise of ROBUSTNESS.noiseM) expect(doc).toContain(`${noise.toFixed(2)} m`)
    expect(doc).toContain(`${ROBUSTNESS.sensorCounts.join(', ')}`)
  })
})
