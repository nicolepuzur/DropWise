import { useMemo, useRef, useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { researchText } from '../i18n/research'
import { DIG_RADIUS, NETWORK_H, NETWORK_W, PIPES, PLANT } from '../utils/leaks'
import { fill, formatNumber } from '../utils/format'
import { nextDigPlace } from '../utils/network/crew'
import type { PipePosition } from '../utils/network/graph'
import { createFingerprintRanker, createModelFitRanker, rankNaive, rankRandom, type Ranking } from '../utils/network/localize'
import { createRng } from '../utils/network/random'
import { createWorld, makeScenario } from '../utils/network/scenario'
import { Chips, Panel, RangeField } from './controls'

type MethodId = 'random' | 'naive' | 'fingerprint' | 'fit'
const METHOD_IDS: readonly MethodId[] = ['random', 'naive', 'fingerprint', 'fit']
const MAX_DIGS = 10

/** The same network, sensors and places as the benchmark. */
const WORLD = createWorld(4, 20)
let fingerprintRanker: ReturnType<typeof createFingerprintRanker> | null = null
const fingerprint = () => (fingerprintRanker ??= createFingerprintRanker(WORLD))
const fit = createModelFitRanker(WORLD)

interface Dig {
  place: PipePosition
  hit: boolean
}

export function LeakHunt() {
  const { lang } = useLanguage()
  const r = researchText[lang]
  const [seed, setSeed] = useState(11)
  const [method, setMethod] = useState<MethodId>('fit')
  const [noise, setNoise] = useState(0.1)
  const [demand, setDemand] = useState(1)
  const [digs, setDigs] = useState<Dig[]>([])
  const [busy, setBusy] = useState(false)
  const [shown, setShown] = useState(false)
  const cache = useRef<{ key: string; ranking: Ranking } | null>(null)

  const scenario = useMemo(
    () =>
      makeScenario(WORLD, createRng(seed), {
        leakShare: { min: 0.02, max: 0.1 },
        referenceHead: 40,
        demand: { perJunction: 0.1 * demand, common: 0.05 * demand },
        sensorNoise: noise,
      }),
    [seed, noise, demand],
  )
  const leak = scenario.leak
  const found = digs.some((d) => d.hit)
  const finished = found || digs.length >= MAX_DIGS
  const revealLeak = shown || finished
  /** The leak loses its share of the 0.25 m3/s demand at the reference head of 40 m. */
  const leakLitres = formatNumber(leak.share * 250, lang, 1)

  function reset() {
    setDigs([])
    setShown(false)
  }

  function dig(count: number) {
    if (busy || finished) return
    setBusy(true)
    window.setTimeout(() => {
      const key = `${seed}|${noise}|${demand}|${method}`
      let ranking = cache.current?.key === key ? cache.current.ranking : null
      if (!ranking) {
        ranking =
          method === 'random'
            ? rankRandom(WORLD, createRng(seed + 1000))
            : method === 'naive'
              ? rankNaive(WORLD, scenario.drop)
              : method === 'fingerprint'
                ? fingerprint()(scenario.drop)
                : fit(scenario.drop)
        cache.current = { key, ranking }
      }
      const next = [...digs]
      while (count-- > 0 && next.length < MAX_DIGS && !next.some((d) => d.hit)) {
        const place = nextDigPlace(ranking, next.map((d) => d.place))
        if (!place) break
        next.push({ place, hit: Math.hypot(place.x - leak.x, place.y - leak.y) <= DIG_RADIUS })
      }
      setDigs(next)
      setBusy(false)
    }, 30)
  }

  const status = busy
    ? r.statusComputing
    : digs.length === 0
      ? r.statusIdle
      : found
        ? fill(r.statusFound, { digs: digs.length, dry: digs.length - 1 })
        : fill(r.statusNotFound, { digs: digs.length })

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
      <Panel className="!p-3 sm:!p-4">
        <svg viewBox={`0 0 ${NETWORK_W} ${NETWORK_H}`} className="w-full rounded-2xl bg-[#030b21]" role="img" aria-label={r.tryTitle}>
          {PIPES.map((p, i) => (
            <g key={i} strokeLinecap="round">
              <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#0a2a6e" strokeWidth="13" />
              <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#2563ff" strokeOpacity=".55" strokeWidth="4" />
            </g>
          ))}
          <circle cx={PLANT.x} cy={PLANT.y} r="22" fill="#06184a" stroke="#5fd3ff" strokeWidth="2.5" />
          <path d={`M${PLANT.x} ${PLANT.y - 11} c -3.5 6 -8 9 -8 14.5 a 8 8 0 0 0 16 0 c 0 -5.5 -4.5 -8.5 -8 -14.5 z`} fill="#5fd3ff" />

          {WORLD.sensors.map((node, j) => {
            const p = WORLD.graph.nodes[node]
            return (
              <g key={node} className="pointer-events-none">
                <rect x={p.x - 8} y={p.y - 8} width="16" height="16" rx="3" fill="#2563ff" stroke="#cfe5ff" strokeWidth="2" />
                <text x={p.x} y={p.y - 17} textAnchor="middle" fontSize="15" fill="#cfe5ff" className="mono">
                  {formatNumber(scenario.drop[j], lang, 2)}
                </text>
              </g>
            )
          })}

          {digs.map((d, i) => (
            <g key={i} className="pointer-events-none" transform={`translate(${d.place.x} ${d.place.y})`}>
              <circle r={DIG_RADIUS} fill="none" stroke={d.hit ? '#47d68b' : '#ffb259'} strokeOpacity=".35" strokeDasharray="4 5" />
              {d.hit ? (
                <path d="M-6 0l4 4 8-8" fill="none" stroke="#47d68b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              ) : (
                <path d="M-6 -6l12 12M6 -6l-12 12" stroke="#ffb259" strokeWidth="3" strokeLinecap="round" />
              )}
              <text x="10" y="-10" fontSize="15" fill="#fff" className="mono">
                {i + 1}
              </text>
            </g>
          ))}

          {revealLeak && (
            <g className="pointer-events-none">
              <circle cx={leak.x} cy={leak.y} r="11" fill="#ff5d73" fillOpacity=".25" stroke="#ff5d73" strokeWidth="2" />
              <circle cx={leak.x} cy={leak.y} r="3.5" fill="#ff5d73" />
            </g>
          )}
        </svg>

        <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-1 pt-4 text-sm" aria-live="polite">
          <p className={found ? 'text-[#7ee0a8]' : 'text-ice/70'}>{status}</p>
          <p className="text-ice/50">{revealLeak ? fill(r.leakInfo, { lps: leakLitres }) : r.readings}</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 px-2 pb-2 text-xs text-ice/55">
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#2563ff]" /> {r.legendSensor}
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-[#ff5d73]" /> {r.legendLeak}
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full border border-[#ffb259]" /> {r.legendDig}
          </li>
        </ul>
      </Panel>

      <div className="space-y-6">
        <Panel className="space-y-6">
          <Chips
            label={r.method}
            value={method}
            onChange={(m) => {
              setMethod(m)
              reset()
            }}
            options={METHOD_IDS.map((id) => ({ id, label: r.methods[id].name }))}
          />
          <RangeField
            id="hunt-noise"
            label={r.noise}
            value={noise}
            min={0}
            max={0.5}
            step={0.01}
            onChange={(v) => {
              setNoise(v)
              reset()
            }}
            display={formatNumber(noise, lang, 2)}
          />
          <RangeField
            id="hunt-demand"
            label={r.demand}
            value={demand}
            min={0}
            max={3}
            step={0.5}
            onChange={(v) => {
              setDemand(v)
              reset()
            }}
            display={`×${formatNumber(demand, lang, 1)}`}
          />
          <div className="grid gap-3">
            <button type="button" disabled={busy || finished} onClick={() => dig(1)} className="rounded-full bg-aqua px-5 py-3 font-semibold text-ink transition-opacity disabled:opacity-40">
              {r.digNext}
            </button>
            <button type="button" disabled={busy || finished} onClick={() => dig(MAX_DIGS)} className="rounded-full border border-line px-5 py-3 text-white transition-colors hover:border-ice/50 disabled:opacity-40">
              {r.digAll}
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSeed((s) => s + 1)
                  reset()
                }}
                className="rounded-full border border-line px-4 py-2.5 text-sm text-ice/80 transition-colors hover:border-ice/50 hover:text-white"
              >
                {r.newLeak}
              </button>
              <button type="button" onClick={() => setShown(true)} className="rounded-full border border-line px-4 py-2.5 text-sm text-ice/80 transition-colors hover:border-ice/50 hover:text-white">
                {r.reveal}
              </button>
            </div>
          </div>
        </Panel>
        <p className="px-1 text-sm leading-relaxed text-ice/60">{r.tryNote}</p>
      </div>
    </div>
  )
}
