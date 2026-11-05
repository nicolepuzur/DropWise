# Laboratory logbook — DropWise

**Student:** Nicole Puzur (Grade 12) · **Supervisor:** Azamat Jayush · **Project:** DropWise, locating a water-network leak from pressure sensors

> **How this file was made.** Entries 1–3 were reconstructed on 2026-11-05 from the project's Git history (every hash below is a real commit; dates are commit dates). Entries 4–10 record work done on 2026-11-05 with the AI coding assistant Claude Code (model `claude-sonnet-5-5`), in a session whose prompts were typed by a classmate who is helping the student. The columns *Student check* are **left empty on purpose**: the student has to fill them in after personally re-running and reading the item. The layout should be checked against the official MoldSEF Template B, which was not available when this file was written.

## A. Reconstructed history (from Git)

| # | Date | Commits | Objective | What was done | Result | AI assistance | Student check |
|---|---|---|---|---|---|---|---|
| 1 | 2026-10-27 | `2f703fc` | First version | A website on drinking-water scarcity with five small interactive models (irrigation, reuse, desalination, leaks, home); React + TypeScript; three languages; 52 unit tests; deployed to Vercel | Live app | Claude Code wrote the code, scenes, tests and text from the student's brief | ☐ |
| 2 | 2026-10-27 | `12a9e21` | Meet the Infomatrix rules | Team credit, design plan, PDF documentation, AI usage log, submission guide | Rules checklist in the README | Claude Code drafted the documents | ☐ |
| 3 | 2026-10-28 | `9a90586`, `48962c3` | Checks and fixes | Automated layout check in three languages at desktop and phone size found four layout problems, fixed; live address added to the README | No sideways scrolling, no console errors | Claude Code ran the checks and fixed the problems | ☐ |

## B. Entries for the competition upgrade (2026-11-05)

Trigger: the supervisor's evaluation of Submission #1 (score 62%, 6/10). It asked for a testable hypothesis and a benchmark of 2–3 algorithms over N ≥ 100 runs (for example a pipe-graph hydraulic simulator and leak-localisation methods in place of the six hard-coded leaks), a Moldovan economic analysis in MDL/EUR, and the MoldSEF documents.

### Entry 4 — Reading the evaluation and choosing the experiment

| Item | Detail |
|---|---|
| Objective | Choose which of the two suggested upgrades (leaks or irrigation) to build |
| Method | Read `leaks.ts`, `irrigation.ts` and `desal.ts`. The leak hunter already has a pipe network, "dry holes" and sensors, so a hydraulic model plugs straight into it; irrigation would need weather downloads and a modelled, not measured, ground truth. Decision: **leaks** |
| Result | Question: *if a leak opens and only a few pressure sensors can see it, how many wasted digs does a crew need, and does a model of the network shrink that number?* |
| AI assistance | Claude Code read the code and proposed the experiment; the student's side chose to go ahead with it |
| Student check | ☐ read the evaluation e-mail again and tick each of its four points against this logbook |

### Entry 5 — Hydraulic simulator (commit `574cbb5`)

| Item | Detail |
|---|---|
| Objective | A model that gives the pressure at every junction of the pipe network, with and without a leak |
| Method | `src/utils/network/graph.ts` turns the drawn pipes into a graph (14 junctions, 19 pipes, 6 loops, 13.4 km at 4 m per map unit). `hydraulics.ts` solves steady flow with Hazen-Williams head loss and the Global Gradient Algorithm (Todini and Pilati 1988, the method of EPANET): guess the flows, replace every pipe law by its tangent, solve one small linear system, repeat. A leak is an orifice, q = k·√head |
| Evidence | 20 tests: mass balance at every junction, the head-loss law in every pipe, a single pipe against the formula, two parallel pipes sharing the flow, leaks lowering the pressure. Solves in 7 iterations, about 0.09 ms |
| Failure cases | Two of my test expectations were wrong, not the code: a drawing of two crossing pipes has 4 pipe stretches, not 3; and the biggest pressure drop after a leak is at one of the two ends of the leaking pipe, not at "the nearest junction to the leak" in general. Both tests were rewritten from the physics |
| Design choice | Pipe diameters were changed once, before any method existed: from 0.5/0.3/0.25 m to 0.4/0.25/0.2 m, so that the lowest pressure of the quiet network is 40.9 m (a realistic service pressure) instead of 53.4 m. I looked at the quiet network and at three hand-picked leaks only |
| AI assistance | Claude Code wrote the code and the tests; the formulas are from the cited papers and standard hydraulics |
| Student check | ☐ read `hydraulics.ts` and explain in your own words what one iteration does ☐ re-ran `npm test` |

### Entry 6 — Pre-registration (commit `574cbb5`, before any method)

| Item | Detail |
|---|---|
| Objective | Write the hypotheses and decision rules before anything can influence them |
| Method | `research/PREREGISTRATION.md`: H1 (model fitting needs ≥ 50% fewer dry holes than the naive rule), H2 (fingerprints within 5 points of model fitting and ≥ 10 × faster), the simulated world, four methods, the crew protocol, statistics, robustness checks, stated limits. `research/config.ts` holds the same numbers and a test checks the document against it |
| Evidence | The commit that adds the pre-registration (`574cbb5`) is earlier in Git than the commit that adds the methods (`cd23693`) and the one that adds the results |
| AI assistance | Claude Code drafted the text from the evaluation's wording. **The targets (50%, 5 points, 10 ×) are my choice, not derived from data; the student should be able to say why they are reasonable** |
| Student check | ☐ read `PREREGISTRATION.md` ☐ ran `git log` and saw the order of the commits |

### Entry 7 — Four methods and the benchmark script (commit `cd23693`)

| Item | Detail |
|---|---|
| Objective | Four ways to choose where to dig, a random-leak generator, and the program that compares them |
| Method | Random order; naive threshold (dig around the sensor with the biggest pressure drop); fingerprint matching (cosine similarity with pre-computed leak signatures); model fitting (Levenberg-Marquardt fit of leak size and overall demand with the full hydraulic model at each of 170 places). The same crew rule for all: skip a place within 40 map units of an earlier dig, stop at the first find or after 10 digs. Scenarios hide an unknown demand (±10% per junction, ±5% overall) and sensor error (0.10 m) inside the readings |
| Evidence | 24 more tests, all on a *development* seed (1). With exact readings fingerprints and model fitting find the leak almost at once: 0.07 and 0.00 dry holes (random order 8.7, naive 6.1) |
| Surprise | With the pre-registered noise on the same seed (40 scenarios) the four methods were close: random 8.6, naive 7.4, fingerprints 6.7, model fitting 6.1. This was written into `PREREGISTRATION.md` (section 8) **and the settings were not changed**, so that the benchmark is not tuned to look better |
| AI assistance | Claude Code wrote all of it |
| Student check | ☐ read `localize.ts` and explain the difference between M2 and M3 ☐ read section 8 of the pre-registration |

### Entry 8 — The benchmark run (benchmark seed 2027)

| Item | Detail |
|---|---|
| Objective | Run the registered experiment once and report whatever comes out |
| Method | `node research/benchmark.ts`: 1,000 random leaks (main experiment) and six robustness conditions of 300 leaks each; paired bootstrap, 2,000 resamples. 11.4 minutes on an Intel i7-9700K |
| Result | Mean dry holes: random 8.47, naive 6.91, fingerprints 6.26, model fitting 5.97. **H1 partially supported**: model fitting −13.6% (95% interval 10.0–17.2%), target 50%. **H2 partially supported**: fingerprints 8,035 × faster, but 3.5 points less often within three digs, upper bound 6.6 > 5. Model fitting did not find 38.8% of the leaks within 10 digs |
| What decides the result | When demand is known exactly the saving against the naive rule is 40.8% for fingerprints and 24.4% for model fitting; with twice the uncertainty it is 0.7% and 6.6%. Sensor error 0.03 m: 21.2%; 0.30 m: 3.8% (interval includes zero) for model fitting |
| Surprises | (1) The targets were missed by a wide margin; they were **not** adjusted afterwards. (2) With demand known, the simple fingerprint method beat model fitting (3.80 against 4.86); I suspect the fitted demand factor absorbs sensor noise but this is **not tested**. (3) A leak on the main line next to the plant is the hardest case: the naive rule needs 9.4 dry holes, worse than random order |
| AI assistance | Claude Code ran the benchmark and wrote the summary; the numbers are in `research/results/benchmark.json` |
| Student check | ☐ re-ran `node research/benchmark.ts` and got the same numbers (only timing fields change) ☐ opened `benchmark.json` |

### Entry 9 — Economic model (lei and euro)

| Item | Detail |
|---|---|
| Objective | Cost per dry hole, savings, payback, with local tariffs and a comparison with commercial equipment |
| Method | `src/utils/leakEconomics.ts`. Value of one dry hole = cost of a dig + (days per dig × water the leak loses per day × tariff × share). Saving of a method = dry holes avoided × that value. Payback = system cost ÷ (saving per year − running costs) |
| Sourced | Water tariff 14.03 lei/m³ for households (press report of the 2026 ANRE decision, Logos Press, 4 August 2026; the page says neither whether VAT is included nor from when it applies; the operator asked for 15.55); losses of 25.9% of the water taken in were accepted in the same calculation; EUR/MDL 20.1352 (BNM, 23 September 2026); satellite survey price (about US$470 per mile, North Kingstown report as quoted in a web search); acoustic logger kits (US retailers, a 2018 county tender) |
| **Not verified** | The pressure transmitter price (€165.99 and €215, retail listings): the page returned HTTP 403 and was not opened; no datasheet accuracy was checked. A 2023 Apă-Canal presentation on losses could not be read (a PDF without extractable text) |
| **Assumptions without a source** | Cost of one dry hole (€800), days per dig (0.5), share of the tariff a saved m³ is worth (50%), large leaks per year (4), cost of the sensor system (€12,000), running cost (€1,500 a year). These are sliders on the Research page and are the weakest part of the estimate |
| Result | At the default assumptions one dry hole costs €981 (19,749 lei); model fitting pays back a €12,000 system in 66 months and fingerprints in 138 months at today's uncertainty, and in 31 and 16 months if demand were known |
| Incident | While looking for the 2023 presentation the browser was pointed at a link that is a file download, which opened a save dialog on the student's computer; nothing was saved or used |
| AI assistance | Claude Code searched the sources and wrote the model and its 12 tests; every price and tariff above must be re-checked by the student |
| Student check | ☐ opened the ANRE decision and checked the tariff, its date and VAT ☐ checked the BNM rate on the day ☐ checked one transmitter datasheet ☐ asked a local contractor what a dig costs |

### Entry 10 — Research page and documents

| Item | Detail |
|---|---|
| Objective | Put the hypotheses, the benchmark and the cost model on the site, and write the MoldSEF documents |
| Method | New page `/research` in English, Romanian and Russian: verdicts, benchmark table, robustness table, an interactive leak hunt that runs the same methods in the browser, and the cost calculator with sliders. `research/docs.ts` builds `docs/moldsef/abstract.html` (2 pages, Times New Roman 12 pt) and `visual-annex.html` (1 page) from `benchmark.json`, so no number is typed by hand; a test fails if they drift apart |
| Evidence | 121 tests pass; `tsc`, `vite build` clean; the page was run in English, Romanian and Russian at phone size with no sideways scrolling and no console errors; abstract PDF 129 KB, 2 pages; annex PDF 96 KB, 1 page |
| AI assistance | Claude Code wrote the page, the translations and the document generator. The Romanian and Russian texts have **not** been read by a fluent reader |
| Student check | ☐ read the Research page in the three languages ☐ checked the abstract against the official MoldSEF Template A |

## C. Human verification of AI-assisted code (to be completed by the student)

| Check | Done (date, initials) |
|---|---|
| Ran `npm test`, `npm run lint`, `npm run build` locally and saw them pass | |
| Read `src/utils/network/hydraulics.ts` and can explain one iteration of the Global Gradient Algorithm | |
| Read `research/PREREGISTRATION.md`, and saw in `git log` that it was committed before the methods and the results | |
| Re-ran `node research/benchmark.ts` and obtained the same dry-hole numbers | |
| Can explain, without notes, the difference between fingerprint matching and model fitting | |
| Opened the ANRE decision, the BNM rate and at least one equipment price, and confirmed them | |
| Looked up papers [2] and [3] of the abstract and the Todini and Pilati chapter (the publisher is named differently in different sources) | |
| Asked the supervisor about the team and role rules (one or two students) | |

```bash
npm test                    # 121 tests
npm run lint
npm run build
node research/benchmark.ts  # about 12 minutes; rewrites research/results/benchmark.json; the dry-hole numbers must match, only timings change
node research/makeDocs.ts   # rebuilds the abstract and the annex from benchmark.json
```

## D. Planned experiments

| Planned | Why | Hypothesis / success criterion |
|---|---|---|
| Test the suspicion that the fitted demand factor absorbs noise: model fitting with the demand factor switched off when demand is known | It would explain why fingerprints beat model fitting at ×0 | Model fitting without the demand factor is no worse than fingerprints at ×0 (to be pre-registered as an amendment before it is run) |
| Add a flow meter at the plant | The total supply carries information about leak size and demand | Dry holes fall by at least 20% at the main setting |
| Several leaks at once | The game has six, the benchmark one | The methods keep their ranking |
| Calibrate on a real Moldovan district | The model is assumed exact | Needs data from the operator |
| Replace the cost assumptions with the operator's figures | They decide the payback | Payback inside five years at the operator's costs |
