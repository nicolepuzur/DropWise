/**
 * Every setting of the AquaLeak benchmark in one place. The numbers here are the ones written in
 * research/PREREGISTRATION.md; they were fixed before any leak-finding method was written or run, and the test
 * research/prereg.test.ts checks that the document and this file agree.
 */

/** Random seeds. The development seed is for debugging and unit tests; the benchmark seed is used once, for the report. */
export const SEEDS = { development: 1, benchmark: 2027, bootstrap: 11 } as const

/** Number of random leak scenarios: the main experiment, and each robustness check. */
export const SCENARIOS = { main: 1000, sweep: 300 } as const

/** A leak loses this share of the customers' demand (log-uniform between the two values), measured at the reference head. */
export const LEAK_SHARE = { min: 0.02, max: 0.1 } as const
export const REFERENCE_HEAD_M = 40

/** What the model does not know: each junction's real demand is nominal x (1 + noise), and all of them move together a little. */
export const DEMAND_UNCERTAINTY = { perJunction: 0.1, common: 0.05 } as const

/** Pressure sensors: how many, and the standard deviation of their error in metres of water (0.1 m = 10 mbar). */
export const SENSORS = { count: 4, noiseM: 0.1 } as const

/** Places a leak could be, one every ~20 map units (80 m) along the pipes. */
export const CANDIDATE_SPACING = 20

/** A crew gives up after this many digs; a leak that is not found counts as this many dry holes. */
export const MAX_DIGS = 10

/** The bootstrap that gives the 95% intervals. */
export const BOOTSTRAP_RESAMPLES = 2000

/** The targets that decide the hypotheses (written down before the run). */
export const TARGETS = {
  /** H1: the model-fitting method has at least this share fewer dry holes than the naive threshold. */
  h1Reduction: 0.5,
  /** H2: the fingerprint method finds the leak within three digs at most this far (share of scenarios) below model fitting... */
  h2MarginShare: 0.05,
  /** ...and is at least this many times faster. */
  h2SpeedUp: 10,
  /** "Within three digs" means at most two dry holes. */
  h2DryHoles: 2,
} as const

/** Robustness checks (each uses SCENARIOS.sweep scenarios and changes one thing). */
export const ROBUSTNESS = {
  noiseM: [0.03, 0.3],
  sensorCounts: [3, 6],
  /** Multiplies both demand uncertainties: 0 = perfect demand knowledge, 2 = twice as uncertain. */
  demandFactors: [0, 2],
} as const
