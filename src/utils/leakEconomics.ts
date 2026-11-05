/**
 * What finding a leak faster is worth in money, in lei (MDL) and euro.
 *
 * The model is deliberately small. A crew that needs fewer dry holes saves two things for every hole it does not dig:
 * the cost of the hole, and the water that keeps running out of the leak while the crew is busy somewhere else.
 *
 *   value of one dry hole avoided = cost of a dig + (days a dig takes x water the leak loses per day x value of water)
 *
 * Which numbers are sourced and which are assumptions is written next to every constant. The assumptions are the
 * weak part of the model and the page that shows it has sliders for them.
 */

/** Lei per euro. National Bank of Moldova official rate, 23 September 2026: 20.1352 (rounded). Check before using. */
export const MDL_PER_EUR = 20.14

/**
 * Drinking-water tariff of Apa-Canal Chisinau for households, lei per m3: 14.03, up from 12.99 (press report of the
 * ANRE decision, Logos Press, 4 August 2026; the page does not say whether VAT is included or from what date the
 * tariff applies). The operator had asked for 15.55. Read the ANRE decision before relying on it.
 */
export const WATER_TARIFF_MDL = 14.03

/** Losses that ANRE accepted in the same tariff calculation: 17.25 million m3, 25.9 % of the water taken in (same source). */
export const CHISINAU_LOSS_SHARE = 0.259

export const SECONDS_PER_DAY = 86_400

export type MethodKey = 'naive' | 'fingerprint' | 'fit'

export interface LeakEconomicsInput {
  /** Water the leak loses, litres per second. */
  leakLitresPerSecond: number
  /** Mean dry holes per leak of each method (from research/results/benchmark.json). */
  dryHoles: Record<MethodKey, number>
  /** Cost of opening, inspecting and closing one dry hole, euro. ASSUMPTION, not sourced. */
  costPerDigEur: number
  /** Days one dig takes the crew. ASSUMPTION: a crew opens and inspects two sites a day. */
  daysPerDig: number
  /** Share of the tariff that a saved cubic metre is worth (1 = it is sold, 0.5 = only half of it comes back). ASSUMPTION. */
  waterValueShare: number
  /** Leaks of this size that a network of this size has each year. ASSUMPTION: 0.25 per km of main a year. */
  leaksPerYear: number
  /** Four pressure sensors with data loggers and modems, installed, plus setting up the model, euro. ASSUMPTION. */
  systemCostEur: number
  /** Mobile data, batteries and a yearly calibration visit, euro a year. ASSUMPTION. */
  runningCostEurPerYear: number
  tariffMdlPerM3?: number
}

/** The starting values of the sliders on the Research page and of the numbers in the abstract. All are assumptions. */
export const DEFAULT_ASSUMPTIONS: Omit<LeakEconomicsInput, 'dryHoles'> = {
  /** About the mean of the benchmark's leaks (12.4 L/s), rounded. */
  leakLitresPerSecond: 12,
  costPerDigEur: 800,
  daysPerDig: 0.5,
  /** Half the tariff: a saved cubic metre is not always sold again, but it saves energy, chemicals and a leak's damage. */
  waterValueShare: 0.5,
  leaksPerYear: 4,
  systemCostEur: 12_000,
  runningCostEurPerYear: 1_500,
}

export interface MethodEconomics {
  dryHolesAvoidedPerLeak: number
  savingPerLeakEur: number
  savingPerYearEur: number
  /** Months until the yearly saving has paid for the system; Infinity if it never does. */
  paybackMonths: number
}

export interface LeakEconomics {
  waterLostM3PerDay: number
  waterLostMdlPerDay: number
  /** What one dry hole costs in all: the dig and the water lost while it takes place. */
  dryHoleCostEur: number
  fingerprint: MethodEconomics
  fit: MethodEconomics
}

/** 1 litre per second is 86.4 m3 a day. */
export function litresPerSecondToM3PerDay(litresPerSecond: number): number {
  return (litresPerSecond * SECONDS_PER_DAY) / 1000
}

export function mdlToEur(mdl: number): number {
  return mdl / MDL_PER_EUR
}

/** The average leak of the benchmark: log-uniform between 2 % and 10 % of a 0.25 m3/s demand, in litres per second. */
export function meanBenchmarkLeakLitresPerSecond(demandM3PerSecond = 0.25, min = 0.02, max = 0.1): number {
  return (demandM3PerSecond * 1000 * (max - min)) / Math.log(max / min)
}

export function estimateLeakEconomics(input: LeakEconomicsInput): LeakEconomics {
  const tariff = input.tariffMdlPerM3 ?? WATER_TARIFF_MDL
  const waterLostM3PerDay = litresPerSecondToM3PerDay(input.leakLitresPerSecond)
  const waterLostMdlPerDay = waterLostM3PerDay * tariff * input.waterValueShare
  const dryHoleCostEur = input.costPerDigEur + input.daysPerDig * mdlToEur(waterLostMdlPerDay)

  const method = (dry: number): MethodEconomics => {
    const dryHolesAvoidedPerLeak = input.dryHoles.naive - dry
    const savingPerLeakEur = dryHolesAvoidedPerLeak * dryHoleCostEur
    const savingPerYearEur = savingPerLeakEur * input.leaksPerYear - input.runningCostEurPerYear
    return {
      dryHolesAvoidedPerLeak,
      savingPerLeakEur,
      savingPerYearEur,
      paybackMonths: savingPerYearEur > 0 ? (input.systemCostEur / savingPerYearEur) * 12 : Infinity,
    }
  }

  return { waterLostM3PerDay, waterLostMdlPerDay, dryHoleCostEur, fingerprint: method(input.dryHoles.fingerprint), fit: method(input.dryHoles.fit) }
}

/** Leaks per year at which the saving of `method` just pays for the running costs and the system over `years`. */
export function breakEvenLeaksPerYear(input: LeakEconomicsInput, method: MethodKey, years: number): number {
  if (method === 'naive') return Infinity
  const economics = estimateLeakEconomics({ ...input, leaksPerYear: 1, runningCostEurPerYear: 0 })
  const perLeak = economics[method].savingPerLeakEur
  if (!(perLeak > 0)) return Infinity
  return (input.systemCostEur / years + input.runningCostEurPerYear) / perLeak
}

/** Prices found for the equipment and services the system is compared with. Currencies and dates are as published. */
export interface MarketPrice {
  id: string
  what: string
  price: string
  source: string
  note: string
}

export const MARKET_PRICES: readonly MarketPrice[] = [
  {
    id: 'transmitter',
    what: 'Industrial pressure transmitter, 0-10 bar (Danfoss/DEVI MBS 1700 and MBS 3200)',
    price: 'EUR 165.99 and EUR 215',
    source: 'retailer listings seen in a web search (aio.lv and a second shop); the pages could not be opened to check',
    note: 'Accuracy was not checked against a datasheet. If it is 0.3-0.5 % of full scale (a range typical of low-cost transmitters, not verified here), that is 0.3-0.5 m on 10 bar, and the 0.30 m robustness check is the realistic one.',
  },
  {
    id: 'logger',
    what: 'Pressure data logger with modem',
    price: 'USD 1,095 to 1,925 (currency not stated on the page)',
    source: 'Mait Industries listing on the NSW agtech site, seen in a web search',
    note: 'Australian irrigation market; used only as a rough anchor.',
  },
  {
    id: 'noise-loggers',
    what: 'Commercial acoustic leak-noise logger kits (Primayer Enigma 3)',
    price: 'USD 13,500 for a standard system, USD 22,500 for a hybrid system; 8 loggers USD 14,000 in a 2018 county tender',
    source: 'US retailer listings and a 2018 Calvert County bid tabulation, seen in a web search',
    note: 'A different technique (sound) that finds leaks inside a small area; the two are complements, not rivals.',
  },
  {
    id: 'satellite',
    what: 'Satellite radar leak survey (ASTERRA), including field checks and report',
    price: 'USD 85,500 for 181 miles of pipe (about USD 470 a mile, USD 290 a km)',
    source: 'North Kingstown (Rhode Island) water department report, June 2023, as quoted in a web search; not opened',
    note: 'A one-off survey that finds leaks over a whole network. It does not give a continuous alarm.',
  },
]
