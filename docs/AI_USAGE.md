# Responsible AI usage log

Infomatrix asks Software Development entrants to *"cite all prompts, models, or AI resources used and give proper credit in their documentation and presentation."* This file is that citation: what was used, the prompts, what the AI produced, and how a human checked it.

## Tool and model

| | |
|---|---|
| Tool | [Claude Code](https://claude.com/claude-code), Anthropic's AI coding assistant (desktop app) |
| Model | Claude Sonnet 5.5 (`claude-sonnet-5-5`), Anthropic |
| Role | Pair programmer: wrote code, tests, translations and documentation from the student's instructions |
| Not used | No AI-generated images. The scenes are drawn in code. Statistics come from WHO/UNICEF, USGS, FAO, the US EPA and others; the chart is from Our World in Data and the video is a TED-Ed lesson. |

## Prompts

The student's prompts, as typed (spelling kept):

1. > ONE MORE SITE WITH ANOTHER PROBLEM SAME LIKE THE PREVIOUS ONES BUT NAVBAR ON THE RIGHT THIS IS THE SUBJECT:
   >
   > Problema: lipsa apei potabile
   > Doar o parte foarte mică din apa planetei e dulce și accesibilă. Peste 2 miliarde de oameni nu au acces sigur la apă potabilă. Cauzele principale sunt agricultura (cel mai mare consumator, cu irigații ineficiente), poluarea râurilor și a pânzei freatice, și secetele tot mai dese din cauza schimbărilor climatice.
   > Soluții
   >
   > 1. Agricultură: irigarea prin picurare duce apa direct la rădăcină și poate reduce consumul cu 30–50% față de inundarea câmpului. Israelul a ajuns lider mondial tocmai așa.
   > 2. Reciclarea apei uzate: apa din canalizare e tratată și refolosită pentru irigații sau industrie, iar uneori chiar ca apă potabilă. Singapore (sistemul NEWater) și Israel (aproape 90% din apa uzată refolosită) sunt exemple bune.
   > 3. Desalinizare: transformă apa de mare în apă dulce. E scumpă energetic, dar devine mai ieftină dacă e alimentată cu energie solară. Arabia Saudită și Emiratele depind masiv de ea.
   > 4. Pierderi din rețea: în multe orașe, inclusiv din România, o mare parte din apă se pierde prin țevi vechi, uneori 30–40% sau chiar mai mult. Senzorii de presiune și înlocuirea conductelor rezolvă mult fără să ai nevoie de apă „nouă”.
   > 5. Acasă: dușuri scurte, robinete cu aerator, colectarea apei de ploaie pentru grădină și repararea scurgerilor. Un robinet care picură poate pierde mii de litri pe an.
   >
   > SITE SHOULD HAVE THIS TYPE OF DESIGN: https://www.magnesia.cz LIKE THIS TYPE OF SLIDESHOW. AND THE PROJECT SKELEYPN SHOULD LOOK LIKE THE PREVIOUS ONES (CLIMA WATCH, WASTELAND, AND THE ONE WITH PLASTIC POLLUTION)

2. > ok but i will do it on a different Git account and vercel account too

3. > OK LETS CONNECT IT OT MY GITHUB ACCOUNT

4. > im on nicoles account

5. > keep the repo public the teach has to see it

6. > check and do the guidelines for this site: https://www.infomatrix.ro
   >
   > name: NICOLE PUZUR
   >
   > TEACHER : AZAMT JAYUSH

Prompts that only dealt with which GitHub account to use are left out (account administration, not project content). The supervisor's name is written "Azamat Jayush" in the documentation, as in the student's earlier projects.

## What the AI did with them

- Read the student's earlier projects (ClimaWatch and PlasticFree) to reuse their structure: Home, Problem, Solution, interactive tools, About, three languages, a shared state saved in the browser, tested utility modules, a Vercel rewrite file and an Infomatrix-style README.
- Looked at the Magnesia reference site and took its visual language: a full-screen hero slideshow, ink-navy sections with blue light, wide tracked capitals, capsule buttons with a round arrow, a pinned horizontal row of cards, image breaks, numbered causes, an FAQ and smooth scrolling. No code, images or fonts were copied.
- Put the navigation on the right, as asked.
- Turned the five solutions in the brief into five tools: irrigation lab, reuse loop, solar desalination sizer, leak hunter, home water audit.
- Wrote the code, the six animated scenes (SVG), the tests, the English, Romanian and Russian text and the documentation.
- Kept the project in its own folder, apart from the student's other projects, as the second prompt asked.
- Published the code to the student's own GitHub account (`nicolepuzur`), after she signed in herself in the terminal. The Vercel deployment was done by the student in her own Vercel account.
- Read the official Infomatrix regulations, the Software Development page and the evaluation rubric, and brought the documentation in line with them: the checklist and the table for the nine judging criteria in the README, the team credit on the About page, a design-plan sketch, a PDF copy of the documentation, this log, and `docs/SUBMISSION.md`.

## What was checked, and what is left for the student

These checks were run by the AI assistant, with web look-ups, tests and a browser, while building. They are not a substitute for the student's own review (see the end of this section).

- **Statistics were looked up at their sources** before being used: 2.1 billion without safely managed drinking water in 2024 and 106 million drinking untreated surface water (WHO/UNICEF JMP 2025); 2.5 % of Earth's water is fresh and lakes hold 0.007 % of all water (USGS); about 70 % of withdrawals go to agriculture, up to 95 % in some countries (FAO); 126 billion m³ of non-revenue water a year (Liemberger & Wyatt); a dripping tap wasting more than 3,000 gallons a year and a household leak more than 9,300 gallons (US EPA); about 1 billion m³ of urban wastewater reused in the EU, with six times more possible (European Commission); the 1.06 kWh/m³ minimum and 2.5–4 kWh/m³ for real plants (Elimelech & Phillip, 2011).
- **Figures that came from the student's brief** and could not all be confirmed at a primary source: "30–50 %" for drip irrigation (field studies and Project Drawdown give about 30–40 %, so the site says the range varies), Israel reusing "almost 90 %" (reports give 85–90 %), and old networks in Romania losing 30–40 %. They are worded as ranges or as reported figures.
- **Singapore's NEWater share (up to 40 %)** was found in secondary reporting only; the PUB page checked did not repeat it. The site words it as "reported" and the README flags it for a last check before submission.
- **Assumptions are labelled**: drip, sprinkler and flood efficiencies (60 / 75 / 90 %), the crop water needs, the share of used water that returns to the sewer (80 %), shower and tap flows, the size of a drop, the solar yield of three regions and the size of a panel. Each tool shows its formula in a "How is this calculated?" box.
- Every calculation is a small function with unit tests (52 tests). The pages were run in a browser: every page at desktop width, the home page and the menu at phone width, and the home page in Russian.
- The English, Romanian and Russian texts are checked by a test for identical keys, list lengths and placeholders. A fluent reader should still read the Romanian and Russian once.

### Still for the student to do

- Read every page in English, Romanian and Russian, and change anything that does not sound right. Only the Russian home page was looked at in a browser.
- Re-open the sources behind the key statistics, and the Singapore figure, before submitting.
- Run `npm run dev`, try each tool, and be able to explain its formula (each one is in its "How is this calculated?" box and in the README).
- Add the live address to the README, and confirm the documentation with the supervisor before uploading it.

## Reproducible process

Anyone can rebuild the project from the same brief. The result will be similar but not identical, because AI output varies between runs; the tests, the formulas and the cited sources are what make the result checkable.

1. **Tools:** [Claude Code](https://claude.com/claude-code) (desktop app) with the model `claude-sonnet-5-5`; Node.js 24; a browser for checking.
2. **The brief:** prompt 1 above is the whole brief: the subject text, the reference site and "same structure as the previous projects, navigation on the right".
3. **Research first:** the AI read the earlier projects' structure (shell, navigation, i18n, calculation modules, tests, README) and the reference site's sections and slideshow, and checked the statistics against their sources with web searches.
4. **Build in layers**, checking after each one:
   1. configuration (`package.json`, TypeScript, Vite, Tailwind, Vercel rewrite);
   2. pure calculation modules in `src/utils` with their tests;
   3. English, Romanian and Russian text, with a test that keeps the three in step;
   4. shared components (navigation, slideshow, scenes, controls), then the pages;
   5. documentation, screenshots and this log.
5. **Commands used after each layer:** `npx tsc -b` (types), `npm run lint`, `npm test`, `npm run build`, and `npm run dev` to look at the pages in a browser.
6. **Screenshots:** taken from the running app with a headless browser at 1440 × 900 and 390 × 844.
7. **Human decisions:** the topic, the five solutions, the reference design, the right-hand navigation, publishing under the student's own account and keeping the repository public were the student's.

## Privacy and licensing

- **Privacy:** the site stores only the visitor's own choices (language, tool inputs, home plan) in their browser, with no cookies, no analytics and no accounts. Loading the page contacts Google Fonts, and the Problem page loads a chart from Our World in Data and a video from YouTube's privacy-enhanced domain.
- **Licensing:** the code is MIT-licensed; the fonts are under the SIL Open Font License; Lenis is MIT; the Our World in Data chart is CC BY 4.0; the TED-Ed video is embedded, not copied. No images from other sources are used, and the reference site's code, images and fonts were not copied. The full table is in the README.
