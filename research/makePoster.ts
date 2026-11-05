/**
 * Builds docs/poster/poster-A0.html: an A0 vertical poster (841 x 1189 mm) from the same data as the abstract.
 *
 *   node research/makePoster.ts
 *   chrome --headless --no-pdf-header-footer --print-to-pdf=docs/poster/poster-A0.pdf file:///.../docs/poster/poster-A0.html
 *
 * The QR codes are not drawn here (no QR library is installed): the two addresses are printed large, and two empty
 * frames mark where to place printed QR codes.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { CHISINAU_LOSS_SHARE, MDL_PER_EUR, WATER_TARIFF_MDL } from '../src/utils/leakEconomics.ts'
import { LITRES_PER_PERSON } from '../src/utils/leaks.ts'
import { SCENARIOS } from './config.ts'
import { assertVerdicts, breakEven, dryBars, eur, fmt, h1, h2, known, lei, main, mapSvg, methodOrder, months, names, networkKm, noisy, pct, peoplePerLeakDay, range, savedBars, today, withKnownDemand } from './docs.ts'

assertVerdicts()

const OUT = fileURLToPath(new URL('../docs/poster/poster-A0.html', import.meta.url))
const m = main.methods

const rows = methodOrder
  .map((id) => `<tr><td class="l">${names[id]}</td><td>${fmt(m[id].meanDryHoles.estimate, 2)}</td><td>${pct(m[id].withinThreeDigs)}</td><td>${pct(m[id].neverFound)}</td></tr>`)
  .join('')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>DropWise — poster A0</title>
<style>
  @page { size: 841mm 1189mm; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { width: 841mm; height: 1189mm; font-family: Arial, Helvetica, sans-serif; font-size: 34pt; line-height: 1.25; color: #0b1b3a; background: #fff; }
  header { background: #06184a; color: #fff; padding: 36mm 40mm 30mm; }
  header h1 { font-size: 92pt; line-height: 1.05; margin: 0; letter-spacing: 0.5pt; }
  header p { font-size: 38pt; margin: 14mm 0 0; color: #cfe5ff; }
  .band { display: flex; gap: 20mm; padding: 22mm 40mm; background: #eaf3ff; }
  .band > div { flex: 1; }
  .big { font-size: 110pt; font-weight: bold; color: #1d4f73; line-height: 1; }
  .cap { font-size: 32pt; margin-top: 4mm; }
  main { padding: 20mm 40mm 0; }
  .cols { display: flex; gap: 22mm; }
  .cols > section { flex: 1; min-width: 0; }
  h2 { font-size: 52pt; margin: 0 0 8mm; color: #1d4f73; border-bottom: 3mm solid #5fd3ff; padding-bottom: 3mm; }
  section { margin-bottom: 22mm; }
  p { margin: 0 0 6mm; }
  .badge { display: inline-block; border: 1.5mm solid #b07a3a; color: #7a4d12; border-radius: 12mm; padding: 1mm 8mm; font-weight: bold; font-size: 32pt; margin-left: 4mm; }
  .hyp { border-left: 4mm solid #5fd3ff; padding-left: 8mm; margin-bottom: 10mm; }
  svg { width: 100%; height: auto; display: block; font-family: Arial, Helvetica, sans-serif; }
  table { border-collapse: collapse; width: 100%; font-size: 32pt; margin-bottom: 6mm; }
  th, td { border: 0.8mm solid #0b1b3a; padding: 2mm 5mm; text-align: center; }
  td.l, th.l { text-align: left; }
  th { background: #eaf3ff; }
  ul { margin: 0; padding-left: 12mm; }
  li { margin-bottom: 4mm; }
  .qr { display: flex; gap: 14mm; align-items: center; }
  .qr .frame { width: 90mm; height: 90mm; border: 1mm dashed #cfe5ff; flex: none; display: flex; align-items: center; justify-content: center; font-size: 22pt; text-align: center; color: #cfe5ff; }
  footer { position: absolute; left: 0; right: 0; bottom: 0; background: #06184a; color: #fff; padding: 14mm 40mm; font-size: 28pt; }
  footer b { color: #5fd3ff; }
  .url { font-size: 38pt; font-weight: bold; word-break: break-all; }
  svg.dry text { font-size: 12.5px; }
  svg.saved text { font-size: 14px; }
  svg.net text { font-size: 18px; }
</style>
</head>
<body>
<header>
  <h1>Can a model find a water leak faster than guessing?</h1>
  <p>DropWise · Nicole Puzur (Grade 12) · Supervisor: Azamat Jayush · Software Development / Water</p>
</header>

<div class="band">
  <div><div class="big">${pct(CHISINAU_LOSS_SHARE)}</div><div class="cap">of the water taken in by Chișinău was accepted as lost in the network in the 2026 tariff calculation</div></div>
  <div><div class="big">${fmt(today.waterLostM3PerDay)} m³</div><div class="cap">a day from one 12 L/s leak: the daily drinking water of about ${fmt(peoplePerLeakDay)} people (${LITRES_PER_PERSON} L each)</div></div>
</div>

<main>
<div class="cols">
  <section>
    <h2>Question and hypotheses</h2>
    <p>A leak opens and only four pressure sensors can see it. How many wasted digs (“dry holes”) does a crew need, and does a hydraulic model of the network help? Written down <b>before any method was run</b> (Git history shows the order).</p>
    <div class="hyp"><b>H1</b> Model fitting needs at least ${pct(h1.target, 0)} fewer dry holes than the naive rule.<span class="badge">PARTIALLY SUPPORTED</span><br>Observed ${pct(h1.reduction.estimate)} fewer (95% interval ${range(h1.reduction.low, h1.reduction.high)}).</div>
    <div class="hyp"><b>H2</b> The cheap fingerprint method is within ${fmt(h2.marginShare * 100)} points of model fitting and ${h2.requiredSpeedUp} times faster.<span class="badge">PARTIALLY SUPPORTED</span><br>${fmt(h2.speedUp)} times faster, but the gap is ${fmt(h2.gapFitMinusFingerprint.estimate * 100, 1)} points (upper bound ${fmt(h2.gapFitMinusFingerprint.high * 100, 1)}).</div>
    <p><b>The targets were missed and were not changed afterwards.</b></p>

    <h2>Method</h2>
    <svg class="net" viewBox="0 0 1000 560" style="border:1mm solid #0b1b3a">${mapSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</svg>
    <p style="margin-top:6mm">A simulated city: ${fmt(networkKm, 1)} km of pipe, 14 junctions, 6 loops, 4 pressure sensors (squares). Hazen–Williams hydraulics, Global Gradient Algorithm. ${fmt(SCENARIOS.main)} random leaks of 5–25 L/s; the methods do not know the real demand (±10% per junction); sensor error 0.10 m. Four methods choose where to dig, with the same crew rule.</p>
  </section>

  <section>
    <h2>Results</h2>
    <svg class="dry" viewBox="0 0 360 126">${dryBars()}</svg>
    <p class="cap" style="font-size:26pt">Mean dry holes before the leak is found (95% interval); fewer is better; 10 = not found.</p>
    <table>
      <tr><th class="l">Method</th><th>Dry holes</th><th>Within 3 digs</th><th>Never found</th></tr>
      ${rows}
    </table>
    <p>Model fitting never found <b>${pct(m.fit.neverFound)}</b> of the leaks in 10 digs. Fingerprints take 0.03 ms; model fitting takes ${fmt(m.fit.medianMilliseconds)} ms.</p>

    <h2>What decides the result</h2>
    <svg class="saved" viewBox="0 0 640 168">${savedBars()}</svg>
    <p style="margin-top:6mm">Dry holes saved against the naive rule. With demand known exactly, fingerprints save <b>${pct(known.reductionVersusNaive.fingerprint.estimate, 0)}</b>; with twice the uncertainty, <b>${pct(noisy.reductionVersusNaive.fingerprint.estimate, 0)}</b>. <b>Knowing the demand matters more than the algorithm.</b></p>
  </section>
</div>

<div class="cols">
  <section>
    <h2>Money, in lei and euro</h2>
    <table>
      <tr><th class="l"></th><th>Today</th><th>Demand known</th></tr>
      <tr><td class="l">One dry hole</td><td colspan="2">${eur(today.dryHoleCostEur)} (${lei(today.dryHoleCostEur * MDL_PER_EUR)})</td></tr>
      <tr><td class="l">Payback, model fitting</td><td>${months(today.fit.paybackMonths)}</td><td>${months(withKnownDemand.fit.paybackMonths)}</td></tr>
      <tr><td class="l">Payback, fingerprints</td><td>${months(today.fingerprint.paybackMonths)}</td><td>${months(withKnownDemand.fingerprint.paybackMonths)}</td></tr>
    </table>
    <p>Tariff ${fmt(WATER_TARIFF_MDL, 2)} lei/m³ (ANRE, 4 Aug 2026); €1 = ${fmt(MDL_PER_EUR, 2)} lei (BNM, 5 Nov 2026). A €12,000 system, 4 large leaks a year; break-even ${fmt(breakEven, 1)} leaks a year for a five-year payback. <b>The dig cost, leaks per year and system cost are assumptions.</b></p>
  </section>
  <section>
    <h2>Limits and honesty</h2>
    <ul>
      <li>A simulation of a drawn network: no real leaks, sensors or Moldovan data.</li>
      <li>The model is assumed exact; one leak; steady flow.</li>
      <li>Low-cost transmitters (±0.5–1% of full scale = 0.5–1 m on 10 bar) are noisier than the 0.10 m assumed.</li>
      <li>Next: a real district, a flow meter at the plant, several leaks.</li>
    </ul>
  </section>
</div>
</main>

<footer>
  <div class="qr">
    <div class="frame">QR: live site</div>
    <div class="frame">QR: source code</div>
    <div>
      <div class="url">drop-wise-s8pt.vercel.app</div>
      <div class="url">github.com/nicolepuzur/DropWise</div>
      <div style="margin-top:6mm"><b>AI cited:</b> Claude Code (Anthropic), model claude-sonnet-5-5 — every prompt and what was checked: docs/AI_USAGE.md. Code MIT-licensed.</div>
    </div>
  </div>
</footer>
</body>
</html>
`

await mkdir(fileURLToPath(new URL('../docs/poster/', import.meta.url)), { recursive: true })
await writeFile(OUT, html)
console.log(`wrote ${OUT}`)
