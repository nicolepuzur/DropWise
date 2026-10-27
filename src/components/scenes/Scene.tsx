import { useId, type CSSProperties, type ReactElement } from 'react'
import { PIPES, PLANT, START_LEAKS } from '../../utils/leaks'

export type SceneId = 'drop' | 'field' | 'loop' | 'sea' | 'pipes' | 'tap'

/** A small seeded random generator, so every scene looks the same on every render. */
function rng(seed: number): () => number {
  let a = seed * 2654435761
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** CSS custom properties for the animation helpers in index.css. */
function vars(values: Record<string, string | number>): CSSProperties {
  return values as CSSProperties
}

const DROP_PATH = 'M0 -40 C 10 -16, 28 4, 28 24 A28 28 0 0 1 -28 24 C -28 4 -10 -16 0 -40 Z'
const W = 1600
const H = 900

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

function wavePath(y: number, amp: number, wavelength: number): string {
  const start = -wavelength * 2
  const halves = Math.ceil((W + wavelength * 4) / (wavelength / 2))
  let d = `M${start} ${y} q ${wavelength / 4} ${-amp} ${wavelength / 2} 0`
  for (let i = 1; i < halves; i++) d += ` t ${wavelength / 2} 0`
  const end = start + (halves * wavelength) / 2
  return `${d} L${end} ${H} L${start} ${H} Z`
}

function Stars({ count, height, seed }: { count: number; height: number; seed: number }) {
  const random = rng(seed)
  return (
    <g fill="#dff1ff">
      {Array.from({ length: count }, (_, i) => {
        const x = random() * W
        const y = random() * height
        const r = 0.7 + random() * 1.5
        const delay = random() * 4
        return <circle key={i} cx={x} cy={y} r={r} className="anim-twinkle" style={vars({ '--dur': `${3 + random() * 3}s`, '--delay': `${delay}s` })} />
      })}
    </g>
  )
}

function DropShape({ x, y, scale = 1, fall, dur, delay = 0, glow = true, id }: { x: number; y: number; scale?: number; fall: number; dur: number; delay?: number; glow?: boolean; id: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <g className="scene-el anim-fall" style={vars({ '--fall': `${fall / scale}px`, '--dur': `${dur}s`, '--delay': `${delay}s` })}>
        {glow && <circle cx="0" cy="8" r="64" fill={`url(#${id}-glow)`} />}
        <path d={DROP_PATH} fill={`url(#${id}-drop)`} />
        <path d="M-14 18 A14 14 0 0 0 -3 31" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3.500" strokeLinecap="round" />
      </g>
    </g>
  )
}

function Defs({ id }: { id: string }) {
  return (
    <>
      <linearGradient id={`${id}-drop`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#d8f4ff" />
        <stop offset="0.5" stopColor="#5fd3ff" />
        <stop offset="1" stopColor="#2563ff" />
      </linearGradient>
      <radialGradient id={`${id}-glow`}>
        <stop offset="0" stopColor="#5fd3ff" stopOpacity=".55" />
        <stop offset="1" stopColor="#5fd3ff" stopOpacity="0" />
      </radialGradient>
    </>
  )
}

/** 1 — a single drop above parched, cracked ground at dusk. */
function SceneDrop({ id }: { id: string }) {
  const cracks = [
    'M800 780 L650 805 L575 858 L480 900',
    'M800 780 L955 800 L1045 852 L1135 900',
    'M800 780 L792 835 L765 900',
    'M650 805 L565 796 L470 814 L370 802',
    'M955 800 L1040 778 L1140 788 L1245 770',
    'M800 780 L705 752 L612 736 L520 712',
    'M800 780 L912 756 L992 730 L1092 714',
    'M575 858 L505 880 L430 872',
    'M1045 852 L1115 872 L1195 868',
    'M520 712 L440 720 L360 706',
    'M1092 714 L1180 724 L1262 708',
  ]
  return (
    <>
      <defs>
        <Defs id={id} />
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030816" />
          <stop offset="0.45" stopColor="#0b1b4d" />
          <stop offset="0.78" stopColor="#47396a" />
          <stop offset="1" stopColor="#d9783f" />
        </linearGradient>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a4a22" />
          <stop offset="0.45" stopColor="#4a2610" />
          <stop offset="1" stopColor="#140903" />
        </linearGradient>
        <radialGradient id={`${id}-horizon`} cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="#ffb259" stopOpacity=".6" />
          <stop offset="1" stopColor="#ffb259" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height="580" fill={`url(#${id}-sky)`} />
      <Stars count={80} height={380} seed={3} />
      <ellipse cx="800" cy="580" rx="900" ry="300" fill={`url(#${id}-horizon)`} />
      <path d="M0 580 C 200 535 380 560 560 546 C 760 530 900 566 1100 546 C 1300 526 1450 560 1600 538 L1600 600 L0 600Z" fill="#1a0e14" />
      <rect y="570" width={W} height="330" fill={`url(#${id}-ground)`} />
      {cracks.map((d, i) => (
        <g key={i} fill="none" strokeLinejoin="round" strokeLinecap="round">
          <path d={d} stroke="#ffb259" strokeOpacity=".22" strokeWidth="9" />
          <path d={d} stroke="#0b0402" strokeWidth="3.500" />
        </g>
      ))}
      <ellipse cx="800" cy="782" rx="300" ry="46" fill={`url(#${id}-glow)`} className="anim-pulse" style={vars({ '--dur': '4.2s' })} />
      {[0, 0.25, 0.5].map((d, i) => (
        <ellipse
          key={i}
          cx="800"
          cy="782"
          rx="230"
          ry="36"
          fill="none"
          stroke="#8fe3ff"
          strokeWidth="2.500"
          className="scene-el anim-ripple"
          style={vars({ '--dur': '4.2s', '--delay': `${-0.3 - d * 1.2}s` })}
        />
      ))}
      <DropShape id={id} x={800} y={110} scale={1.15} fall={640} dur={4.2} />
    </>
  )
}

/** 2 — rows of crops under a low sun, with drip lines feeding every plant. */
function SceneField({ id }: { id: string }) {
  const horizon = 430
  const idx = Array.from({ length: 17 }, (_, i) => i - 8)
  const topX = (i: number) => 800 + i * 18
  const bottomX = (i: number) => 800 + i * 215
  const random = rng(11)
  const ts = [0.1, 0.17, 0.26, 0.37, 0.5, 0.66, 0.86]
  return (
    <>
      <defs>
        <Defs id={id} />
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030a24" />
          <stop offset="0.5" stopColor="#0f2d6b" />
          <stop offset="0.82" stopColor="#1f7a95" />
          <stop offset="1" stopColor="#f4a85f" />
        </linearGradient>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f6b4a" />
          <stop offset="1" stopColor="#0b2a22" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14503a" />
          <stop offset="1" stopColor="#06170f" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#ffe3b0" stopOpacity=".95" />
          <stop offset="0.25" stopColor="#ffb259" stopOpacity=".5" />
          <stop offset="1" stopColor="#ffb259" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={horizon + 10} fill={`url(#${id}-sky)`} />
      <Stars count={40} height={240} seed={5} />
      <circle cx="800" cy={horizon - 6} r="360" fill={`url(#${id}-sun)`} />
      <circle cx="800" cy={horizon - 6} r="44" fill="#ffe9c4" />
      <path d={`M0 ${horizon} C 220 ${horizon - 46} 420 ${horizon - 12} 640 ${horizon - 30} C 860 ${horizon - 48} 1040 ${horizon - 6} 1240 ${horizon - 28} C 1400 ${horizon - 42} 1500 ${horizon - 14} 1600 ${horizon - 24} L1600 ${horizon + 6} L0 ${horizon + 6}Z`} fill="#06241f" />
      {idx.slice(0, -1).map((i) => (
        <polygon
          key={i}
          points={`${topX(i)},${horizon} ${topX(i + 1)},${horizon} ${bottomX(i + 1)},${H} ${bottomX(i)},${H}`}
          fill={`url(#${id}-${i % 2 === 0 ? 'a' : 'b'})`}
        />
      ))}
      {idx.slice(0, -1).map((i) => {
        const c = i + 0.5
        const x1 = 800 + c * 18
        const x2 = 800 + c * 215
        return (
          <g key={`row-${i}`}>
            <line x1={x1} y1={horizon} x2={x2} y2={H} stroke="#8fe3ff" strokeWidth="2.200" strokeOpacity=".75" className="anim-dash" style={vars({ '--dur': `${2.2 + (i % 3) * 0.4}s` })} />
            {ts.map((t, k) => {
              const x = x1 + (x2 - x1) * t
              const y = horizon + (H - horizon) * t
              const r = 2.5 + t * 24
              return (
                <g key={k}>
                  <circle cx={x} cy={y} r={r} fill="#47d68b" fillOpacity={0.55 + t * 0.3} />
                  <circle cx={x - r * 0.25} cy={y - r * 0.3} r={r * 0.45} fill="#b4f5cb" fillOpacity=".55" />
                  <circle
                    cx={x + r * 0.9}
                    cy={y - r * 0.2}
                    r={1.2 + t * 4}
                    fill="#9fe8ff"
                    className="scene-el anim-fall"
                    style={vars({ '--fall': `${6 + t * 46}px`, '--dur': '2.6s', '--delay': `${random() * 2.6}s` })}
                  />
                </g>
              )
            })}
          </g>
        )
      })}
    </>
  )
}

/** 3 — a loop of arrows around a glowing drop, over a city skyline. */
function SceneLoop({ id }: { id: string }) {
  const cx = 800
  const cy = 410
  const random = rng(21)
  const buildings = Array.from({ length: 30 }, (_, i) => ({ x: i * 56 - 20, w: 44 + random() * 22, h: 70 + random() * 210 }))

  const ring = (r: number, width: number, opacity: number, reverse: boolean, dur: number, stroke: string) => {
    const arcs: [number, number][] = [
      [-20, 140],
      [160, 320],
    ]
    return (
      <g className="anim-spin" style={{ ...vars({ '--dur': `${dur}s` }), animationDirection: reverse ? 'reverse' : 'normal', transformOrigin: `${cx}px ${cy}px`, transformBox: 'view-box' }}>
        {arcs.map(([a, b], i) => {
          const [x1, y1] = polar(cx, cy, r, a)
          const [x2, y2] = polar(cx, cy, r, b)
          const [t1x, t1y] = polar(cx, cy, r + width * 1.7, b)
          const [t2x, t2y] = polar(cx, cy, r - width * 1.7, b)
          const [tipx, tipy] = polar(cx, cy, r, b + 11)
          return (
            <g key={i} opacity={opacity}>
              <path d={`M${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2}`} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" />
              <polygon points={`${t1x},${t1y} ${t2x},${t2y} ${tipx},${tipy}`} fill={stroke} />
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <>
      <defs>
        <Defs id={id} />
        <radialGradient id={`${id}-bg`} cx="0.5" cy="0.47" r="0.75">
          <stop offset="0" stopColor="#1f4fe0" stopOpacity=".7" />
          <stop offset="0.45" stopColor="#0a246f" stopOpacity=".6" />
          <stop offset="1" stopColor="#030a1f" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#030a1f" />
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <Stars count={60} height={500} seed={9} />
      {[130, 205, 300, 420].map((r, i) => (
        <circle key={r} cx={cx} cy={cy} r={r} fill="none" stroke="#cfe5ff" strokeOpacity={0.14 - i * 0.02} strokeDasharray={i % 2 ? '4 14' : '1 9'} strokeWidth="1.500" />
      ))}
      {ring(215, 9, 0.95, false, 46, '#5fd3ff')}
      {ring(310, 5, 0.6, true, 70, '#cfe5ff')}
      <circle cx={cx} cy={cy} r="120" fill={`url(#${id}-glow)`} className="anim-pulse" style={vars({ '--dur': '4s' })} />
      <g transform={`translate(${cx} ${cy - 10}) scale(2.3)`}>
        <path d={DROP_PATH} fill={`url(#${id}-drop)`} />
        <path d="M-14 18 A14 14 0 0 0 -3 31" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
      </g>
      <g fill="#030a1c">
        {buildings.map((b, i) => (
          <rect key={i} x={b.x} y={H - b.h} width={b.w} height={b.h} />
        ))}
      </g>
      <g fill="#8fe3ff">
        {buildings.flatMap((b, i) =>
          Array.from({ length: 3 }, (_, k) => {
            const wx = b.x + 8 + k * 12
            const wy = H - b.h + 14 + ((i * 7 + k * 13) % 5) * 22
            return <rect key={`${i}-${k}`} x={wx} y={wy} width="5" height="7" className="anim-twinkle" style={vars({ '--dur': `${3 + ((i + k) % 5)}s`, '--delay': `${(i * k) % 4}s` })} />
          }),
        )}
      </g>
    </>
  )
}

/** 4 — sunset over the sea, a desalination plant on the shore and solar panels in front. */
function SceneSea({ id }: { id: string }) {
  const horizon = 520
  const random = rng(33)
  return (
    <>
      <defs>
        <Defs id={id} />
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040b27" />
          <stop offset="0.5" stopColor="#10306e" />
          <stop offset="0.85" stopColor="#c36a52" />
          <stop offset="1" stopColor="#ffbe73" />
        </linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d5f93" />
          <stop offset="0.35" stopColor="#0a3366" />
          <stop offset="1" stopColor="#030d22" />
        </linearGradient>
        <linearGradient id={`${id}-panel`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f58d6" />
          <stop offset="1" stopColor="#081c52" />
        </linearGradient>
        <radialGradient id={`${id}-sun`}>
          <stop offset="0" stopColor="#fff0cf" stopOpacity="1" />
          <stop offset="0.2" stopColor="#ffbe73" stopOpacity=".6" />
          <stop offset="1" stopColor="#ffbe73" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={horizon} fill={`url(#${id}-sky)`} />
      <Stars count={50} height={280} seed={7} />
      <circle cx="1060" cy={horizon - 10} r="380" fill={`url(#${id}-sun)`} />
      <circle cx="1060" cy={horizon - 14} r="58" fill="#fff0cf" />
      <rect y={horizon} width={W} height={H - horizon} fill={`url(#${id}-sea)`} />
      {Array.from({ length: 21 }, (_, k) => {
        const w = 40 + k * 20
        return (
          <rect
            key={k}
            x={1060 - w / 2}
            y={horizon + 8 + k * 17}
            width={w}
            height={3 + k * 0.28}
            rx="2"
            fill="#ffd9a0"
            opacity={Math.max(0.12, 0.8 - k * 0.035)}
            className="anim-twinkle"
            style={vars({ '--dur': `${2 + random() * 3}s`, '--delay': `${random() * 3}s` })}
          />
        )
      })}
      <path d={wavePath(horizon + 70, 10, 220)} fill="#0a3366" fillOpacity=".55" className="anim-sway" style={vars({ '--dur': '16s' })} />
      <path d={wavePath(horizon + 150, 16, 300)} fill="#06224a" fillOpacity=".7" className="anim-sway" style={vars({ '--dur': '12s', '--delay': '-4s' })} />
      <path d={wavePath(horizon + 250, 22, 380)} fill="#041633" fillOpacity=".85" className="anim-sway" style={vars({ '--dur': '9s', '--delay': '-2s' })} />

      <g transform={`translate(120 ${horizon + 6})`}>
        <rect x="0" y="-44" width="300" height="44" fill="#050f26" />
        <rect x="24" y="-84" width="56" height="40" fill="#050f26" />
        <rect x="104" y="-70" width="40" height="26" fill="#050f26" />
        <rect x="170" y="-100" width="14" height="56" fill="#050f26" />
        <rect x="214" y="-60" width="64" height="16" fill="#050f26" />
        <circle cx="177" cy="-104" r="3.500" fill="#ff5d73" className="anim-twinkle" style={vars({ '--dur': '2s' })} />
        {[34, 58, 120, 232, 262].map((x, i) => (
          <rect key={x} x={x} y="-30" width="6" height="8" fill="#8fe3ff" className="anim-twinkle" style={vars({ '--dur': `${2.5 + i}s` })} />
        ))}
      </g>

      {[0, 1, 2].map((row) => {
        const scale = 0.7 + row * 0.3
        const y = 650 + row * 90
        return (
          <g key={row} transform={`translate(${60 + row * 18} ${y}) scale(${scale})`}>
            {[0, 1, 2, 3, 4].map((col) => (
              <g key={col} transform={`translate(${col * 150} 0) skewX(-26)`}>
                <rect width="136" height="72" rx="3" fill={`url(#${id}-panel)`} stroke="#5fd3ff" strokeOpacity=".7" strokeWidth="2" />
                <path d="M45 0V72M90 0V72M0 24H136M0 48H136" stroke="#5fd3ff" strokeOpacity=".35" strokeWidth="1.300" />
                <path d="M4 4H60L36 68H4Z" fill="#fff" fillOpacity=".08" />
              </g>
            ))}
          </g>
        )
      })}
    </>
  )
}

/** 5 — the water network at night: flowing pipes and a few red leaks. */
function ScenePipes({ id }: { id: string }) {
  const scale = 1.5
  const gridLines = Array.from({ length: 14 }, (_, i) => i)
  return (
    <>
      <defs>
        <Defs id={id} />
        <radialGradient id={`${id}-bg`} cx="0.45" cy="0.5" r="0.85">
          <stop offset="0" stopColor="#0d2f7a" stopOpacity=".75" />
          <stop offset="1" stopColor="#030a1f" />
        </radialGradient>
        <radialGradient id={`${id}-leak`}>
          <stop offset="0" stopColor="#ff5d73" stopOpacity=".7" />
          <stop offset="1" stopColor="#ff5d73" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#030a1f" />
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      <g stroke="#cfe5ff" strokeOpacity=".05">
        {gridLines.map((i) => (
          <g key={i}>
            <line x1={i * 120} y1="0" x2={i * 120} y2={H} />
            <line x1="0" y1={i * 70} x2={W} y2={i * 70} />
          </g>
        ))}
      </g>
      <g transform={`translate(52 30) scale(${scale})`}>
        {PIPES.map((p, i) => (
          <g key={i} strokeLinecap="round">
            <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#0a2a6e" strokeWidth="15" />
            <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#2563ff" strokeOpacity=".55" strokeWidth="5" />
            <line x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} stroke="#8fe3ff" strokeWidth="2.500" className="anim-dash" style={vars({ '--dur': `${2.4 + (i % 4) * 0.5}s` })} />
          </g>
        ))}
        {PIPES.flatMap((p, i) => [
          <circle key={`a${i}`} cx={p.x1} cy={p.y1} r="9" fill="#06184a" stroke="#5fd3ff" strokeOpacity=".7" strokeWidth="2" />,
          <circle key={`b${i}`} cx={p.x2} cy={p.y2} r="9" fill="#06184a" stroke="#5fd3ff" strokeOpacity=".7" strokeWidth="2" />,
        ])}
        <circle cx={PLANT.x} cy={PLANT.y} r="34" fill={`url(#${id}-glow)`} className="anim-pulse" />
        <circle cx={PLANT.x} cy={PLANT.y} r="15" fill="#5fd3ff" />
        {START_LEAKS.map((leak, i) => (
          <g key={leak.id}>
            <circle cx={leak.x} cy={leak.y} r={26 + leak.share * 2} fill={`url(#${id}-leak)`} className="anim-pulse" style={vars({ '--delay': `${i * 0.4}s` })} />
            <circle cx={leak.x} cy={leak.y} r="9" fill="#ff5d73" />
            <circle cx={leak.x} cy={leak.y} r="30" fill="none" stroke="#ff5d73" strokeWidth="2" className="scene-el anim-ripple" style={vars({ '--dur': '2.6s', '--delay': `${i * 0.45}s` })} />
            <circle cx={leak.x + 4} cy={leak.y + 10} r="3.500" fill="#ff9fab" className="scene-el anim-fall" style={vars({ '--fall': '42px', '--dur': '1.8s', '--delay': `${i * 0.3}s` })} />
          </g>
        ))}
      </g>
    </>
  )
}

/** 6 — a tap at home: one drop forming, falling into still water. */
function SceneTap({ id }: { id: string }) {
  const random = rng(44)
  const bokeh = Array.from({ length: 22 }, () => ({ x: random() * W, y: random() * 700, r: 12 + random() * 60, o: 0.05 + random() * 0.13, d: 3 + random() * 4, delay: random() * 4 }))
  return (
    <>
      <defs>
        <Defs id={id} />
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#030d28" />
          <stop offset="0.6" stopColor="#0a3a63" />
          <stop offset="1" stopColor="#0d6a82" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3b5a8e" />
          <stop offset="0.3" stopColor="#e8f3ff" />
          <stop offset="0.55" stopColor="#8fb0dc" />
          <stop offset="1" stopColor="#26406e" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5fd3ff" stopOpacity=".55" />
          <stop offset="1" stopColor="#0b3a78" stopOpacity=".9" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-bg)`} />
      {bokeh.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#8fe3ff" fillOpacity={b.o} className="scene-el anim-pulse" style={vars({ '--dur': `${b.d}s`, '--delay': `${b.delay}s` })} />
      ))}
      <g transform="translate(300 0)">
        <rect x="760" y="-30" width="76" height="262" rx="12" fill={`url(#${id}-metal)`} />
        <rect x="740" y="206" width="236" height="66" rx="33" fill={`url(#${id}-metal)`} />
        <rect x="926" y="262" width="56" height="36" rx="9" fill={`url(#${id}-metal)`} />
        <rect x="748" y="120" width="22" height="92" rx="9" fill={`url(#${id}-metal)`} transform="rotate(-20 760 212)" />
        <ellipse cx="798" cy="222" rx="52" ry="9" fill="#fff" fillOpacity=".25" />
        <DropShape id={id} x={954} y={312} scale={0.85} fall={440} dur={3.8} />
      </g>
      <rect y="790" width={W} height="110" fill={`url(#${id}-water)`} />
      <path d="M0 790 H1600" stroke="#cfe5ff" strokeOpacity=".6" strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="1254" cy="800" rx="260" ry="26" fill="none" stroke="#cfe5ff" strokeWidth="2.200" className="scene-el anim-ripple" style={vars({ '--dur': '3.8s', '--delay': `${-0.2 - i * 1.1}s` })} />
      ))}
    </>
  )
}

const SCENES: Record<SceneId, (props: { id: string }) => ReactElement> = {
  drop: SceneDrop,
  field: SceneField,
  loop: SceneLoop,
  sea: SceneSea,
  pipes: ScenePipes,
  tap: SceneTap,
}

/** Where each scene is anchored when the screen is narrower than the picture; most are centred. */
const ANCHOR: Partial<Record<SceneId, string>> = { tap: 'xMaxYMid slice' }

interface SceneProps {
  scene: SceneId
  className?: string
  /** Stops the animations (used for slides that are out of view). */
  paused?: boolean
}

/** A full-bleed animated scene drawn in SVG. It always fills its parent, cropping to cover. */
export function Scene({ scene, className = '', paused = false }: SceneProps) {
  const uid = useId().replace(/:/g, '')
  const Art = SCENES[scene]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={ANCHOR[scene] ?? 'xMidYMid slice'} className={`absolute inset-0 h-full w-full ${paused ? 'scene-paused' : ''} ${className}`} aria-hidden="true" focusable="false">
      <Art id={`s${uid}`} />
    </svg>
  )
}
