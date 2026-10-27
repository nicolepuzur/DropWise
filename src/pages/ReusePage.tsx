import { BigStat, FormulaBox, Panel, RangeField } from '../components/controls'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { ROUTES } from '../constants/site'
import { useWater } from '../context/water'
import { useLanguage } from '../i18n/LanguageContext'
import { fill, formatCompact, formatM3, formatNumber } from '../utils/format'
import { OLYMPIC_POOL_M3 } from '../utils/irrigation'
import { calcReuse, MAX_LITRES, MIN_LITRES, nearestPeopleStep, PEOPLE_STEPS, REUSE_PRESETS } from '../utils/reuse'

/** Splits a label into two lines near its middle so it fits next to a pipe. */
function twoLines(text: string): [string, string] {
  if (text.length <= 12 || !text.includes(' ')) return [text, '']
  const middle = text.length / 2
  let best = text.indexOf(' ')
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' && Math.abs(i - middle) < Math.abs(best - middle)) best = i
  }
  return [text.slice(0, best), text.slice(best + 1)]
}

interface DiagramProps {
  rate: number
  labels: { tap: string; sewer: string; plant: string; reused: string; released: string }
}

/** Water from the taps to the plant, where the pipe splits in two: what is reused and what goes back to the river. */
function ReuseDiagram({ rate, labels }: DiagramProps) {
  const reusedWidth = Math.max(3, 34 * (rate / 100))
  const releasedWidth = Math.max(3, 34 * (1 - rate / 100))
  const nodes = [
    { x: 70, label: labels.tap },
    { x: 270, label: labels.sewer },
    { x: 470, label: labels.plant },
  ]
  const reused = twoLines(labels.reused)
  const released = twoLines(labels.released)

  const pipe = (d: string, width: number, flow: string, key: string) => (
    <g key={key} fill="none" strokeLinecap="round">
      <path d={d} stroke="#0a2a6e" strokeWidth={width + 8} />
      <path d={d} stroke="#2563ff" strokeOpacity=".55" strokeWidth={width} className="transition-[stroke-width] duration-500" />
      <path d={d} stroke={flow} strokeWidth="3" className="anim-dash" />
    </g>
  )

  return (
    <svg viewBox="0 0 900 290" className="w-full" role="img" aria-label={`${labels.tap} → ${labels.sewer} → ${labels.plant} → ${labels.reused} / ${labels.released}`}>
      {pipe('M70 145 H470', 34, '#8fe3ff', 'main')}
      {pipe('M500 145 C 590 145 590 72 670 72', reusedWidth, '#9ff5c8', 'reused')}
      {pipe('M500 145 C 590 145 590 218 670 218', releasedWidth, '#ffb259', 'released')}

      {nodes.map((node) => (
        <g key={node.label}>
          <circle cx={node.x} cy="145" r="30" fill="#06184a" stroke="#5fd3ff" strokeWidth="2" />
          <path d={`M${node.x} ${145 - 13} c -4 7 -9 11 -9 17 a 9 9 0 0 0 18 0 c 0 -6 -5 -10 -9 -17 z`} fill="#5fd3ff" />
          <text x={node.x} y="206" textAnchor="middle" fontSize="22" fill="#cfe5ff">
            {node.label}
          </text>
        </g>
      ))}

      <text x="690" y={reused[1] ? 66 : 80} fontSize="22" fill="#9ff5c8" fontWeight="600">
        <tspan x="690">{reused[0]}</tspan>
        {reused[1] && (
          <tspan x="690" dy="26">
            {reused[1]}
          </tspan>
        )}
      </text>
      <text x="690" y={released[1] ? 212 : 226} fontSize="22" fill="#ffb259" fontWeight="600">
        <tspan x="690">{released[0]}</tspan>
        {released[1] && (
          <tspan x="690" dy="26">
            {released[1]}
          </tspan>
        )}
      </text>
    </svg>
  )
}

export function ReusePage() {
  const { t, lang } = useLanguage()
  const { reuse: s, update } = useWater()
  const r = t.reuse
  const unit = t.common.units.m3
  const result = calcReuse(s.people, s.litres, s.rate)
  const stepIndex = PEOPLE_STEPS.indexOf(nearestPeopleStep(s.people))

  return (
    <div>
      <PageHeader eyebrow={r.eyebrow} title={r.title} sub={r.sub} />

      <Section tone="plain" className="!pt-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
          <Panel className="space-y-8">
            <RangeField
              id="people"
              label={r.cityLabel}
              value={stepIndex}
              min={0}
              max={PEOPLE_STEPS.length - 1}
              onChange={(index) => update('reuse', { people: PEOPLE_STEPS[index] })}
              display={`${formatCompact(PEOPLE_STEPS[stepIndex], lang)} ${t.common.units.people}`}
            />
            <RangeField
              id="litres"
              label={r.litresLabel}
              value={s.litres}
              min={MIN_LITRES}
              max={MAX_LITRES}
              step={5}
              onChange={(litres) => update('reuse', { litres })}
              display={`${s.litres} ${t.common.units.l}`}
            />
            <div>
              <RangeField id="rate" label={r.rateLabel} value={s.rate} min={0} max={100} onChange={(rate) => update('reuse', { rate })} display={`${s.rate} %`} />
              <div className="mt-4 flex flex-wrap gap-2">
                {REUSE_PRESETS.map((preset, k) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => update('reuse', { rate: preset })}
                    aria-pressed={s.rate === preset}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${s.rate === preset ? 'border-aqua bg-aqua/10 text-white' : 'border-line text-ice/70 hover:border-ice/40 hover:text-white'}`}
                  >
                    {r.presets[k]} · {preset} %
                  </button>
                ))}
              </div>
            </div>
          </Panel>

          <Panel>
            <ReuseDiagram rate={s.rate} labels={r.nodes} />
            <p className="mt-2 text-center text-sm text-ice/55">{r.reusedUses}</p>
            <div className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-8">
              <BigStat label={r.stats.wastewater} value={formatM3(result.wastewaterM3PerDay, lang, unit)} />
              <BigStat label={r.stats.reused} value={formatM3(result.reusedM3PerDay, lang, unit)} />
              <BigStat label={r.stats.year} value={formatM3(result.reusedM3PerYear, lang, unit)} />
              <BigStat label={r.stats.share} value={`${formatNumber(result.demandShare * 100, lang)} %`} />
            </div>
            <p className="mt-6 text-[0.95rem] text-ice/70">{fill(r.poolsNote, { pools: formatNumber(result.reusedM3PerYear / OLYMPIC_POOL_M3, lang) })}</p>
          </Panel>
        </div>

        <div className="mt-16">
          <Reveal>
            <h2 className="display text-[clamp(1.4rem,2.6vw,2rem)]">{r.examplesTitle}</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {r.examples.map((example, k) => (
              <Reveal key={example.title} delay={k * 100}>
                <article className="card-glass h-full p-7">
                  <h3 className="display text-xl">{example.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-ice/75">{example.body}</p>
                  <p className="mt-5 border-t border-line pt-3 text-xs text-ice/45">
                    {t.common.source}: {example.source}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FormulaBox title={r.formulaTitle} lines={r.formula} />
          <Panel>
            <p className="text-[0.98rem] leading-relaxed text-ice/80">{r.note}</p>
          </Panel>
        </div>

        <Reveal className="mt-14">
          <Pill to={ROUTES.desal}>{t.nav.desal}</Pill>
        </Reveal>
      </Section>
    </div>
  )
}
