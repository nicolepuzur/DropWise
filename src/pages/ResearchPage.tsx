import benchmark from '../../research/results/benchmark.json'
import { Panel, SectionHead } from '../components/controls'
import { LeakHunt } from '../components/LeakHunt'
import { LeakMoney } from '../components/LeakMoney'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { EXTERNAL, ROUTES } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'
import { researchText } from '../i18n/research'
import type { Lang } from '../i18n/translations'
import { fill, formatNumber } from '../utils/format'

const METHODS = ['random', 'naive', 'fingerprint', 'fit'] as const
type Method = (typeof METHODS)[number]

interface Interval {
  estimate: number
  low: number
  high: number
}

const PREREGISTRATION_URL = `${EXTERNAL.repo}/blob/main/research/PREREGISTRATION.md`

const pct = (x: number, lang: Lang, digits = 1) => `${formatNumber(x * 100, lang, digits)} %`
const interval = (i: Interval, lang: Lang) => `${pct(i.low, lang)} … ${pct(i.high, lang)}`

function verdictKey(verdict: string): 'supported' | 'partial' | 'notSupported' {
  return verdict === 'supported' ? 'supported' : verdict === 'partially supported' ? 'partial' : 'notSupported'
}

const VERDICT_STYLE = {
  supported: 'border-[#47d68b]/60 bg-[#47d68b]/10 text-[#7ee0a8]',
  partial: 'border-sand/60 bg-sand/10 text-sand',
  notSupported: 'border-coral/60 bg-coral/10 text-coral',
} as const

function VerdictPill({ kind, label }: { kind: keyof typeof VERDICT_STYLE; label: string }) {
  return <span className={`inline-block rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${VERDICT_STYLE[kind]}`}>{label}</span>
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow !text-[0.62rem]">{label}</p>
      <p className="display mt-1.5 !normal-case text-[clamp(1.2rem,2vw,1.7rem)] tracking-[0.04em] text-white">{value}</p>
    </div>
  )
}

function formatMs(ms: number, lang: Lang): string {
  if (ms < 1) return `${formatNumber(ms * 1000, lang)} µs`
  if (ms < 100) return `${formatNumber(ms, lang, 1)} ms`
  return `${formatNumber(ms, lang)} ms`
}

export function ResearchPage() {
  const { t, lang } = useLanguage()
  const r = researchText[lang]
  const main = benchmark.main
  const n = main.condition.scenarios
  const h1 = benchmark.hypotheses.h1
  const h2 = benchmark.hypotheses.h2
  const h1Kind = verdictKey(h1.verdict)
  const h2Kind = verdictKey(h2.verdict)

  const dry = (e: { methods: Record<string, { meanDryHoles: Interval }> }): Record<'naive' | 'fingerprint' | 'fit', number> => ({
    naive: e.methods.naive.meanDryHoles.estimate,
    fingerprint: e.methods.fingerprint.meanDryHoles.estimate,
    fit: e.methods.fit.meanDryHoles.estimate,
  })
  const demandKnown = benchmark.robustness.find((c) => c.condition.demandFactor === 0)

  const conditionLabel = (c: { noiseM: number; sensorCount: number; demandFactor: number; label: string }) => {
    if (c.label.startsWith('sensor error')) return fill(r.conditionNoise, { v: formatNumber(c.noiseM, lang, 2) })
    if (c.label.endsWith('sensors')) return fill(r.conditionSensors, { v: c.sensorCount })
    if (c.label.startsWith('demand')) return fill(r.conditionDemand, { v: formatNumber(c.demandFactor, lang, 1) })
    return r.conditionMain
  }

  const holdRows = [
    { label: r.conditionMain, scenarios: n, summary: main },
    ...benchmark.robustness.map((e) => ({ label: conditionLabel(e.condition), scenarios: e.condition.scenarios, summary: e })),
  ]

  return (
    <div>
      <PageHeader eyebrow={r.eyebrow} title={r.title} sub={fill(r.sub, { n: formatNumber(n, lang) })} />

      <Section tone="plain" className="!pt-12">
        <SectionHead title={r.hypothesesTitle} />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Panel className="h-full">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow">{r.h1Label}</p>
                <VerdictPill kind={h1Kind} label={r.verdict[h1Kind]} />
              </div>
              <p className="mt-5 text-lg leading-relaxed text-ice/85">{fill(r.h1Claim, { target: pct(h1.target, lang, 0) })}</p>
              <div className="mt-7 grid grid-cols-3 gap-4">
                <Stat label={r.target} value={`≥ ${pct(h1.target, lang, 0)}`} />
                <Stat label={r.observed} value={pct(h1.reduction.estimate, lang)} />
                <Stat label={r.interval} value={interval(h1.reduction, lang)} />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-ice/70">{r.h1Notes[h1Kind]}</p>
            </Panel>
          </Reveal>

          <Reveal delay={100}>
            <Panel className="h-full">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="eyebrow">{r.h2Label}</p>
                <VerdictPill kind={h2Kind} label={r.verdict[h2Kind]} />
              </div>
              <p className="mt-5 text-lg leading-relaxed text-ice/85">{fill(r.h2Claim, { margin: formatNumber(h2.marginShare * 100, lang, 0), speed: h2.requiredSpeedUp })}</p>
              <div className="mt-7 grid grid-cols-3 gap-4">
                <Stat label={r.target} value={`≤ ${formatNumber(h2.marginShare * 100, lang, 0)} · ≥ ${h2.requiredSpeedUp}×`} />
                <Stat label={r.gapLabel} value={`${formatNumber(h2.gapFitMinusFingerprint.estimate * 100, lang, 1)} (≤ ${formatNumber(h2.gapFitMinusFingerprint.high * 100, lang, 1)})`} />
                <Stat label={r.speedLabel} value={`${formatNumber(h2.speedUp, lang)}×`} />
              </div>
              <p className="mt-6 text-sm leading-relaxed text-ice/70">{r.h2Notes[h2Kind]}</p>
            </Panel>
          </Reveal>
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed text-ice/55">{r.rule}</p>
        <div className="mt-6">
          <Pill href={PREREGISTRATION_URL} plain>
            {r.prereg}
          </Pill>
        </div>
      </Section>

      <Section tone="glow">
        <SectionHead title={r.benchTitle} body={fill(r.benchSub, { n: formatNumber(n, lang), k: benchmark.meta.sensorJunctions.length })} />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="text-ice/60">
                <th className="pb-3 pr-4 font-normal">{r.cols.method}</th>
                <th className="pb-3 pr-4 font-normal">{r.cols.dry}</th>
                <th className="pb-3 pr-4 font-normal">{r.cols.first}</th>
                <th className="pb-3 pr-4 font-normal">{r.cols.three}</th>
                <th className="pb-3 pr-4 font-normal">{r.cols.never}</th>
                <th className="pb-3 font-normal">{r.cols.time}</th>
              </tr>
            </thead>
            <tbody>
              {METHODS.map((m: Method) => {
                const s = main.methods[m]
                return (
                  <tr key={m} className="border-t border-line align-top">
                    <th className="max-w-[18rem] py-4 pr-4 font-normal">
                      <span className="block font-medium text-white">{r.methods[m].name}</span>
                      <span className="mt-1 block text-xs leading-snug text-ice/55">{r.methods[m].desc}</span>
                    </th>
                    <td className="mono py-4 pr-4 text-aqua">
                      {formatNumber(s.meanDryHoles.estimate, lang, 2)}
                      <span className="block text-xs text-ice/45">
                        {formatNumber(s.meanDryHoles.low, lang, 2)} – {formatNumber(s.meanDryHoles.high, lang, 2)}
                      </span>
                    </td>
                    <td className="mono py-4 pr-4">{pct(s.firstDigFinds, lang)}</td>
                    <td className="mono py-4 pr-4">{pct(s.withinThreeDigs, lang)}</td>
                    <td className="mono py-4 pr-4">{pct(s.neverFound, lang)}</td>
                    <td className="mono py-4">{formatMs(s.medianMilliseconds, lang)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="plain">
        <SectionHead title={r.holdTitle} body={fill(r.holdSub, { n: formatNumber(benchmark.robustness[0].condition.scenarios, lang) })} />
        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="text-ice/60">
                <th className="pb-3 pr-4 font-normal">{r.holdCols.check}</th>
                <th className="pb-3 pr-4 font-normal">{r.holdCols.naive}</th>
                <th className="pb-3 pr-4 font-normal">{r.holdCols.fingerprint}</th>
                <th className="pb-3 pr-4 font-normal">{r.holdCols.fit}</th>
                <th className="pb-3 pr-4 font-normal">{r.methods.fingerprint.name}: {r.holdCols.saved}</th>
                <th className="pb-3 font-normal">{r.methods.fit.name}: {r.holdCols.saved}</th>
              </tr>
            </thead>
            <tbody>
              {holdRows.map(({ label, summary }) => (
                <tr key={label} className="border-t border-line">
                  <th className="py-3 pr-4 font-normal text-white">{label}</th>
                  <td className="mono py-3 pr-4">{formatNumber(summary.methods.naive.meanDryHoles.estimate, lang, 2)}</td>
                  <td className="mono py-3 pr-4">{formatNumber(summary.methods.fingerprint.meanDryHoles.estimate, lang, 2)}</td>
                  <td className="mono py-3 pr-4">{formatNumber(summary.methods.fit.meanDryHoles.estimate, lang, 2)}</td>
                  <td className="mono py-3 pr-4 text-aqua">
                    {pct(summary.reductionVersusNaive.fingerprint.estimate, lang, 0)}
                    <span className="block text-xs text-ice/45">{interval(summary.reductionVersusNaive.fingerprint, lang)}</span>
                  </td>
                  <td className="mono py-3 text-aqua">
                    {pct(summary.reductionVersusNaive.fit.estimate, lang, 0)}
                    <span className="block text-xs text-ice/45">{interval(summary.reductionVersusNaive.fit, lang)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="display mt-16 text-[clamp(1.2rem,2.2vw,1.7rem)]">{r.subgroupsTitle}</h3>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="text-ice/60">
                <th className="pb-3 pr-4 font-normal">{r.holdCols.check}</th>
                <th className="pb-3 pr-4 font-normal">{r.holdCols.naive}</th>
                <th className="pb-3 pr-4 font-normal">{r.holdCols.fingerprint}</th>
                <th className="pb-3 pr-4 font-normal">{r.holdCols.fit}</th>
                <th className="pb-3 font-normal">{r.methods.fit.name}: {r.holdCols.saved}</th>
              </tr>
            </thead>
            <tbody>
              {benchmark.subgroups.map((g, i) => (
                <tr key={g.label} className="border-t border-line">
                  <th className="py-3 pr-4 font-normal text-white">
                    {r.subgroupLabels[i]} <span className="text-xs text-ice/45">({formatNumber(g.scenarios, lang)})</span>
                  </th>
                  <td className="mono py-3 pr-4">{formatNumber(g.meanDryHoles.naive, lang, 2)}</td>
                  <td className="mono py-3 pr-4">{formatNumber(g.meanDryHoles.fingerprint, lang, 2)}</td>
                  <td className="mono py-3 pr-4">{formatNumber(g.meanDryHoles.fit, lang, 2)}</td>
                  <td className="mono py-3 text-aqua">
                    {pct(g.reductionVersusNaive.fit.estimate, lang, 0)}
                    <span className="block text-xs text-ice/45">{interval(g.reductionVersusNaive.fit, lang)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="glow">
        <SectionHead title={r.tryTitle} body={r.trySub} />
        <div className="mt-10">
          <LeakHunt />
        </div>
      </Section>

      <Section tone="plain">
        <SectionHead title={r.moneyTitle} body={r.moneySub} />
        <div className="mt-10">
          <LeakMoney dryToday={dry(main)} dryKnown={dry(demandKnown ?? main)} />
        </div>
      </Section>

      <Section tone="glow">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="display text-[clamp(1.4rem,2.6vw,2rem)]">{r.limitsTitle}</h2>
            <ul className="mt-6 space-y-3 text-[0.98rem] leading-relaxed text-ice/75">
              {r.limits.map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="display text-[clamp(1.4rem,2.6vw,2rem)]">{r.sourcesTitle}</h2>
            <p className="mt-6 text-[0.98rem] leading-relaxed text-ice/75">{r.sourcesBody}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Pill href={PREREGISTRATION_URL} plain>
                {r.prereg}
              </Pill>
              <Pill to={ROUTES.leaks} plain>
                {t.nav.leaks}
              </Pill>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
