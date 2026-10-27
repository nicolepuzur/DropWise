import { useId, type CSSProperties } from 'react'
import type { MethodId } from '../utils/irrigation'

function vars(values: Record<string, string | number>): CSSProperties {
  return values as CSSProperties
}

/** A tiny animated picture of one way of watering a field. */
export function FieldArt({ method }: { method: MethodId }) {
  const id = useId().replace(/:/g, '')
  const rows = [46, 60, 74]
  return (
    <svg viewBox="0 0 160 96" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d2b66" />
          <stop offset="1" stopColor="#0a3a2c" />
        </linearGradient>
      </defs>
      <rect width="160" height="96" rx="12" fill={`url(#${id}-bg)`} />
      <rect y="38" width="160" height="58" fill="#0b3a2a" opacity=".6" />

      {method === 'flood' && (
        <g>
          <rect y="42" width="160" height="54" fill="#2d8cff" opacity=".42" />
          <path d="M0 44q10-4 20 0t20 0 20 0 20 0 20 0 20 0 20 0 20 0" fill="none" stroke="#9fe8ff" strokeOpacity=".8" strokeWidth="1.500" className="anim-sway" style={vars({ '--dur': '5s' })} />
          {[24, 62, 98, 132].map((x, i) => (
            <circle key={x} cx={x} cy="40" r="2.200" fill="#cfe5ff" className="scene-el anim-fall" style={vars({ '--fall': '-24px', '--dur': '2.8s', '--delay': `${i * 0.6}s` })} />
          ))}
        </g>
      )}

      {method === 'sprinkler' && (
        <g>
          <rect x="76" y="30" width="5" height="40" fill="#8fb0dc" />
          <circle cx="78.500" cy="29" r="4" fill="#cfe5ff" />
          {[1, 2, 3].map((k) => (
            <path key={k} d={`M78 29 q ${22 + k * 10} ${-26 - k * 4} ${44 + k * 22} ${32 + k * 4}`} fill="none" stroke="#7fdcff" strokeWidth="1.800" className="anim-dash" style={vars({ '--dur': `${1.4 + k * 0.3}s` })} />
          ))}
          {[1, 2, 3].map((k) => (
            <path key={`l${k}`} d={`M78 29 q ${-22 - k * 10} ${-26 - k * 4} ${-44 - k * 22} ${32 + k * 4}`} fill="none" stroke="#7fdcff" strokeWidth="1.800" className="anim-dash" style={vars({ '--dur': `${1.4 + k * 0.3}s` })} />
          ))}
        </g>
      )}

      {method === 'drip' && (
        <g>
          <line x1="8" y1="52" x2="152" y2="52" stroke="#8fe3ff" strokeWidth="1.600" className="anim-dash" style={vars({ '--dur': '2.4s' })} />
          {[28, 62, 96, 130].map((x, i) => (
            <circle key={x} cx={x} cy="53" r="2.200" fill="#9fe8ff" className="scene-el anim-fall" style={vars({ '--fall': '16px', '--dur': '1.8s', '--delay': `${i * 0.4}s` })} />
          ))}
        </g>
      )}

      {rows.map((y, r) =>
        [20, 54, 88, 122].map((x) => (
          <g key={`${r}-${x}`}>
            <circle cx={x + (r % 2) * 10} cy={y + 8} r="5" fill="#47d68b" />
            <circle cx={x + (r % 2) * 10 - 1.500} cy={y + 6} r="2.200" fill="#b4f5cb" opacity=".7" />
          </g>
        )),
      )}
    </svg>
  )
}
