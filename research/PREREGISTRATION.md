# Pre-registration: finding a leak from pressure sensors (AquaLeak Graph benchmark)

**Project:** DropWise, leak-hunter tool · **Written:** 5 November 2026, **before any leak-finding method was written or run** · **Numbers in this file:** `research/config.ts` (a test keeps the two in step)

The date of this file is the date of the Git commit that adds it. A pre-registration is only worth something if the decision rules were fixed first, so nothing below may be changed after the benchmark has run, except as an amendment at the end of the file, with the date and the reason.

## 1. What was already done when this was written

- The pipe graph (`src/utils/network/graph.ts`) and the hydraulic simulator (`src/utils/network/hydraulics.ts`, `city.ts`) are written and tested (20 tests: mass balance at every junction, the Hazen-Williams law in every pipe, a single pipe against the formula, parallel pipes, leaks).
- To choose pipe diameters I looked at the *quiet* network and at three hand-picked leaks (2%, 5% and 10% of the demand, on three pipes) to see how large the pressure changes are: the lowest pressure in the quiet network is 40.9 m, and a leak lowers the pressure by about 0.25-0.7 m (2%) to 1.3-3.4 m (10%). The diameters were changed once, from 0.5/0.3/0.25 m to 0.4/0.25/0.2 m, so that the lowest pressure is about 40 m rather than 53 m (a more realistic service pressure).
- **No leak-finding method existed, and none had been run on any scenario.**

## 2. Question and hypotheses

**Question.** If a leak opens somewhere in a city's water network and only a few pressure sensors can see it, how many wasted digs does a crew need before it finds the leak, and does a model of the network make that number smaller?

**H1 (accuracy).** Model fitting (method M3) has at least **50% fewer dry holes** than the naive threshold (M1).

**H2 (cost-effectiveness).** The cheap fingerprint method (M2) finds the leak within three digs almost as often as model fitting, and is much faster: its share of scenarios with at most two dry holes is **no more than 5 percentage points below** M3's (the upper end of the 95% interval of the gap is 5 points or less), and its median run time is **at least 10 times shorter**.

**Decision rule (the same for H1 and H2).**

| Verdict | H1 | H2 |
|---|---|---|
| Supported | reduction of 50% or more, **and** the lower end of its 95% interval is above 0 | both conditions hold |
| Partially supported | the lower end of the interval is above 0 but the reduction is below 50% | exactly one condition holds |
| Not supported | otherwise | neither holds |

## 3. The simulated world

Real leaks cannot be placed on demand, so the experiment is a Monte Carlo simulation. The assumptions are stated here so that they can be criticised.

| Item | Setting |
|---|---|
| Network | the 8 drawn pipes of the leak hunter, cut at every junction: 14 junctions, 19 pipes, 6 loops, 3,340 map units. One map unit is 4 m, so the network is 13.4 km of pipe. |
| Hydraulics | steady state; Hazen-Williams head loss, solved with the Global Gradient Algorithm (Todini and Pilati 1988, the method of EPANET). The plant holds 60 m of head. Pipes: 400 mm main line, 250 mm ring mains, 200 mm branches, roughness C = 100 (old cast iron). |
| Customers | 0.25 m3/s in total (about 21,600 m3 a day), shared over the junctions in proportion to the pipe that serves them. |
| What the model knows | the network and these *nominal* demands. It does not know the real demand. |
| Real demand (hidden) | each junction's demand is multiplied by (1 + e), with e normal, standard deviation **0.10**, and all of them are multiplied together by a factor with standard deviation **0.05**. |
| The leak | **one** leak per scenario. Position: uniform over the pipe length (a pipe chosen in proportion to its length, then uniform along it). Size: log-uniform between **2% and 10%** of the demand, measured at 40 m of head (5-25 L/s; the real loss is pressure dependent: q = coefficient x sqrt(head)). |
| Sensors | **4** pressure sensors at junctions, chosen by a fixed rule (first the junction with the lowest nominal pressure, then each next one as far as possible, on the map, from those already chosen; ties go to the lowest junction number). Never at the plant. |
| Sensor error | normal, standard deviation **0.10 m** of water (10 mbar, about 0.1% of a 10 bar range). |
| What a method receives | the drop at each sensor: nominal pressure minus measured pressure. |
| A dig | digging at a place finds the leak if the leak is within **40 map units** (the radius of the game, 160 m) of it. In practice this is the pressure-guided first step; pinpointing inside the 160 m circle is done with acoustic equipment. |

## 4. The methods

All of them return a **ranked list of places to dig**, chosen from candidate places 20 map units apart along every pipe (170 places, see 8.1).

- **M0 Random.** A random order. Shows what "no information" costs.
- **M1 Naive threshold.** The approach of the current tool: find the sensor with the biggest pressure drop, then dig the places in order of their distance from that sensor.
- **M2 Fingerprint matching.** For every candidate place, pre-compute its fingerprint: the drops at the sensors if a leak of 5% of the demand opened there, with nominal demand. Rank the places by the cosine similarity between the fingerprint and the observed drops (the sizes do not matter, only the pattern).
- **M3 Model fitting.** For every candidate place, find with Levenberg-Marquardt (at most 6 iterations, finite-difference Jacobian, start from a 5% leak and a demand factor of 1) the leak size and the overall demand factor (limited to 0.5-1.5) that make the full hydraulic model match the four readings best. Rank the places by the remaining squared error. The demand factor is a "nuisance" the method corrects for; the other uncertainty (per junction) it cannot.

**Dig protocol (identical for every method).** Walk down the list. Skip a place within 40 map units of an earlier dig of the same scenario. Dig. Stop when the leak is found or after **10 digs**.

No parameter of any method is tuned on the benchmark scenarios. The values above and in `research/config.ts` are final. Unit tests and debugging use a separate random seed (1); the benchmark uses a fresh seed (2027), once.

## 5. Measurements

For each scenario and method: the number of **dry holes** D (digs before the one that finds the leak; 10 if the leak is not found within 10 digs), whether it was found, the distance of the first dig from the leak, and the run time of the method on this computer.

- **Primary result:** the mean of D.
- **Also reported:** share with D = 0 (first dig finds it), share with D of 2 or less, share never found, median distance of the first dig, median run time, mean and 95% interval of D for every method.
- **Intervals:** 95% percentile bootstrap over scenarios, paired across methods, 2,000 resamples, seed 11.
- **Size:** **1,000** scenarios for the main experiment.

## 6. Planned robustness checks (secondary, each with 300 scenarios and one change)

| Change | Values |
|---|---|
| Sensor error | 0.03 m, 0.30 m |
| Number of sensors | 3, 6 |
| Demand uncertainty | none (factor 0), twice as large (factor 2) |
| Subgroups of the main experiment | leak size (small, medium, large third of the log scale); leak on the main line or not |

For each, the reduction of dry holes of M3 and of M2 against M1 is reported with its 95% interval. A claim such as "the advantage persists" is allowed only where the lower end of the interval is above 0.

## 7. Limits stated in advance

- It is a **simulation**. The network is a drawing, not a real district; no real leak, no real sensor and no real Moldovan network data are used. The result says what the *methods* can do under the stated assumptions, not what they would do in a field.
- The model of the network is assumed to be **exact** (perfect pipe diameters and roughness). In a real city these are uncertain and the model would first have to be calibrated.
- One leak at a time, steady state, independent Gaussian sensor errors, sensors at junctions only.
- Leaks smaller than 2% of the demand (below about 5 L/s) are outside the range; they need other techniques (acoustic loggers, night flow).
- A leak right next to the plant looks like a general rise in demand and cannot be found from pressure alone. This is expected to show in the subgroup "leak on the main line".
- The dig radius is the game's, 160 m at the chosen scale.

## 8. Implementation details and amendments

**8.1 Details fixed before the first benchmark run** (5 November 2026, after the four methods were written and tested on the development seed, before any run on the benchmark seed). They fill in what the sections above left open and change no hypothesis, target or decision rule.

- There are **170** candidate places, not "about 167" (the number was estimated by hand in Section 4).
- M3: the Levenberg-Marquardt damping starts at 0.01, is multiplied by 0.3 after an accepted step and by 10 after a rejected one (a rejected step still uses up an iteration). The finite-difference steps are 0.05 for the leak size (in units of the 5% reference leak) and 0.01 for the demand factor. The fit stops early when a step is smaller than 0.0001 (leak size) and 0.00001 (demand factor).
- Ties in a ranking go to the place that comes first in the list of candidates.
- Run time is the wall-clock time to rank the places for one scenario, in Node.js on the computer that ran the benchmark. The one-off preparation of M2 (the 170 fingerprints) is reported separately.

**8.2 What the development seed showed** (40 scenarios of seed 1; this is debugging, not a result of the report).

| Settings | Random | Naive (M1) | Fingerprint (M2) | Model fitting (M3) |
|---|---|---|---|---|
| Exact readings: no sensor error, no demand uncertainty (30 scenarios) | 8.70 | 6.13 | 0.07 | 0.00 |
| The settings of Section 3 (40 scenarios) | 8.63 | 7.35 | 6.70 | 6.13 |

Mean dry holes. With exact readings M2 and M3 find the leak almost at once, which shows that the code is correct. With the sensor error and demand uncertainty of Section 3 the four methods end up close together, so under those settings the four sensors carry little information. **The settings of Section 3 were not changed because of this.** The robustness checks of Section 6 are there to show how the result depends on them.

**8.3 Amendment 1: a new method and a new hypothesis, added after the main run and before they are tested** (5 November 2026)

*Observation (post hoc, from the robustness table of the main run).* With demand known exactly (factor 0) the fingerprint method needed fewer dry holes than model fitting (3.80 against 4.86). *Suspicion, not tested:* the fitted demand factor then absorbs sensor noise instead of an unknown demand.

*New method M3b, leak-only fit.* Model fitting with the demand factor **fixed at 1**, so that only the leak size is fitted (one parameter; the same Levenberg-Marquardt damping, step and stopping rules as M3).

*H4 (exploratory).* At demand uncertainty factor 0, M3b needs **at least 10% fewer dry holes** than M3. Supported = the estimate reaches 10% and the 95% interval stays above 0; partially supported = the interval is above 0 but the estimate is below 10%; not supported otherwise.

*Data.* A **fresh seed (2028)**, so that the scenarios that suggested the idea are not reused: **500** scenarios at factor 0, everything else as in the main experiment (four sensors, error 0.10 m). Reported as context only, with no hypothesis: the same 500 scenarios at factor 1, where M3b is expected to be no better than M3 because the demand factor is needed there. Intervals as in Section 5 (paired bootstrap, 2,000 resamples, seed 11).

Because the idea came from looking at results, H4 is **exploratory whatever the outcome**, and the abstract does not rely on it.

**8.4 Amendments after the benchmark run, results**

*(to be filled in after the run)*
