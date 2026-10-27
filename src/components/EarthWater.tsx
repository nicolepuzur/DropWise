import { useMemo, useState } from 'react'
import { useInView } from '../hooks/useInView'
import { useLanguage } from '../i18n/LanguageContext'
import { allocateDots, EARTH_PARTS, partOfDot, SURFACE_PERCENT, type EarthPartId } from '../utils/earth'

type Active = EarthPartId | 'surface' | null

const COLORS: Record<EarthPartId | 'surface', { dot: string; glow: string; swatch: string }> = {
  salt: { dot: '#1d3f9e', glow: 'none', swatch: 'bg-[#1d3f9e]' },
  ice: { dot: '#e4f1ff', glow: '0 0 10px rgba(228,241,255,.7)', swatch: 'bg-[#e4f1ff]' },
  ground: { dot: '#5fd3ff', glow: '0 0 12px rgba(95,211,255,.8)', swatch: 'bg-aqua' },
  surface: { dot: '#ffb259', glow: '0 0 12px rgba(255,178,89,.9)', swatch: 'bg-sand' },
}

/** A dot is one litre; the lakes-and-rivers speck is drawn at its true area (0.007 L of one litre). */
function SurfaceSpeck() {
  const R = 38
  const r = R * Math.sqrt(SURFACE_PERCENT)
  return (
    <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0" aria-hidden="true">
      <circle cx="50" cy="50" r={R + 6} fill="none" stroke="#cfe5ff" strokeOpacity=".25" strokeDasharray="2 4" />
      <circle cx="50" cy="50" r={R} fill="#1d3f9e" fillOpacity=".55" />
      <circle cx="50" cy="50" r={Math.max(r, 3)} fill="#ffb259" />
    </svg>
  )
}

export function EarthWater() {
  const { t } = useLanguage()
  const e = t.problem.earth
  const [active, setActive] = useState<Active>(null)
  const { ref, seen } = useInView<HTMLDivElement>(0.2)
  const dots = useMemo(() => allocateDots(EARTH_PARTS.map((p) => p.percent)), [])

  const rows: { id: EarthPartId | 'surface'; name: string; amount: string; note: string }[] = [
    { id: 'salt', ...e.parts.salt },
    { id: 'ice', ...e.parts.ice },
    { id: 'ground', ...e.parts.ground },
    { id: 'surface', ...e.surface },
  ]

  const partIds: EarthPartId[] = EARTH_PARTS.map((p) => p.id)

  return (
    <div ref={ref} className="grid items-center gap-10 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
      <div className="mx-auto w-full max-w-[26rem]">
        <div className="grid grid-cols-10 gap-2.5 rounded-3xl border border-line bg-ink/40 p-5 sm:gap-3 sm:p-6" role="img" aria-label={`${e.title} ${e.body}`}>
          {Array.from({ length: 100 }, (_, i) => {
            const part = partIds[partOfDot(i, dots)]
            const lit = active === null || active === part || (active === 'surface' && part !== 'salt')
            const color = COLORS[part]
            return (
              <span
                key={i}
                className="aspect-square rounded-full transition-[opacity,transform,box-shadow] duration-500"
                style={{
                  background: color.dot,
                  boxShadow: lit ? color.glow : 'none',
                  opacity: seen ? (lit ? 1 : 0.18) : 0,
                  transform: seen ? 'scale(1)' : 'scale(0.4)',
                  transitionDelay: seen && active === null ? `${i * 9}ms` : '0ms',
                }}
              />
            )
          })}
        </div>
      </div>

      <div>
        <ul className="divide-y divide-line border-y border-line" onMouseLeave={() => setActive(null)}>
          {rows.map((row) => {
            const on = active === row.id
            return (
              <li key={row.id}>
                <button
                  type="button"
                  aria-expanded={on}
                  onMouseEnter={() => setActive(row.id)}
                  onFocus={() => setActive(row.id)}
                  onClick={() => setActive(on ? null : row.id)}
                  className="flex w-full items-start gap-4 py-4 text-left"
                >
                  <span className={`mt-2 h-3 w-3 shrink-0 rounded-full ${COLORS[row.id].swatch}`} />
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-4">
                      <span className={`text-lg font-medium ${on ? 'text-white' : 'text-ice/85'}`}>{row.name}</span>
                      <span className="display !normal-case text-xl tracking-[0.04em] text-aqua">{row.amount}</span>
                    </span>
                    <span className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <span className="overflow-hidden">
                        <span className="mt-2 flex items-center gap-4 pb-1 text-[0.95rem] leading-relaxed text-ice/70">
                          {row.id === 'surface' && <SurfaceSpeck />}
                          <span>{row.note}</span>
                        </span>
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-xs text-ice/45">{e.source}</p>
      </div>
    </div>
  )
}
