import { describe, expect, it } from 'vitest'
import { createLeakOnlyFitRanker, createModelFitRanker, runDigs } from './localize.ts'
import { createRng } from './random.ts'
import { createWorld, makeScenario, type ScenarioOptions } from './scenario.ts'

// Development seed only; the amendment is tested on seed 2028 by research/amendment1.ts.
const perfect: ScenarioOptions = { leakShare: { min: 0.02, max: 0.1 }, referenceHead: 40, demand: { perJunction: 0, common: 0 }, sensorNoise: 0 }
const world = createWorld(4, 20)

describe('leak-only fit (M3b, Amendment 1)', () => {
  it('lists every candidate place once', () => {
    const s = makeScenario(world, createRng(1), perfect)
    const list = createLeakOnlyFitRanker(world)(s.drop)
    expect(list).toHaveLength(world.candidates.length)
    expect(new Set(list).size).toBe(world.candidates.length)
  })

  it('finds the leak when the readings are exact and demand is known', () => {
    const rank = createLeakOnlyFitRanker(world)
    const rng = createRng(1)
    let dry = 0
    for (let i = 0; i < 8; i++) {
      const s = makeScenario(world, rng, perfect)
      dry += runDigs(rank(s.drop), s.leak, 10).dryHoles
    }
    expect(dry / 8).toBeLessThan(1)
  })

  it('is no better than the full fit when the overall demand is off, because it cannot correct for it', () => {
    const off: ScenarioOptions = { ...perfect, demand: { perJunction: 0, common: 0.2 } }
    const leakOnly = createLeakOnlyFitRanker(world)
    const full = createModelFitRanker(world)
    const rng1 = createRng(1)
    const rng2 = createRng(1)
    let a = 0
    let b = 0
    for (let i = 0; i < 8; i++) {
      const s1 = makeScenario(world, rng1, off)
      a += runDigs(leakOnly(s1.drop), s1.leak, 10).dryHoles
      const s2 = makeScenario(world, rng2, off)
      b += runDigs(full(s2.drop), s2.leak, 10).dryHoles
    }
    expect(a).toBeGreaterThanOrEqual(b)
  })
})
