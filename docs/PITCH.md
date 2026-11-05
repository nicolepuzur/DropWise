# DropWise — 3-minute pitch and 7-minute Q&A

Speaker: Nicole Puzur. This is a script to learn from, not to read out: say it in your own words and practise with a timer. Every number below is in `research/results/benchmark.json`, the abstract or the Research page.

## The pitch (about 3 minutes, about 430 words)

**0:00 · The problem (30 s)**
"A quarter of the water in Chișinău's pipes never reaches a tap: 25.9% was accepted as loss in this year's tariff calculation. One leak of 12 litres a second loses 1,037 cubic metres a day — the daily drinking water of about 8,000 people. To find it, a crew digs. And many of those holes are dry."

**0:30 · The question (40 s)**
"My question: if a leak opens and only four pressure sensors can see it, does a model of the pipe network cut the wasted digs? I wrote two hypotheses and their decision rules *before* I ran anything — Git shows the order. H1: model fitting needs at least half as many dry holes as the naive rule of digging near the biggest pressure drop. H2: a simple fingerprint method is almost as good, and ten times faster."

**1:10 · What I built (30 s)**
"I turned the leak hunter's pipes into a graph and wrote a hydraulic simulator — the same mathematics as EPANET. Then a thousand random leaks, with unknown customer demand and noisy sensors, and four methods that all use the same crew rule."

**1:40 · The honest result (45 s)**
"Both hypotheses are only partly supported. Model fitting saves 13.6% of the dry holes: real, but the target was 50%. Fingerprints are 8,000 times faster, but a little less accurate than my margin allowed. I did not change the targets. And what decides the result is not the algorithm, it is demand: when customer demand is known, fingerprints save 41% of the dry holes and pay back in about 16 months. With twice the uncertainty, almost nothing."

**2:25 · Live demo (25 s)**
"Here is a random leak. The naive rule digs … and digs … Model fitting finds it sooner. Now I set the sensor error and the demand uncertainty to zero, and the model finds the leak with the first dig. The hard part is the noise."

**2:50 · Money, limits, AI (10 s)**
"At 14 lei per cubic metre, a dry hole costs about 980 euro and the payback depends on assumptions that I list on the page. This is a simulation, not a field test. Claude Code wrote the code; every prompt, and what I checked myself, is in AI_USAGE.md."

### Demo steps

1. Open the live site, page *Research*, scroll to *Try it: hunt a leak*.
2. Method *Naive threshold* → *Dig until found*. Read the status line (digs, dry holes).
3. Change the method to *Model fitting* (the same leak stays) → *Dig until found*.
4. Set *Sensor error* and *Demand uncertainty* to 0 → *Model fitting* → *Dig until found*: found at the first dig.
5. Fallback if the site is slow: have screenshots of steps 2–4 ready.

## Questions and short answers (7 minutes)

Before you use any answer, read the code or the page it points to, so that it is true for you.

1. **Why did you not change the targets when you saw the result?** The pre-registration was committed first (`git log` shows it). Changing a target after seeing the result would make the test meaningless.
2. **Is this real data?** No. It is a simulation of the drawn network. I say so on the page and in the abstract. The next step is a real district.
3. **Why a simulation?** A leak cannot be opened on demand. A simulation lets me test 1,000 random leaks and see which method wins.
4. **How does the simulator work?** The pipes are a graph. Head loss in a pipe follows the Hazen–Williams law, h = r·Q^1.852. Each iteration replaces every pipe law by its tangent, solves one small linear system for the pressures, and updates the flows, until nothing changes. A leak is a hole: q = k·√pressure. Tests check that water is conserved at every junction.
5. **What is the difference between fingerprints and model fitting?** Fingerprints are computed once: what a leak at each place would do to the four sensors; I pick the place whose pattern best matches. Model fitting tries every place and adjusts the leak size and the overall demand until the full model matches the readings.
6. **Why were fingerprints better than model fitting when demand is known?** I suspected that the fitted demand factor absorbs sensor noise, so I wrote the test down first (Amendment 1) and ran a version without the factor on a new random seed. Result: with demand known it needs 24% fewer dry holes than the full fit and is as good as fingerprints; when demand is uncertain it is worse, because there the factor is needed. It is exploratory, because the idea came from looking at results.
7. **What is a dry hole, and why 10?** A dig that does not find the leak (within 160 m). A crew gives up after 10 digs; a leak not found counts as 10.
8. **Why "partially supported"?** The decision rule was fixed in advance: supported only if the estimate reaches the target and the 95% interval stays above zero. For H1 the interval is above zero (10.0–17.2%) but the estimate (13.6%) is far below 50%.
9. **What is the biggest weakness?** The network model is assumed exact, there is one leak, and the sensors are good (0.10 m). A cheap transmitter is ±0.5–1% of full scale, i.e. 0.5–1 m on 10 bar, which is much noisier.
10. **Where do the money numbers come from?** Tariff 14.03 lei/m³ from the ANRE press release of 4 August 2026; exchange rate 20.1773 lei per euro from the National Bank of Moldova on 5 November 2026. The cost of a dig, the number of leaks per year and the cost of the system are my assumptions, and they are sliders on the page.
11. **How did you use AI?** Claude Code wrote the code, tests and documents. A classmate typed the prompts. The prompts, the checks, what could not be checked and what I still have to do myself are in `docs/AI_USAGE.md`. *(Say honestly what you did yourself.)*
12. **What would you do next?** Calibrate the model on a real district, add a flow meter at the plant, handle several leaks, and replace my cost assumptions with the operator's figures.
13. **How many people is 1,037 m³ a day?** The site assumes 130 litres of domestic water per person a day: 1,037,000 ÷ 130 ≈ 8,000 people.
