# Submission guide — Infomatrix 2027, Software Development

Everything here comes from the official pages at [infomatrix.ro](https://www.infomatrix.ro) ([regulations](https://www.infomatrix.ro/guide/regulations.html), [category page](https://www.infomatrix.ro/categories/software-development.html), [rubric](https://www.infomatrix.ro/guide/evaluation-rubrics.html)), read on 27 October 2026. The regulations say rules can change without notice, so read them again before you submit.

## The rules that matter

| | |
|---|---|
| Who | Students aged 7–18 enrolled in a school, secondary school or high school. At most **two students and a supervisor**, as separate roles. A student may not take part in more than one project. |
| Supervisor | Anyone older than 18. **The supervisor must register an account** on the portal. |
| Language | The entry, the documentation and the presentation are in **English**. |
| Open source | The project must be open source and not subject to anyone's proprietary rights. Infomatrix gets a non-exclusive licence to display it. |
| AI | Allowed, but you **must cite all prompts, models and AI resources**, in the documentation *and* the presentation. |
| Where to register | [register.infomatrix.ro](https://register.infomatrix.ro) — opens **1 January 2027** |
| Deadline | **15 March 2027**: documentation, source code and a demo video |
| Finalists | Announced **20 March 2027** |
| Finals | Bucharest, **27–31 May 2027**. Each team gets **15 minutes in total, including questions**, plus a booth for posters and a demo. |
| Country partners | The FAQ says that if your country has an Infomatrix partner, only projects verified by that partner are accepted. **Ask the supervisor to check this first.** |

## What the supervisor's research track asks for

From the supervisor's evaluation of Submission #1 (5 November 2026). These come **on top of** the Infomatrix rules above and come from the supervisor, not from infomatrix.ro, so confirm them with him.

| | |
|---|---|
| Science | A testable hypothesis ("if we use method X, metric Y improves by Z% against a baseline") and a benchmark of 2–3 algorithms over **N ≥ 100** runs, with accuracy, false-positive rate (dry holes) and latency → [research/PREREGISTRATION.md](../research/PREREGISTRATION.md), [research/results/benchmark.json](../research/results/benchmark.json), the Research page |
| Economics | Cost, comparison with commercial alternatives, local tariffs in MDL and EUR, payback in months → Research page, [abstract](moldsef/abstract.pdf) section 4 |
| Documents | **Template A:** 2-page MoldSEF abstract + separate 1-page visual annex → [abstract.pdf](moldsef/abstract.pdf), [visual-annex.pdf](moldsef/visual-annex.pdf) (check them against the official template, which was not available). **Template B:** dated laboratory logbook → [logbook.md](moldsef/logbook.md) |
| Code ownership | Algorithmic work written and committed by the student in incremental, dated commits; the *Still for the student to do* section of [AI_USAGE.md](AI_USAGE.md) completed |
| Poster | **A0 vertical, or two A1 sheets side by side (horizontal)** |
| Talk | **3-minute pitch + 7-minute Q&A** |
| Team | The supervisor asked to check the team and role requirements with him (one or two students, as separate roles) |

## Upload checklist

- [ ] Team registered; supervisor account created
- [ ] Documentation: [DropWise-documentation.pdf](DropWise-documentation.pdf), which is the README. **It was made before the research upgrade of 5 November 2026 and must be re-made from the current README**
- [ ] Research documents checked against the official MoldSEF templates: [abstract](moldsef/abstract.pdf), [visual annex](moldsef/visual-annex.pdf), [logbook](moldsef/logbook.md) (checklist filled in by the student)
- [ ] Source code: https://github.com/nicolepuzur/DropWise (public, MIT)
- [ ] Demo video (script below)
- [x] The live address is in the README: https://drop-wise-s8pt.vercel.app
- [ ] All pages read in English, Romanian and Russian; key statistics re-checked at their sources
- [ ] [AI_USAGE.md](AI_USAGE.md) read through, and every sentence in it true for you

## Demo video — about 2½ minutes, in English

Record the screen at 1080p (on Windows: **Win + G** opens the Game Bar, then Record) and speak over it.

| Time | Show | Say |
|---|---|---|
| 0:00 | Home, the slideshow | "2.1 billion people still have no safely managed drinking water. DropWise lets you try the five fixes yourself." |
| 0:15 | Problem → the 100 litres; tap *Lakes and rivers* | "Pour the planet into 100 litres: only about 7 millilitres sit in lakes and rivers." |
| 0:40 | Solution page, the five fixes | "Each fix comes with a real example and its catch." |
| 0:55 | Irrigation lab: change the size and crop | "Same field, three ways to water it. Drip uses about a third less water in this model." |
| 1:15 | Reuse loop: click *Israel-level* | "The pipe splits into what is reused and what is released." |
| 1:30 | Desalination: switch the region | "In a sunnier place the same plant needs fewer panels." |
| 1:45 | Leak hunter: dig without sensors, then switch them on | "Without sensors you dig and hope. With them, you dig in the right place." |
| 2:15 | Home audit: add four actions; show the sidebar total | "Every habit counted in litres; the plan follows you on every page." |
| 2:35 | Switch to Romanian; phone view; close | "Three languages, no accounts, open source — and every prompt and AI tool is cited." |

## The 15-minute presentation

| Minutes | Part |
|---|---|
| 0–2 | The problem, with one number (2.1 billion) |
| 2–4 | The idea: one small model for each solution |
| 4–10 | Live demo, in the order of the video |
| 10–12 | How it is built: pure tested formulas, one shared state, three languages, honest numbers with sources |
| 12–13 | Responsible AI: the tool, the model, the prompts, what was checked, what you did yourself |
| 13–15 | Questions |

**The jury scores "technical skills" partly on whether the project is within the student's abilities, so be ready to explain it.** Start with `src/utils` — the smallest files, one per tool. Then run the app and change each tool's inputs while reading its formula.

Likely questions, with short answers:

- **Where do the numbers come from?** Every statistic names its source (README, *Sources*). Every tool has a "How is this calculated?" box.
- **How accurate are the tools?** They are simple models that show a principle. The assumptions are written next to each one.
- **Why does drip save a third here, when people say 30–50 %?** Efficiency goes from 60 % to 90 %, so the water drawn falls by 1 − 0.6/0.9 = one third. Field studies vary with soil, climate and management.
- **How did you use AI?** Claude Code wrote the code from the brief; the prompts, the checks and the steps to reproduce are in `docs/AI_USAGE.md`. Say honestly what you did yourself.
- **What would you improve?** Real data for a chosen city, a map of water points, more languages, a measured check with a real farm or school.
- **What happens to the visitor's data?** It stays in their browser; there are no accounts or analytics.

## The 3-minute pitch + 7-minute Q&A (the supervisor's track)

| Seconds | Part |
|---|---|
| 0–30 | The problem with one number: a quarter of Chișinău's water is lost in the network (25.9% accepted in the 2026 tariff calculation) |
| 30–70 | The question and the two hypotheses, written down *before* any method was run |
| 70–130 | The result, honestly: H1 and H2 only partially supported (−13.6% dry holes against a 50% target); what decides it is how well demand is known |
| 130–165 | Live: the leak hunt on the Research page, model fitting against the naive rule, then moving the demand-uncertainty slider to 0 |
| 165–180 | The money: payback in months, and which numbers are assumptions |

For the Q&A, the likely questions are in the list above; add: *Why did you not change the target when you saw the result?* (the pre-registration was committed first, see `git log`), *Why do fingerprints beat model fitting when demand is known?* (a suspicion, not yet tested, see the logbook), *Where do the costs come from?* (tariff and rate sourced; dig cost, leaks per year and system cost are assumptions).

## Poster and booth

- **Poster (A0 vertical, or two A1 sheets side by side):** the title; a QR code to the live site and another to the repository; the hypotheses with their verdicts; the benchmark bars (Figure 3 of the visual annex) and the saving-by-condition chart (Figure 4); the payback table; the 100-litre dot picture from `docs/screenshots/04-problem-earth.jpg`; a row of the five solution icons, each with its key number; a strip with the sources and "AI cited: docs/AI_USAGE.md".
- **Booth:** a laptop with the home slideshow in full screen, so the scenes play while people walk by; a phone or tablet with the home audit, so a visitor can try it; a small printed card with "How much could your home save?" and the QR code.
- **Look:** the site's palette (deep navy, aqua, a touch of sand) and its wide letter-spaced capitals, so the stand matches the screen.
