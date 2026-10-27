import { useState, type PointerEvent } from 'react'
import { FormulaBox, Panel } from '../components/controls'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { ROUTES } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'
import { fill, formatNumber } from '../utils/format'
import { deliveredPercent, dig, freshLeaks, lostPercent, m3FromPercent, NETWORK_H, NETWORK_W, peopleServed, PIPES, PLANT, sensorHint, START_LEAKS, type Leak } from '../utils/leaks'

interface Mark {
  id: number
  x: number
  y: number
  hit: boolean
}

type Message = { kind: 'hit' | 'miss'; text: string } | null

export function LeaksPage() {
  const { t, lang } = useLanguage()
  const l = t.leaks
  const [leaks, setLeaks] = useState<Leak[]>(freshLeaks)
  const [sensors, setSensors] = useState(false)
  const [marks, setMarks] = useState<Mark[]>([])
  const [message, setMessage] = useState<Message>(null)

  const lost = lostPercent(leaks)
  const delivered = deliveredPercent(leaks)
  const holes = marks.length
  const dry = marks.filter((m) => !m.hit).length
  const fixedCount = leaks.filter((leak) => leak.fixed).length
  const done = lost === 0

  function onDig(event: PointerEvent<SVGSVGElement>) {
    if (done) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) * NETWORK_W) / rect.width
    const y = ((event.clientY - rect.top) * NETWORK_H) / rect.height
    const result = dig(leaks, x, y)
    setLeaks(result.leaks)
    setMarks((m) => [...m, { id: m.length, x, y, hit: result.hit !== null }])
    setMessage(
      result.hit
        ? { kind: 'hit', text: fill(l.hit, { m3: formatNumber(m3FromPercent(result.hit.share), lang) }) }
        : { kind: 'miss', text: l.miss },
    )
  }

  function restart() {
    setLeaks(freshLeaks())
    setMarks([])
    setMessage(null)
  }

  return (
    <div>
      <PageHeader eyebrow={l.eyebrow} title={l.title} sub={l.sub} />

      <Section tone="plain" className="!pt-12">
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <Panel className="!p-3 sm:!p-4">
            <svg
              viewBox={`0 0 ${NETWORK_W} ${NETWORK_H}`}
              className={`w-full touch-manipulation rounded-2xl bg-[#030b21] ${done ? '' : 'cursor-crosshair'}`}
              role="img"
              aria-label={l.mapLabel}
              onPointerDown={onDig}
            >
              <defs>
                <pattern id="leak-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M50 0H0V50" fill="none" stroke="#cfe5ff" strokeOpacity=".05" />
                </pattern>
              </defs>
              <rect width={NETWORK_W} height={NETWORK_H} fill="url(#leak-grid)" />

              {PIPES.map((p, i) => (
                <g key={i} strokeLinecap="round">
                  <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#0a2a6e" strokeWidth="13" />
                  <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#2563ff" strokeOpacity=".55" strokeWidth="4" />
                  <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#8fe3ff" strokeWidth="2" className="anim-dash" style={{ ['--dur' as string]: `${2.6 + (i % 4) * 0.5}s` }} />
                </g>
              ))}

              <circle cx={PLANT.x} cy={PLANT.y} r="22" fill="#06184a" stroke="#5fd3ff" strokeWidth="2.500" />
              <path d={`M${PLANT.x} ${PLANT.y - 11} c -3.500 6 -8 9 -8 14.500 a 8 8 0 0 0 16 0 c 0 -5.500 -4.500 -8.500 -8 -14.500 z`} fill="#5fd3ff" />
              <text x={PLANT.x} y={PLANT.y + 44} textAnchor="middle" fontSize="15" fill="#cfe5ff">
                {l.plant}
              </text>

              {leaks.map((leak) => {
                if (leak.fixed) return null
                if (!sensors) return null
                const hint = sensorHint(leak)
                return (
                  <g key={leak.id} className="pointer-events-none">
                    <circle cx={hint.x} cy={hint.y} r={hint.r} fill="#ff5d73" fillOpacity=".12" stroke="#ff5d73" strokeOpacity=".7" strokeDasharray="5 6" className="scene-el anim-pulse" />
                    <circle cx={hint.x} cy={hint.y} r="3" fill="#ff5d73" />
                  </g>
                )
              })}

              {marks.map((mark) => (
                <g key={mark.id} className="pointer-events-none" transform={`translate(${mark.x} ${mark.y})`}>
                  {mark.hit ? (
                    <>
                      <circle r="13" fill="#47d68b" fillOpacity=".25" stroke="#47d68b" strokeWidth="2" />
                      <path d="M-6 0l4 4 8-8" fill="none" stroke="#47d68b" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : (
                    <path d="M-7 -7l14 14M7 -7l-14 14" stroke="#ffb259" strokeWidth="2.500" strokeLinecap="round" />
                  )}
                </g>
              ))}
            </svg>

            <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4 text-sm" aria-live="polite">
              <p className={message?.kind === 'hit' ? 'text-[#7ee0a8]' : message?.kind === 'miss' ? 'text-sand' : 'text-ice/60'}>{message?.text ?? (sensors ? l.hintOn : l.hintOff)}</p>
              <p className="text-ice/45">{done ? '' : l.instruction}</p>
            </div>
          </Panel>

          <div className="space-y-6">
            <Panel>
              <div className="flex h-3 overflow-hidden rounded-full bg-white/10" role="img" aria-label={`${l.gaugeDelivered}: ${delivered} %, ${l.gaugeLost}: ${lost} %`}>
                <div className="bg-aqua transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${delivered}%` }} />
                <div className="bg-coral transition-[width] duration-700 ease-[var(--ease-out-expo)]" style={{ width: `${lost}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="eyebrow !text-[0.66rem]">{l.gaugeDelivered}</p>
                  <p className="display mt-1 text-3xl text-aqua">{delivered} %</p>
                </div>
                <div>
                  <p className="eyebrow !text-[0.66rem]">{l.gaugeLost}</p>
                  <p className="display mt-1 text-3xl text-coral">{lost} %</p>
                </div>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5 text-center">
                <div>
                  <dt className="eyebrow !text-[0.6rem]">{l.holes}</dt>
                  <dd className="display mt-1 text-xl">{holes}</dd>
                </div>
                <div>
                  <dt className="eyebrow !text-[0.6rem]">{l.dry}</dt>
                  <dd className="display mt-1 text-xl text-sand">{dry}</dd>
                </div>
                <div>
                  <dt className="eyebrow !text-[0.6rem]">{l.fixed}</dt>
                  <dd className="display mt-1 text-xl text-[#7ee0a8]">
                    {fixedCount}/{START_LEAKS.length}
                  </dd>
                </div>
              </dl>
            </Panel>

            <Panel>
              <button
                type="button"
                onClick={() => setSensors((on) => !on)}
                aria-pressed={sensors}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left font-medium transition-colors ${sensors ? 'border-aqua bg-aqua/10 text-white' : 'border-line text-ice/80 hover:border-ice/40'}`}
              >
                {sensors ? l.sensorsOn : l.sensorsOff}
                <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${sensors ? 'bg-aqua' : 'bg-white/15'}`} aria-hidden="true">
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-ink transition-[left] ${sensors ? 'left-6' : 'left-1'}`} />
                </span>
              </button>
              <p className="mt-4 text-sm leading-relaxed text-ice/60">{sensors ? l.hintOn : l.hintOff}</p>
              <div className="mt-5">
                <Pill onClick={restart} plain>
                  {l.restart}
                </Pill>
              </div>
            </Panel>
          </div>
        </div>

        {done && (
          <div className="mt-6 rounded-3xl border border-aqua/40 bg-aqua/[0.07] p-8 text-center sm:p-10">
            <h2 className="display text-2xl">{l.winTitle}</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-ice/85">
              {fill(l.winBody, { m3: formatNumber(m3FromPercent(START_LEAKS.reduce((sum, leak) => sum + leak.share, 0)), lang), people: formatNumber(peopleServed(m3FromPercent(38)), lang), holes, dry })}
            </p>
          </div>
        )}

        <div className="mt-16">
          <Reveal>
            <h2 className="display text-[clamp(1.4rem,2.6vw,2rem)]">{l.factsTitle}</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {l.facts.map((fact, i) => (
              <Reveal key={fact.title} delay={i * 100}>
                <article className="card-glass h-full p-7">
                  <p className="mono text-xs tracking-[0.2em] text-aqua">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="mt-4 text-xl font-medium">{fact.title}</h3>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-ice/75">{fact.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FormulaBox title={t.common.formula} lines={[l.note]} />
        </div>

        <Reveal className="mt-14">
          <Pill to={ROUTES.athome}>{t.nav.athome}</Pill>
        </Reveal>
      </Section>
    </div>
  )
}
