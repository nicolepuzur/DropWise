/**
 * Builds the two MoldSEF documents from the benchmark results and the cost model, so that no number in them is typed
 * by hand:  docs/moldsef/abstract.html (2 pages)  and  docs/moldsef/visual-annex.html (1 page).
 * The prose was written for the verdicts the benchmark produced; `assertVerdicts` stops the build if a re-run
 * changed them, so the text can never say the opposite of the data.
 */
import benchmark from './results/benchmark.json' with { type: 'json' }
import { GRAPH } from '../src/utils/network/graph.ts'
import { PIPES, PLANT, NETWORK_H, NETWORK_W, LITRES_PER_PERSON } from '../src/utils/leaks.ts'
import { DEFAULT_ASSUMPTIONS, MARKET_PRICES, MDL_PER_EUR, WATER_TARIFF_MDL, CHISINAU_LOSS_SHARE, breakEvenLeaksPerYear, estimateLeakEconomics, type MethodKey } from '../src/utils/leakEconomics.ts'
import { SCENARIOS } from './config.ts'
import amendment from './results/amendment-1.json' with { type: 'json' }

/** Numbers as in English text, with a real minus sign. */
const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).replace('-', '−')
const pct = (x: number, d = 1) => `${fmt(x * 100, d)}%`
const range = (low: number, high: number, d = 1) => `${fmt(low * 100, d)}% to ${fmt(high * 100, d)}%`

const main = benchmark.main
const h1 = benchmark.hypotheses.h1
const h2 = benchmark.hypotheses.h2
const known = benchmark.robustness.find((c) => c.condition.demandFactor === 0)!
const noisy = benchmark.robustness.find((c) => c.condition.demandFactor === 2)!
const lowNoise = benchmark.robustness.find((c) => c.condition.noiseM === 0.03)!
const highNoise = benchmark.robustness.find((c) => c.condition.noiseM === 0.3)!
const three = benchmark.robustness.find((c) => c.condition.sensorCount === 3)!
const six = benchmark.robustness.find((c) => c.condition.sensorCount === 6)!
const largeLeaks = benchmark.subgroups.find((g) => g.label.startsWith('large'))!
const mainLine = benchmark.subgroups.find((g) => g.label.startsWith('leak on the main line'))!

export function assertVerdicts(): void {
  if (h1.verdict !== 'partially supported' || h2.verdict !== 'partially supported') {
    throw new Error(`The prose of the abstract was written for two "partially supported" verdicts, but the benchmark gives H1 "${h1.verdict}" and H2 "${h2.verdict}". Rewrite the text of research/docs.ts first.`)
  }
}

const dryOf = (e: { methods: Record<string, { meanDryHoles: { estimate: number } }> }): Record<MethodKey, number> => ({
  naive: e.methods.naive.meanDryHoles.estimate,
  fingerprint: e.methods.fingerprint.meanDryHoles.estimate,
  fit: e.methods.fit.meanDryHoles.estimate,
})
const today = estimateLeakEconomics({ ...DEFAULT_ASSUMPTIONS, dryHoles: dryOf(main) })
const withKnownDemand = estimateLeakEconomics({ ...DEFAULT_ASSUMPTIONS, dryHoles: dryOf(known) })
const breakEven = breakEvenLeaksPerYear({ ...DEFAULT_ASSUMPTIONS, dryHoles: dryOf(main) }, 'fit', 5)
const months = (m: number) => (Number.isFinite(m) ? `${fmt(m, 0)} months` : 'never')
const eur = (x: number) => `€${fmt(x)}`
const lei = (x: number) => `${fmt(x)} lei`
const peoplePerLeakDay = Math.round((today.waterLostM3PerDay * 1000) / LITRES_PER_PERSON)
const satellitePerKm = 85_500 / (181 * 1.609344)
const networkKm = (GRAPH.pipes.reduce((s, p) => s + p.length, 0) * 4) / 1000

const m = main.methods
const names = { random: 'Random order', naive: 'Naive threshold', fingerprint: 'Fingerprint matching', fit: 'Model fitting' } as const
const methodOrder = ['random', 'naive', 'fingerprint', 'fit'] as const

const resultRows = methodOrder
  .map((id) => {
    const s = m[id]
    const ms = s.medianMilliseconds
    const time = ms < 1 ? `${fmt(ms * 1000)} µs` : ms < 100 ? `${fmt(ms, 1)} ms` : `${fmt(ms)} ms`
    return `<tr><td class="l">${names[id]}</td><td>${fmt(s.meanDryHoles.estimate, 2)} (${fmt(s.meanDryHoles.low, 2)}–${fmt(s.meanDryHoles.high, 2)})</td><td>${pct(s.firstDigFinds)}</td><td>${pct(s.withinThreeDigs)}</td><td>${pct(s.neverFound)}</td><td>${time}</td></tr>`
  })
  .join('\n')

export function abstractHtml(): string {
  assertVerdicts()
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DropWise — MoldSEF abstract</title>
<style>
  @page { size: A4; margin: 2cm; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.15; color: #000; text-align: justify; }
  h1, h2, p, table, ol { font-size: 12pt; margin: 0; }
  h1 { text-align: center; font-weight: bold; margin-bottom: 2pt; }
  h2 { font-weight: bold; margin-top: 6pt; }
  .byline { text-align: center; margin-bottom: 3pt; }
  p { margin-bottom: 3pt; }
  table { border-collapse: collapse; width: 100%; margin: 3pt 0; text-align: center; }
  th, td { border: 0.5pt solid #000; padding: 0 3pt; font-weight: normal; }
  th { font-weight: bold; }
  td.l, th.l { text-align: left; }
  caption { caption-side: top; text-align: left; font-weight: bold; padding-bottom: 1pt; }
  ol { padding-left: 1.6em; text-align: left; }
  li { margin-bottom: 0; }
</style>
</head>
<body>

<h1>DropWise: locating a water-network leak from a few pressure sensors — a pre-registered simulation benchmark and cost model</h1>
<p class="byline">Nicole Puzur (Grade 12) · Supervisor: Azamat Jayush · Software Development / Water</p>

<h2>1. Aim and hypotheses</h2>
<p>Old water networks lose a large share of their water: in the 2026 tariff calculation for Chișinău, losses of ${pct(CHISINAU_LOSS_SHARE)} of the water taken in were accepted [6]. Pressure sensors are cheap, but a crew that digs where the biggest pressure drop appears may open many dry holes before it finds the leak. We tested whether a hydraulic model of the network reduces this waste. The hypotheses and decision rules were fixed before any method was run (repository file <i>research/PREREGISTRATION.md</i>, committed before the code that tests it). <b>H1:</b> model fitting needs at least ${pct(h1.target, 0)} fewer dry holes than the naive rule (dig near the sensor with the largest pressure drop) over N = ${fmt(main.condition.scenarios)} random leaks. <b>H2:</b> a simple fingerprint method finds the leak within three digs no more than ${fmt(h2.marginShare * 100)} percentage points less often than model fitting (upper end of the 95% interval at most ${fmt(h2.marginShare * 100)} points) and is at least ${h2.requiredSpeedUp} times faster. A hypothesis is supported only if the estimate reaches the target and the 95% bootstrap interval excludes zero.</p>

<h2>2. Methodology</h2>
<p><b>Simulator.</b> The pipes of the project's leak hunter form a graph of ${GRAPH.nodes.length} junctions and ${GRAPH.pipes.length} pipes with ${GRAPH.pipes.length - GRAPH.nodes.length + 1} loops (${fmt(networkKm, 1)} km; 1 map unit = 4 m). Steady flow is solved with Hazen–Williams head loss and the Global Gradient Algorithm [1] (20 unit tests: mass balance at every junction, the head-loss law in every pipe). A leak is an orifice, q = k√h. <b>Scenarios.</b> One leak per scenario, at a random place along the pipes, losing 5–25 L/s (2–10% of a 0.25 m³/s demand). The methods do not know the real demand (±10% per junction, ±5% overall). Four pressure sensors sit at junctions chosen by a fixed rule, with error σ = 0.10 m. A dig finds the leak if it lands within 40 map units (160 m). <b>Methods.</b> Each ranks 170 candidate places; the same crew digs down the list (at most 10 digs): random order; naive threshold; <i>fingerprint matching</i> (cosine similarity between the readings and pre-computed leak signatures); <i>model fitting</i> (Levenberg–Marquardt fit of leak size and overall demand with the full hydraulic model at every place; cf. [2, 3]). <b>Statistics.</b> Paired bootstrap, 2,000 resamples. The benchmark seed (2027) was used once; debugging used another seed. <b>Limits.</b> A simulation of a drawn network with an exact model, one leak, steady flow and no real field data.</p>

<h2>3. Quantitative benchmark results</h2>
<table>
<caption>Table 1. Dry holes before the leak is found (N = ${fmt(main.condition.scenarios)}; 10 = not found within 10 digs)</caption>
<tr><th class="l">Method</th><th>Dry holes (95% CI)</th><th>Found at 1st dig</th><th>Within 3 digs</th><th>Never found</th><th>Time per leak</th></tr>
${resultRows}
</table>
<p><b>H1 is partially supported:</b> model fitting needed ${pct(h1.reduction.estimate)} fewer dry holes than the naive rule (95% interval ${range(h1.reduction.low, h1.reduction.high)}), far below the ${pct(h1.target, 0)} target although the interval excludes zero. <b>H2 is partially supported:</b> the fingerprint method was ${fmt(h2.speedUp)} times faster (${fmt(m.fingerprint.medianMilliseconds, 2)} ms against ${fmt(m.fit.medianMilliseconds)} ms) but found the leak within three digs ${fmt(h2.gapFitMinusFingerprint.estimate * 100, 1)} points less often than model fitting, with an upper bound of ${fmt(h2.gapFitMinusFingerprint.high * 100, 1)} points, above the ${fmt(h2.marginShare * 100)}-point margin. <b>Robustness</b> (${SCENARIOS.sweep} leaks each, one change at a time) shows what limits the result: the saving against the naive rule is ${pct(known.reductionVersusNaive.fingerprint.estimate)} for fingerprints and ${pct(known.reductionVersusNaive.fit.estimate)} for model fitting when demand is known exactly, but only ${pct(noisy.reductionVersusNaive.fingerprint.estimate)} and ${pct(noisy.reductionVersusNaive.fit.estimate)} when it is twice as uncertain. Model fitting saves ${pct(lowNoise.reductionVersusNaive.fit.estimate)} with 0.03 m sensors and ${pct(highNoise.reductionVersusNaive.fit.estimate)} with 0.30 m sensors (interval ${range(highNoise.reductionVersusNaive.fit.low, highNoise.reductionVersusNaive.fit.high)}), ${pct(three.reductionVersusNaive.fit.estimate)} with three sensors and ${pct(six.reductionVersusNaive.fit.estimate)} with six, ${pct(largeLeaks.reductionVersusNaive.fit.estimate)} for the largest third of the leaks. A leak on the main line next to the plant is the hardest case (naive rule ${fmt(mainLine.meanDryHoles.naive, 1)} dry holes, worse than random order). Model fitting failed to find ${pct(m.fit.neverFound)} of the leaks within ten digs. With demand known, the simple fingerprint method beat model fitting (${fmt(known.methods.fingerprint.meanDryHoles.estimate, 2)} against ${fmt(known.methods.fit.meanDryHoles.estimate, 2)} dry holes). In an exploratory follow-up on a fresh seed (Amendment 1, ${fmt(amendment.demandKnown.scenarios)} leaks), fixing the demand factor needed ${pct(amendment.h4.reduction.estimate)} fewer dry holes than model fitting (interval ${range(amendment.h4.reduction.low, amendment.h4.reduction.high)}), so the fitted factor does absorb sensor noise when demand is known.</p>

<h2>4. Economic and social applicability</h2>
<p><b>Money, in lei and euro.</b> Tariff ${fmt(WATER_TARIFF_MDL, 2)} lei/m³ (Apă-Canal Chișinău; ANRE press release of 4 August 2026 [4], which gives no date of effect or VAT status); €1 = ${fmt(MDL_PER_EUR, 2)} lei [5]. The average benchmark leak (${DEFAULT_ASSUMPTIONS.leakLitresPerSecond} L/s) loses ${fmt(today.waterLostM3PerDay)} m³ a day, which is ${lei(today.waterLostMdlPerDay / DEFAULT_ASSUMPTIONS.waterValueShare)} at the full tariff and the daily drinking water of about ${fmt(peoplePerLeakDay)} people (${LITRES_PER_PERSON} L each). Valuing a saved m³ at half the tariff, a dig at ${eur(DEFAULT_ASSUMPTIONS.costPerDigEur)} and half a day per dig, one dry hole costs ${eur(today.dryHoleCostEur)} (${lei(today.dryHoleCostEur * MDL_PER_EUR)}). Model fitting avoids ${fmt(today.fit.dryHolesAvoidedPerLeak, 2)} dry holes per leak, saving ${eur(today.fit.savingPerLeakEur)}; with ${DEFAULT_ASSUMPTIONS.leaksPerYear} large leaks a year and ${eur(DEFAULT_ASSUMPTIONS.runningCostEurPerYear)} a year of running costs, a ${eur(DEFAULT_ASSUMPTIONS.systemCostEur)} system of four loggers pays back in ${months(today.fit.paybackMonths)} (fingerprints: ${months(today.fingerprint.paybackMonths)}); ${fmt(breakEven, 1)} large leaks a year give a five-year payback. If customer demand were known, for example from smart meters, the payback falls to ${months(withKnownDemand.fingerprint.paybackMonths)} (fingerprints) and ${months(withKnownDemand.fit.paybackMonths)} (model fitting). <b>Comparison.</b> Retail listings put a 0–10 bar transmitter at €${fmt(165.99, 2)}–€215 and a logger with modem at US$1,095–1,925; acoustic-logger kits cost US$13,500–22,500; a satellite survey about US$${fmt(satellitePerKm)} per km (about US$${fmt(satellitePerKm * networkKm)} for this network, a one-off survey rather than a continuous alarm). These prices were seen in web searches and several pages could not be opened. <b>Assumptions.</b> The cost of a dig, days per dig, leaks per year and the system cost are assumptions without a source and are the weakest part of the estimate; they are sliders on the project's Research page. A low-cost transmitter is noisier than assumed: the Danfoss MBS 3200 datasheet gives ±0.5% of full scale typical, ±1.0% maximum (0.5–1.0 m on 10 bar) against the 0.10 m of the main experiment, so the 0.30 m result is the more realistic one.</p>

<h2>5. Conclusions</h2>
<p>With realistic uncertainty (demand ±10% per junction, 0.10 m sensors, four sensors) a hydraulic model finds a leak only modestly better than a simple rule, far from the pre-registered target. The limiting factor is not the algorithm but what is unknown: when demand is known, even the cheap fingerprint method saves ${pct(known.reductionVersusNaive.fingerprint.estimate, 0)} of the dry holes and pays back in about ${fmt(withKnownDemand.fingerprint.paybackMonths / 12, 1)} years at the assumed costs. A utility should therefore invest in demand data and low-noise sensors before complex algorithms. Next steps: calibrate the model on a real Moldovan district, add a flow measurement at the plant and several simultaneous leaks, and replace the cost assumptions with figures from the operator.</p>

<h2>References</h2>
<ol>
<li>Todini E., Pilati S. A gradient algorithm for the analysis of pipe networks. In: Coulbeck B., Orr C.H., eds. Computer Applications in Water Supply, vol. 1. Research Studies Press; 1988:1–20.</li>
<li>Pérez R., Sanz G., Puig V., Quevedo J., et al. Leak localization in water networks: a model-based methodology using pressure sensors applied to a real network in Barcelona. IEEE Control Syst Mag 2014;34(4):24–36.</li>
<li>Pérez R., Puig V., Pascual J., Quevedo J., Landeros E., Peralta A. Methodology for leakage isolation using pressure sensitivity analysis in water distribution networks. Control Eng Pract 2011;19(10):1157–1167.</li>
<li>ANRE (National Energy Regulatory Agency, Moldova). Press release: new tariffs for public water supply and sewerage services approved at the public session of 4 August 2026. anre.md.</li>
<li>National Bank of Moldova. Official exchange rate, 5 November 2026: 1 EUR = 20.1773 MDL. bnm.md.</li>
<li>Logos Press. Tarifele la apă și canalizare cresc pentru locuitorii municipiului Chișinău (reports losses of 17.25 million m³, 25.9% of the water taken in, in the tariff calculation), 4 August 2026.</li>
</ol>
<p><b>Availability.</b> Code, pre-registration, results and logbook are in the project repository (<i>research/</i>, <i>docs/moldsef/</i>); every number above is produced by <i>research/benchmark.ts</i> and <i>src/utils/leakEconomics.ts</i> through <i>research/docs.ts</i>.</p>

</body>
</html>
`
}

/** Pieces the poster builder reuses, so that the poster and the documents quote the same numbers. */
export { fmt, pct, range, eur, lei, months, names, methodOrder, main, known, noisy, h1, h2, today, withKnownDemand, breakEven, peoplePerLeakDay, networkKm }

// ---- visual annex ---------------------------------------------------------------------------------------------------

const COLORS = { random: '#8c8c8c', naive: '#b07a3a', fingerprint: '#2f6f96', fit: '#1d4f73' } as const

export function mapSvg(): string {
  const pipes = PIPES.map((p) => `<line x1="${p.x1}" y1="${p.y1}" x2="${p.x2}" y2="${p.y2}"/>`).join('')
  const sensors = benchmark.meta.sensorJunctions
    .map((node) => {
      const p = GRAPH.nodes[node]
      return `<rect x="${p.x - 11}" y="${p.y - 11}" width="22" height="22" fill="#1d4f73" stroke="#000" stroke-width="2"/>`
    })
    .join('')
  const nodes = GRAPH.nodes.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="5" fill="#fff" stroke="#000" stroke-width="2"/>`).join('')
  return `<svg viewBox="0 0 ${NETWORK_W} ${NETWORK_H}" style="border:0.5pt solid #000"><g stroke="#555" stroke-width="7" stroke-linecap="round">${pipes}</g>${nodes}${sensors}<circle cx="${PLANT.x}" cy="${PLANT.y}" r="20" fill="#2f6f96" stroke="#000" stroke-width="2"/><text x="${PLANT.x}" y="${PLANT.y + 46}" text-anchor="middle" font-size="26">plant</text></svg>`
}

export function dryBars(): string {
  const maxV = 10
  return methodOrder
    .map((id, i) => {
      const s = m[id].meanDryHoles
      const y = 12 + i * 30
      const w = (s.estimate / maxV) * 190
      const lo = (s.low / maxV) * 190
      const hi = (s.high / maxV) * 190
      return `<text x="0" y="${y + 13}" font-size="11">${names[id]}</text><rect x="118" y="${y}" width="${w.toFixed(1)}" height="18" fill="${COLORS[id]}"/><line x1="${118 + lo}" x2="${118 + hi}" y1="${y + 9}" y2="${y + 9}" stroke="#000" stroke-width="1.4"/><text x="${(122 + hi).toFixed(1)}" y="${y + 13}" font-size="11">${fmt(s.estimate, 2)}</text>`
    })
    .join('')
}

export function savedBars(): string {
  const rows = [
    { label: 'Main experiment', e: main },
    { label: 'Sensor error 0.03 m', e: lowNoise },
    { label: 'Sensor error 0.30 m', e: highNoise },
    { label: '3 sensors', e: three },
    { label: '6 sensors', e: six },
    { label: 'Demand known (×0)', e: known },
    { label: 'Demand ×2', e: noisy },
  ]
  const x0 = 130
  const scale = 400 / 0.6
  const zero = x0 + 0.1 * scale
  const bar = (v: { estimate: number; low: number; high: number }, y: number, color: string) => {
    const x = v.estimate >= 0 ? zero : zero + v.estimate * scale
    return `<rect x="${x.toFixed(1)}" y="${y}" width="${(Math.abs(v.estimate) * scale).toFixed(1)}" height="7" fill="${color}"/><line x1="${(zero + v.low * scale).toFixed(1)}" x2="${(zero + v.high * scale).toFixed(1)}" y1="${y + 3.5}" y2="${y + 3.5}" stroke="#000" stroke-width="1"/>`
  }
  const body = rows
    .map((r, i) => {
      const y = 8 + i * 22
      return `<text x="0" y="${y + 11}" font-size="10.5">${r.label}</text>${bar(r.e.reductionVersusNaive.fingerprint, y, COLORS.fingerprint)}${bar(r.e.reductionVersusNaive.fit, y + 8, COLORS.fit)}`
    })
    .join('')
  return `<line x1="${zero}" x2="${zero}" y1="0" y2="${rows.length * 22 + 6}" stroke="#000" stroke-width="0.8"/>${body}
<rect x="440" y="150" width="9" height="7" fill="${COLORS.fingerprint}"/><text x="453" y="157" font-size="10">Fingerprint</text><rect x="520" y="150" width="9" height="7" fill="${COLORS.fit}"/><text x="533" y="157" font-size="10">Model fitting</text>`
}

export function annexHtml(): string {
  assertVerdicts()
  const costRows = [
    ['Dry hole (dig + water lost while it takes place)', eur(today.dryHoleCostEur), lei(today.dryHoleCostEur * MDL_PER_EUR)],
    ['Saved per leak: fingerprints / model fitting, today', `${eur(today.fingerprint.savingPerLeakEur)} / ${eur(today.fit.savingPerLeakEur)}`, `${lei(today.fingerprint.savingPerLeakEur * MDL_PER_EUR)} / ${lei(today.fit.savingPerLeakEur * MDL_PER_EUR)}`],
    ['Payback of a €12,000 system, today', `${months(today.fingerprint.paybackMonths)} / ${months(today.fit.paybackMonths)}`, `4 large leaks a year`],
    ['Payback if demand were known', `${months(withKnownDemand.fingerprint.paybackMonths)} / ${months(withKnownDemand.fit.paybackMonths)}`, `smart meters needed`],
    ['Water lost by one leak, per day', `${fmt(today.waterLostM3PerDay)} m³`, `${lei(today.waterLostMdlPerDay / DEFAULT_ASSUMPTIONS.waterValueShare)} at ${fmt(WATER_TARIFF_MDL, 2)} lei/m³`],
  ]
    .map(([a, b, c]) => `<tr><td class="l">${a}</td><td>${b}</td><td>${c}</td></tr>`)
    .join('\n')
  const prices = MARKET_PRICES.map((p) => p.what.split('(')[0].trim() + ': ' + p.price.split(';')[0]).join(' · ')
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DropWise — visual annex</title>
<style>
  @page { size: A4; margin: 1.5cm 1.8cm; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.15; color: #000; }
  h1 { font-size: 13pt; margin: 0 0 3pt; text-align: center; }
  h2 { font-size: 12pt; margin: 7pt 0 2pt; }
  p { margin: 0 0 2pt; }
  svg { width: 100%; height: auto; display: block; font-family: "Times New Roman", Times, serif; }
  .row { display: flex; gap: 12pt; align-items: flex-start; }
  .row > div { flex: 1; }
  table { border-collapse: collapse; width: 100%; font-size: 11pt; }
  th, td { border: 0.5pt solid #000; padding: 0 4pt; text-align: center; }
  td.l, th.l { text-align: left; }
  .note { font-size: 10pt; }
</style>
</head>
<body>
<h1>DropWise — visual annex</h1>

<h2>Figure 1. How the experiment is built</h2>
<svg viewBox="0 0 700 92" font-size="11">
  <defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#333"/></marker></defs>
  <g stroke="#333" fill="#eef2f5">
    <rect x="4" y="22" width="120" height="44" rx="4"/><rect x="162" y="22" width="120" height="44" rx="4"/><rect x="320" y="22" width="120" height="44" rx="4"/><rect x="478" y="22" width="100" height="44" rx="4"/><rect x="606" y="22" width="90" height="44" rx="4"/>
  </g>
  <g text-anchor="middle">
    <text x="64" y="40">Pipe graph</text><text x="64" y="55" font-size="10">14 junctions, 19 pipes</text>
    <text x="222" y="40">Hydraulic model</text><text x="222" y="55" font-size="10">Hazen-Williams + GGA</text>
    <text x="380" y="40">1,000 random leaks</text><text x="380" y="55" font-size="10">noise + unknown demand</text>
    <text x="528" y="40">4 methods</text><text x="528" y="55" font-size="10">same crew rule</text>
    <text x="651" y="40">Research page</text><text x="651" y="55" font-size="10">benchmark.json</text>
  </g>
  <g stroke="#333" stroke-width="1.4" marker-end="url(#a)" fill="none"><line x1="124" y1="44" x2="160" y2="44"/><line x1="282" y1="44" x2="318" y2="44"/><line x1="440" y1="44" x2="476" y2="44"/><line x1="578" y1="44" x2="604" y2="44"/></g>
</svg>

<div class="row">
  <div>
    <h2>Figure 2. The network and its four sensors</h2>
    ${mapSvg()}
    <p class="note">Squares: pressure sensors. Circles: junctions. ${fmt(networkKm, 1)} km of pipe.</p>
  </div>
  <div>
    <h2>Figure 3. Mean dry holes (95% CI), ${fmt(main.condition.scenarios)} leaks</h2>
    <svg viewBox="0 0 360 126">${dryBars()}</svg>
    <p class="note">Fewer is better; 10 = not found. Pre-registered targets: H1 partially supported, H2 partially supported.</p>
  </div>
</div>

<h2>Figure 4. Dry holes saved against the naive rule, by condition (95% CI)</h2>
<svg viewBox="0 0 640 168">${savedBars()}</svg>
<p class="note">The saving depends most on how well demand is known. Each condition uses ${SCENARIOS.sweep} leaks; the main experiment uses ${fmt(SCENARIOS.main)}.</p>

<h2>Table 1. Cost and payback (assumptions on the Research page)</h2>
<table>
<tr><th class="l">Item</th><th>Euro</th><th>Lei / note</th></tr>
${costRows}
</table>
<p class="note">Rate €1 = ${fmt(MDL_PER_EUR, 2)} lei. Equipment prices: ${prices}. They were seen in web searches and several pages could not be opened.</p>
</body>
</html>
`
}
