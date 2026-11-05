import type { Lang } from './translations'

/** Text of the Research page. Kept apart from the main dictionaries because the page is long and self-contained. */
export interface ResearchText {
  eyebrow: string
  title: string
  sub: string

  hypothesesTitle: string
  h1Label: string
  h1Claim: string
  h2Label: string
  h2Claim: string
  target: string
  observed: string
  interval: string
  gapLabel: string
  speedLabel: string
  verdict: { supported: string; partial: string; notSupported: string }
  h1Notes: { supported: string; partial: string; notSupported: string }
  h2Notes: { supported: string; partial: string; notSupported: string }
  rule: string

  benchTitle: string
  benchSub: string
  cols: { method: string; dry: string; first: string; three: string; never: string; time: string }
  methods: Record<'random' | 'naive' | 'fingerprint' | 'fit', { name: string; desc: string }>
  perLeak: string

  holdTitle: string
  holdSub: string
  holdCols: { check: string; naive: string; fingerprint: string; fit: string; saved: string }
  conditionMain: string
  conditionNoise: string
  conditionSensors: string
  conditionDemand: string
  subgroupsTitle: string
  subgroupLabels: string[]

  tryTitle: string
  trySub: string
  method: string
  newLeak: string
  digNext: string
  digAll: string
  reveal: string
  noise: string
  demand: string
  readings: string
  legendSensor: string
  legendLeak: string
  legendDig: string
  statusIdle: string
  statusComputing: string
  statusFound: string
  statusNotFound: string
  leakInfo: string
  tryNote: string

  moneyTitle: string
  moneySub: string
  sliders: { leak: string; costDig: string; daysDig: string; value: string; leaksYear: string; system: string; running: string }
  tariffNote: string
  waterLost: string
  dryHoleCost: string
  today: string
  known: string
  rows: { avoided: string; perLeak: string; perYear: string; payback: string }
  never: string
  months: string
  breakEven: string
  marketTitle: string
  marketNote: string

  limitsTitle: string
  limits: string[]
  sourcesTitle: string
  sourcesBody: string
  prereg: string
}

const en: ResearchText = {
  eyebrow: 'Research',
  title: 'Can a model find a leak faster than guessing?',
  sub: 'A test on a simulated city. The hypotheses and the decision rules were written down before anything was run: {n} random leaks, four pressure sensors, four ways of choosing where to dig.',

  hypothesesTitle: 'Hypotheses and verdicts',
  h1Label: 'H1 · Fewer wasted digs',
  h1Claim: 'Model fitting needs at least {target} fewer dry holes than the naive rule of digging near the sensor with the biggest pressure drop.',
  h2Label: 'H2 · Cheap and fast enough',
  h2Claim: 'The simple fingerprint method finds the leak within three digs almost as often as model fitting (no more than {margin} points less) and is at least {speed} times faster.',
  target: 'Target',
  observed: 'Observed',
  interval: '95 % interval',
  gapLabel: 'Gap to model fitting',
  speedLabel: 'Speed-up',
  verdict: { supported: 'Supported', partial: 'Partially supported', notSupported: 'Not supported' },
  h1Notes: {
    supported: 'Model fitting reaches the target.',
    partial: 'Model fitting helps, but by less than the target: the interval is above zero, the estimate is below the target.',
    notSupported: 'The data do not show that model fitting beats the naive rule.',
  },
  h2Notes: {
    supported: 'Fingerprints are almost as good and much faster.',
    partial: 'Only one of the two conditions holds: the accuracy gap or the speed.',
    notSupported: 'Neither condition holds.',
  },
  rule: 'Targets and decision rules were fixed before any method was run. For H1: supported = the estimate reaches the target and the 95 % interval stays above 0; partially supported = the interval is above 0 but the estimate is below the target.',

  benchTitle: 'Benchmark: four ways to choose where to dig',
  benchSub: 'Dry holes before the leak is found: {n} random leaks of 5–25 L/s on the simulated network, {k} pressure sensors. Fewer is better; a leak not found in 10 digs counts as 10.',
  cols: { method: 'Method', dry: 'Dry holes (mean)', first: 'First dig finds it', three: 'Within 3 digs', never: 'Never found', time: 'Time per leak' },
  methods: {
    random: { name: 'Random order', desc: 'No information at all. The floor.' },
    naive: { name: 'Naive threshold', desc: 'Dig around the sensor that shows the biggest pressure drop, nearest places first. What a simple tool does.' },
    fingerprint: { name: 'Fingerprint matching', desc: 'Pre-computed: what a leak at each place would do to the sensors. Pick the place whose pattern matches best.' },
    fit: { name: 'Model fitting', desc: 'For every place, fit the leak size and the overall demand so that the hydraulic model matches the readings. Pick the best fit.' },
  },
  perLeak: 'per leak',

  holdTitle: 'Does it hold up?',
  holdSub: 'One thing is changed at a time ({n} leaks each). The last two columns show the share of dry holes saved against the naive rule (95 % interval); a minus sign means more.',
  holdCols: { check: 'Condition', naive: 'Naive', fingerprint: 'Fingerprint', fit: 'Model fit', saved: 'Dry holes saved vs naive' },
  conditionMain: 'Main experiment',
  conditionNoise: 'Sensor error {v} m',
  conditionSensors: '{v} sensors',
  conditionDemand: 'Demand uncertainty ×{v}',
  subgroupsTitle: 'Which leaks are hard to find?',
  subgroupLabels: ['Small leaks', 'Medium leaks', 'Large leaks', 'Leak on the main line', 'Leak elsewhere'],

  tryTitle: 'Try it: hunt a leak',
  trySub: 'A random leak opens somewhere in the network. The blue sensors report how much the pressure fell. Choose a method and let the crew dig, one place after another.',
  method: 'Method',
  newLeak: 'New random leak',
  digNext: 'Dig the next place',
  digAll: 'Dig until found',
  reveal: 'Show the leak',
  noise: 'Sensor error (m)',
  demand: 'Demand uncertainty (×)',
  readings: 'Pressure drop at the sensors, in metres of water',
  legendSensor: 'Pressure sensor',
  legendLeak: 'The hidden leak',
  legendDig: 'Dig (cross = dry hole)',
  statusIdle: 'No digs yet.',
  statusComputing: 'Computing…',
  statusFound: 'Found after {digs} digs, {dry} of them dry.',
  statusNotFound: 'Not found after {digs} digs.',
  leakInfo: 'This leak loses {lps} L/s.',
  tryNote: 'Set the sensor error and the demand uncertainty to 0 and the model finds almost every leak with its first dig: the hard part is the noise, not the algorithm.',

  moneyTitle: 'What it is worth, in lei and euro',
  moneySub: 'Every dry hole avoided saves the dig and the water that keeps running out while the crew digs elsewhere. The sliders are the assumptions: change them and see the payback move.',
  sliders: {
    leak: 'Leak size (L/s)',
    costDig: 'Cost of one dry hole (€)',
    daysDig: 'Days one dig takes',
    value: 'Share of the tariff a saved m³ is worth',
    leaksYear: 'Large leaks per year',
    system: 'Cost of the sensor system (€)',
    running: 'Running cost (€ a year)',
  },
  tariffNote: 'Tariff used: {tariff} lei per m³, Apă-Canal Chișinău, from the ANRE press release of 4 August 2026 (the decision text, with its date of effect and VAT, was not found). 1 € = {rate} lei (BNM, 5 November 2026).',
  waterLost: 'The leak loses {m3} m³ a day, about {mdl} lei at the tariff.',
  dryHoleCost: 'One dry hole costs {eur} € ({mdl} lei): the dig and the water lost while it takes place.',
  today: 'With the uncertainty of the main experiment',
  known: 'If customer demand were known',
  rows: { avoided: 'Dry holes avoided per leak', perLeak: 'Saved per leak', perYear: 'Saved per year, after running costs', payback: 'Payback' },
  never: 'never',
  months: 'months',
  breakEven: 'Break-even: {leaks} large leaks a year pay for the system in 5 years.',
  marketTitle: 'What the equipment costs',
  marketNote: 'Prices as found, with their sources. Where a page could not be opened, the table says so. They are anchors, not quotes.',

  limitsTitle: 'Limits',
  limits: [
    'It is a simulation of a drawn network, not a real district. No real leak, sensor or Moldovan network data were used.',
    'The model of the network is assumed to be exact. In a real city the pipe data are uncertain and the model must be calibrated first.',
    'One leak at a time, steady flow, sensors at junctions only. Leaks below about 5 L/s need other tools, such as acoustic loggers or night-flow analysis.',
    'A leak right next to the plant looks like a general rise in demand: pressure alone cannot find it.',
    'The costs of a dig, the number of leaks per year and the price of the system are assumptions, not data. They are the weakest part of the money estimate.',
  ],
  sourcesTitle: 'Method, sources and assumptions',
  sourcesBody: 'Hydraulics: Hazen-Williams head loss solved with the Global Gradient Algorithm (Todini and Pilati, 1988; the method of EPANET). Leak localisation with pressure sensors and a model: Pérez et al., IEEE Control Systems Magazine 34(4), 2014. Everything is in the open repository, with the pre-registration written before the run.',
  prereg: 'Read the pre-registration',
}

const ro: ResearchText = {
  eyebrow: 'Cercetare',
  title: 'Poate un model să găsească o scurgere mai repede decât ghicitul?',
  sub: 'Un test pe un oraș simulat. Ipotezele și regulile de decizie au fost scrise înainte de a rula orice: {n} scurgeri aleatorii, patru senzori de presiune, patru moduri de a alege unde să sapi.',

  hypothesesTitle: 'Ipoteze și verdicte',
  h1Label: 'H1 · Mai puține săpături în gol',
  h1Claim: 'Potrivirea modelului are cu cel puțin {target} mai puține săpături în gol decât regula naivă: sapi lângă senzorul cu cea mai mare scădere de presiune.',
  h2Label: 'H2 · Ieftină și destul de rapidă',
  h2Claim: 'Metoda simplă a amprentelor găsește scurgerea în cel mult trei săpături aproape la fel de des ca potrivirea modelului (cu cel mult {margin} puncte mai puțin) și e de cel puțin {speed} ori mai rapidă.',
  target: 'Țintă',
  observed: 'Observat',
  interval: 'Interval 95 %',
  gapLabel: 'Diferența față de potrivirea modelului',
  speedLabel: 'Accelerare',
  verdict: { supported: 'Susținută', partial: 'Parțial susținută', notSupported: 'Nesusținută' },
  h1Notes: {
    supported: 'Potrivirea modelului atinge ținta.',
    partial: 'Potrivirea modelului ajută, dar mai puțin decât ținta: intervalul e peste zero, estimarea e sub țintă.',
    notSupported: 'Datele nu arată că potrivirea modelului bate regula naivă.',
  },
  h2Notes: {
    supported: 'Amprentele sunt aproape la fel de bune și mult mai rapide.',
    partial: 'Doar una dintre cele două condiții e îndeplinită: diferența de precizie sau viteza.',
    notSupported: 'Nicio condiție nu e îndeplinită.',
  },
  rule: 'Țintele și regulile de decizie au fost fixate înainte de a rula orice metodă. Pentru H1: susținută = estimarea atinge ținta, iar intervalul de 95 % rămâne peste 0; parțial susținută = intervalul e peste 0, dar estimarea e sub țintă.',

  benchTitle: 'Benchmark: patru moduri de a alege unde să sapi',
  benchSub: 'Săpături în gol până se găsește scurgerea: {n} scurgeri aleatorii de 5–25 L/s pe rețeaua simulată, {k} senzori de presiune. Mai puțin e mai bine; o scurgere negăsită în 10 săpături se numără ca 10.',
  cols: { method: 'Metodă', dry: 'Săpături în gol (medie)', first: 'Prima săpătură o găsește', three: 'În cel mult 3 săpături', never: 'Negăsită', time: 'Timp pe scurgere' },
  methods: {
    random: { name: 'Ordine aleatorie', desc: 'Nicio informație. Nivelul de jos.' },
    naive: { name: 'Prag naiv', desc: 'Sapi în jurul senzorului cu cea mai mare scădere de presiune, începând cu locurile cele mai apropiate. Ce face o unealtă simplă.' },
    fingerprint: { name: 'Potrivirea amprentelor', desc: 'Calculată dinainte: ce ar face o scurgere în fiecare loc senzorilor. Alegi locul al cărui tipar se potrivește cel mai bine.' },
    fit: { name: 'Potrivirea modelului', desc: 'Pentru fiecare loc, potrivești mărimea scurgerii și cererea totală astfel încât modelul hidraulic să se potrivească cu citirile. Alegi cea mai bună potrivire.' },
  },
  perLeak: 'pe scurgere',

  holdTitle: 'Rezistă la verificare?',
  holdSub: 'Se schimbă câte un singur lucru ({n} scurgeri fiecare). Ultimele două coloane arată partea de săpături în gol economisită față de regula naivă (interval 95 %); semnul minus înseamnă mai multe.',
  holdCols: { check: 'Condiție', naive: 'Naiv', fingerprint: 'Amprente', fit: 'Model', saved: 'Săpături în gol economisite față de naiv' },
  conditionMain: 'Experimentul principal',
  conditionNoise: 'Eroare de senzor {v} m',
  conditionSensors: '{v} senzori',
  conditionDemand: 'Incertitudine a cererii ×{v}',
  subgroupsTitle: 'Care scurgeri sunt greu de găsit?',
  subgroupLabels: ['Scurgeri mici', 'Scurgeri medii', 'Scurgeri mari', 'Scurgere pe magistrala principală', 'Scurgere în altă parte'],

  tryTitle: 'Încearcă: vânează o scurgere',
  trySub: 'O scurgere aleatorie apare undeva în rețea. Senzorii albaștri arată cu cât a scăzut presiunea. Alege o metodă și lasă echipa să sape, un loc după altul.',
  method: 'Metodă',
  newLeak: 'Scurgere aleatorie nouă',
  digNext: 'Sapă în locul următor',
  digAll: 'Sapă până o găsește',
  reveal: 'Arată scurgerea',
  noise: 'Eroare de senzor (m)',
  demand: 'Incertitudinea cererii (×)',
  readings: 'Scăderea de presiune la senzori, în metri coloană de apă',
  legendSensor: 'Senzor de presiune',
  legendLeak: 'Scurgerea ascunsă',
  legendDig: 'Săpătură (cruce = în gol)',
  statusIdle: 'Nicio săpătură încă.',
  statusComputing: 'Se calculează…',
  statusFound: 'Găsită după {digs} săpături, dintre care {dry} în gol.',
  statusNotFound: 'Negăsită după {digs} săpături.',
  leakInfo: 'Această scurgere pierde {lps} L/s.',
  tryNote: 'Pune eroarea senzorului și incertitudinea cererii la 0 și modelul găsește aproape orice scurgere din prima săpătură: partea grea e zgomotul, nu algoritmul.',

  moneyTitle: 'Cât valorează, în lei și euro',
  moneySub: 'Fiecare săpătură în gol evitată economisește săpătura și apa care continuă să curgă cât timp echipa sapă în altă parte. Cursoarele sunt ipotezele: schimbă-le și vezi cum se mută amortizarea.',
  sliders: {
    leak: 'Mărimea scurgerii (L/s)',
    costDig: 'Costul unei săpături în gol (€)',
    daysDig: 'Zile pe săpătură',
    value: 'Partea din tarif pe care o valorează un m³ economisit',
    leaksYear: 'Scurgeri mari pe an',
    system: 'Costul sistemului de senzori (€)',
    running: 'Cost de funcționare (€ pe an)',
  },
  tariffNote: 'Tarif folosit: {tariff} lei pe m³, Apă-Canal Chișinău, din comunicatul ANRE din 4 august 2026 (textul deciziei, cu data intrării în vigoare și TVA, nu a fost găsit). 1 € = {rate} lei (BNM, 5 noiembrie 2026).',
  waterLost: 'Scurgerea pierde {m3} m³ pe zi, circa {mdl} lei la tarif.',
  dryHoleCost: 'O săpătură în gol costă {eur} € ({mdl} lei): săpătura și apa pierdută cât durează.',
  today: 'Cu incertitudinea experimentului principal',
  known: 'Dacă cererea clienților ar fi cunoscută',
  rows: { avoided: 'Săpături în gol evitate pe scurgere', perLeak: 'Economie pe scurgere', perYear: 'Economie pe an, după costurile de funcționare', payback: 'Amortizare' },
  never: 'niciodată',
  months: 'luni',
  breakEven: 'Prag de rentabilitate: {leaks} scurgeri mari pe an plătesc sistemul în 5 ani.',
  marketTitle: 'Cât costă echipamentul',
  marketNote: 'Prețurile așa cum au fost găsite, cu sursele lor. Unde o pagină nu a putut fi deschisă, tabelul spune asta. Sunt repere, nu oferte.',

  limitsTitle: 'Limite',
  limits: [
    'Este o simulare a unei rețele desenate, nu a unui cartier real. Nu s-au folosit scurgeri, senzori sau date reale din rețele din Moldova.',
    'Modelul rețelei se presupune exact. Într-un oraș real datele conductelor sunt incerte, iar modelul trebuie calibrat mai întâi.',
    'O singură scurgere pe rând, debit constant, senzori doar în noduri. Scurgerile sub circa 5 L/s cer alte unelte, cum ar fi senzori acustici sau analiza debitului de noapte.',
    'O scurgere chiar lângă stație seamănă cu o creștere generală a cererii: presiunea singură nu o poate găsi.',
    'Costul unei săpături, numărul de scurgeri pe an și prețul sistemului sunt ipoteze, nu date. Sunt partea cea mai slabă a estimării în bani.',
  ],
  sourcesTitle: 'Metodă, surse și ipoteze',
  sourcesBody: 'Hidraulică: pierdere de sarcină Hazen-Williams, rezolvată cu Algoritmul Gradientului Global (Todini și Pilati, 1988; metoda din EPANET). Localizarea scurgerilor cu senzori de presiune și un model: Pérez et al., IEEE Control Systems Magazine 34(4), 2014. Totul este în depozitul deschis, cu pre-înregistrarea scrisă înainte de rulare.',
  prereg: 'Citește pre-înregistrarea',
}

const ru: ResearchText = {
  eyebrow: 'Исследование',
  title: 'Может ли модель найти утечку быстрее, чем угадывание?',
  sub: 'Проверка на смоделированном городе. Гипотезы и правила решения были записаны до запуска чего-либо: {n} случайных утечек, четыре датчика давления, четыре способа выбрать, где копать.',

  hypothesesTitle: 'Гипотезы и вердикты',
  h1Label: 'H1 · Меньше пустых раскопок',
  h1Claim: 'Подгонка модели требует как минимум на {target} меньше пустых раскопок, чем наивное правило: копать рядом с датчиком с самым большим падением давления.',
  h2Label: 'H2 · Дёшево и достаточно быстро',
  h2Claim: 'Простой метод отпечатков находит утечку не более чем за три раскопки почти так же часто, как подгонка модели (не более чем на {margin} пунктов реже) и как минимум в {speed} раз быстрее.',
  target: 'Цель',
  observed: 'Результат',
  interval: 'Интервал 95 %',
  gapLabel: 'Отставание от подгонки модели',
  speedLabel: 'Ускорение',
  verdict: { supported: 'Подтверждена', partial: 'Подтверждена частично', notSupported: 'Не подтверждена' },
  h1Notes: {
    supported: 'Подгонка модели достигает цели.',
    partial: 'Подгонка модели помогает, но меньше, чем цель: интервал выше нуля, оценка ниже цели.',
    notSupported: 'Данные не показывают, что подгонка модели лучше наивного правила.',
  },
  h2Notes: {
    supported: 'Отпечатки почти так же хороши и намного быстрее.',
    partial: 'Выполняется только одно из двух условий: разница в точности или скорость.',
    notSupported: 'Ни одно из условий не выполняется.',
  },
  rule: 'Цели и правила решения были зафиксированы до запуска любого метода. Для H1: подтверждена = оценка достигает цели, а интервал 95 % остаётся выше 0; подтверждена частично = интервал выше 0, но оценка ниже цели.',

  benchTitle: 'Сравнение: четыре способа выбрать, где копать',
  benchSub: 'Пустые раскопки до нахождения утечки: {n} случайных утечек 5–25 л/с на смоделированной сети, датчиков давления: {k}. Чем меньше, тем лучше; утечка, не найденная за 10 раскопок, считается как 10.',
  cols: { method: 'Метод', dry: 'Пустые раскопки (среднее)', first: 'Первая раскопка находит', three: 'Не более 3 раскопок', never: 'Не найдена', time: 'Время на утечку' },
  methods: {
    random: { name: 'Случайный порядок', desc: 'Никакой информации. Нижняя планка.' },
    naive: { name: 'Наивный порог', desc: 'Копать вокруг датчика с самым большим падением давления, начиная с ближайших мест. Так делает простой инструмент.' },
    fingerprint: { name: 'Сопоставление отпечатков', desc: 'Заранее посчитано: что утечка в каждом месте сделала бы с датчиками. Выбирается место, чей рисунок подходит лучше всего.' },
    fit: { name: 'Подгонка модели', desc: 'Для каждого места подбираются размер утечки и общий расход, чтобы гидравлическая модель совпала с показаниями. Выбирается лучшая подгонка.' },
  },
  perLeak: 'на утечку',

  holdTitle: 'Выдерживает ли проверку?',
  holdSub: 'Меняется только одно за раз (по {n} утечек). В последних двух столбцах показана доля сэкономленных пустых раскопок по сравнению с наивным правилом (интервал 95 %); знак минус означает больше.',
  holdCols: { check: 'Условие', naive: 'Наивный', fingerprint: 'Отпечатки', fit: 'Модель', saved: 'Сэкономлено пустых раскопок против наивного' },
  conditionMain: 'Основной эксперимент',
  conditionNoise: 'Погрешность датчика {v} м',
  conditionSensors: 'Датчиков: {v}',
  conditionDemand: 'Неопределённость спроса ×{v}',
  subgroupsTitle: 'Какие утечки трудно найти?',
  subgroupLabels: ['Малые утечки', 'Средние утечки', 'Большие утечки', 'Утечка на магистрали', 'Утечка в другом месте'],

  tryTitle: 'Попробуйте: найдите утечку',
  trySub: 'Где-то в сети открывается случайная утечка. Синие датчики показывают, на сколько упало давление. Выберите метод и пусть бригада копает, место за местом.',
  method: 'Метод',
  newLeak: 'Новая случайная утечка',
  digNext: 'Копать в следующем месте',
  digAll: 'Копать, пока не найдёт',
  reveal: 'Показать утечку',
  noise: 'Погрешность датчика (м)',
  demand: 'Неопределённость спроса (×)',
  readings: 'Падение давления на датчиках, в метрах водяного столба',
  legendSensor: 'Датчик давления',
  legendLeak: 'Скрытая утечка',
  legendDig: 'Раскопка (крест = пустая)',
  statusIdle: 'Раскопок ещё нет.',
  statusComputing: 'Вычисление…',
  statusFound: 'Найдена после {digs} раскопок, из них пустых {dry}.',
  statusNotFound: 'Не найдена после {digs} раскопок.',
  leakInfo: 'Эта утечка теряет {lps} л/с.',
  tryNote: 'Поставьте погрешность датчика и неопределённость спроса на 0, и модель находит почти любую утечку с первой раскопки: трудность в шуме, а не в алгоритме.',

  moneyTitle: 'Сколько это стоит, в леях и евро',
  moneySub: 'Каждая избежанная пустая раскопка экономит саму раскопку и воду, которая продолжает вытекать, пока бригада копает в другом месте. Ползунки — это допущения: меняйте их и смотрите, как сдвигается окупаемость.',
  sliders: {
    leak: 'Размер утечки (л/с)',
    costDig: 'Стоимость одной пустой раскопки (€)',
    daysDig: 'Дней на одну раскопку',
    value: 'Доля тарифа, которую стоит сэкономленный м³',
    leaksYear: 'Больших утечек в год',
    system: 'Стоимость системы датчиков (€)',
    running: 'Эксплуатационные расходы (€ в год)',
  },
  tariffNote: 'Использованный тариф: {tariff} лея за м³, Apă-Canal Chișinău, из пресс-релиза ANRE от 4 августа 2026 года (текст решения с датой вступления в силу и НДС не найден). 1 € = {rate} лея (НБМ, 5 ноября 2026).',
  waterLost: 'Утечка теряет {m3} м³ в сутки, около {mdl} леев по тарифу.',
  dryHoleCost: 'Одна пустая раскопка стоит {eur} € ({mdl} леев): сама раскопка и вода, потерянная за это время.',
  today: 'С неопределённостью основного эксперимента',
  known: 'Если бы спрос клиентов был известен',
  rows: { avoided: 'Избежано пустых раскопок на утечку', perLeak: 'Экономия на утечку', perYear: 'Экономия в год после эксплуатационных расходов', payback: 'Окупаемость' },
  never: 'никогда',
  months: 'мес.',
  breakEven: 'Порог окупаемости: {leaks} больших утечек в год окупают систему за 5 лет.',
  marketTitle: 'Сколько стоит оборудование',
  marketNote: 'Цены как найдены, с источниками. Если страницу не удалось открыть, в таблице это сказано. Это ориентиры, а не предложения.',

  limitsTitle: 'Ограничения',
  limits: [
    'Это моделирование нарисованной сети, а не реального района. Реальные утечки, датчики и данные сетей Молдовы не использовались.',
    'Модель сети считается точной. В реальном городе данные о трубах неопределённы, и модель сначала нужно откалибровать.',
    'Одна утечка за раз, установившийся поток, датчики только в узлах. Утечки меньше примерно 5 л/с требуют других средств, например акустических датчиков или анализа ночного расхода.',
    'Утечка прямо рядом со станцией похожа на общий рост спроса: одним давлением её не найти.',
    'Стоимость раскопки, число утечек в год и цена системы — допущения, а не данные. Это самое слабое место денежной оценки.',
  ],
  sourcesTitle: 'Метод, источники и допущения',
  sourcesBody: 'Гидравлика: потери напора по Хазену—Вильямсу, решаются глобальным градиентным алгоритмом (Todini и Pilati, 1988; метод EPANET). Локализация утечек по датчикам давления и модели: Pérez и др., IEEE Control Systems Magazine 34(4), 2014. Всё в открытом репозитории, предрегистрация написана до запуска.',
  prereg: 'Читать предрегистрацию',
}

export const researchText: Record<Lang, ResearchText> = { en, ro, ru }
