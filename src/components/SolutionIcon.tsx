export type IconId = 'drip' | 'loop' | 'sun' | 'pipe' | 'home'

const STROKE = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

/** Line icons for the five solutions, drawn on a 96 × 96 grid. */
export function SolutionIcon({ id, className = 'h-20 w-20' }: { id: IconId; className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={className} aria-hidden="true">
      {id === 'drip' && (
        <g {...STROKE}>
          <path d="M48 84V54" />
          <path d="M48 62c-12 0-18-7-18-17 11 0 18 6 18 17z" />
          <path d="M48 54c0-10 6-16 17-16 0 10-6 16-17 16z" />
          <path d="M48 8c-4 6-8 10-8 15a8 8 0 0 0 16 0c0-5-4-9-8-15z" />
          <path d="M14 88h68" />
        </g>
      )}
      {id === 'loop' && (
        <g {...STROKE}>
          <path d="M20 44a28 28 0 0 1 50-14" />
          <path d="M72 14v18H54" />
          <path d="M76 52a28 28 0 0 1-50 14" />
          <path d="M24 82V64h18" />
          <path d="M48 34c-3 5-7 8-7 12a7 7 0 0 0 14 0c0-4-4-7-7-12z" />
        </g>
      )}
      {id === 'sun' && (
        <g {...STROKE}>
          <circle cx="48" cy="34" r="12" />
          <path d="M48 10v6M48 52v6M24 34h6M66 34h6M31 17l4 4M61 47l4 4M65 17l-4 4M35 47l-4 4" />
          <path d="M10 70c8-8 14-8 19 0s11 8 19 0 14-8 19 0 11 8 19 0" />
          <path d="M10 84c8-8 14-8 19 0s11 8 19 0 14-8 19 0 11 8 19 0" opacity=".55" />
        </g>
      )}
      {id === 'pipe' && (
        <g {...STROKE}>
          <path d="M8 36h40v-14h14v14h26" />
          <path d="M8 52h26v10h28V52h26" />
          <path d="M8 36v16M88 36v16" />
          <path d="M48 70c-3 5-6 8-6 12a6 6 0 0 0 12 0c0-4-3-7-6-12z" />
        </g>
      )}
      {id === 'home' && (
        <g {...STROKE}>
          <path d="M12 46 48 14l36 32" />
          <path d="M20 40v42h56V40" />
          <path d="M48 44c-5 7-10 11-10 17a10 10 0 0 0 20 0c0-6-5-10-10-17z" />
        </g>
      )}
    </svg>
  )
}
