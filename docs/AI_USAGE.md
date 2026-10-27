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

## What the AI did with them

- Read the student's earlier projects (ClimaWatch and PlasticFree) to reuse their structure: Home, Problem, Solution, interactive tools, About, three languages, a shared state saved in the browser, tested utility modules, a Vercel rewrite file and an Infomatrix-style README.
- Looked at the Magnesia reference site and took its visual language: a full-screen hero slideshow, ink-navy sections with blue light, wide tracked capitals, capsule buttons with a round arrow, a pinned horizontal row of cards, image breaks, numbered causes, an FAQ and smooth scrolling. No code, images or fonts were copied.
- Put the navigation on the right, as asked.
- Turned the five solutions in the brief into five tools: irrigation lab, reuse loop, solar desalination sizer, leak hunter, home water audit.
- Wrote the code, the six animated scenes (SVG), the tests, the English, Romanian and Russian text and the documentation.
- Kept the project in its own folder, ready for a separate repository and a separate Vercel project, as the second prompt asked. Nothing was committed or pushed.

## What was checked by hand

- **Statistics were looked up at their sources** before being used: 2.1 billion without safely managed drinking water in 2024 and 106 million drinking untreated surface water (WHO/UNICEF JMP 2025); 2.5 % of Earth's water is fresh and lakes hold 0.007 % of all water (USGS); about 70 % of withdrawals go to agriculture, up to 95 % in some countries (FAO); 126 billion m³ of non-revenue water a year (Liemberger & Wyatt); a dripping tap wasting more than 3,000 gallons a year and a household leak more than 9,300 gallons (US EPA); about 1 billion m³ of urban wastewater reused in the EU, with six times more possible (European Commission); the 1.06 kWh/m³ minimum and 2.5–4 kWh/m³ for real plants (Elimelech & Phillip, 2011).
- **Figures that came from the student's brief** and could not all be confirmed at a primary source: "30–50 %" for drip irrigation (field studies and Project Drawdown give about 30–40 %, so the site says the range varies), Israel reusing "almost 90 %" (reports give 85–90 %), and old networks in Romania losing 30–40 %. They are worded as ranges or as reported figures.
- **Singapore's NEWater share (up to 40 %)** was found in secondary reporting only; the PUB page checked did not repeat it. The site words it as "reported" and the README flags it for a last check before submission.
- **Assumptions are labelled**: drip, sprinkler and flood efficiencies (60 / 75 / 90 %), the crop water needs, the share of used water that returns to the sewer (80 %), shower and tap flows, the size of a drop, the solar yield of three regions and the size of a panel. Each tool shows its formula in a "How is this calculated?" box.
- Every calculation is a small function with unit tests; the pages were run in a browser at desktop and phone width, and in Russian.
- The English, Romanian and Russian texts are checked by a test for identical keys, list lengths and placeholders. A fluent reader should still read the Romanian and Russian once.
