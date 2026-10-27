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

## Upload checklist

- [ ] Team registered; supervisor account created
- [ ] Documentation: [DropWise-documentation.pdf](DropWise-documentation.pdf), which is the README (re-make it if the README changes)
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

## Poster and booth

- **Poster (A1, portrait):** the title; a QR code to the live site and another to the repository; the 100-litre dot picture from `docs/screenshots/04-problem-earth.jpg`; a row of the five solution icons, each with its key number; a strip with the sources and "AI cited: docs/AI_USAGE.md".
- **Booth:** a laptop with the home slideshow in full screen, so the scenes play while people walk by; a phone or tablet with the home audit, so a visitor can try it; a small printed card with "How much could your home save?" and the QR code.
- **Look:** the site's palette (deep navy, aqua, a touch of sand) and its wide letter-spaced capitals, so the stand matches the screen.
