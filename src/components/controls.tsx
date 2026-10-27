import type { CSSProperties, ReactNode } from 'react'

interface RangeFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  /** What to show at the right of the label, e.g. "12 ha". */
  display: string
  id: string
}

/** A labelled slider with the current value written beside it. */
export function RangeField({ label, value, min, max, step = 1, onChange, display, id }: RangeFieldProps) {
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[0.95rem] text-ice/85">
          {label}
        </label>
        <output htmlFor={id} className="mono text-sm text-aqua">
          {display}
        </output>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ '--fill': `${fill}%` } as CSSProperties} />
    </div>
  )
}

interface ChipOption<T extends string> {
  id: T
  label: string
  hint?: string
}

interface ChipsProps<T extends string> {
  label: string
  options: readonly ChipOption<T>[]
  value: T
  onChange: (id: T) => void
}

/** A row of mutually exclusive choices, each with an optional one-line hint. */
export function Chips<T extends string>({ label, options, value, onChange }: ChipsProps<T>) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-3 text-[0.95rem] text-ice/85">{label}</legend>
      <div className="grid gap-2 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]">
        {options.map((option) => {
          const on = option.id === value
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              aria-pressed={on}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${on ? 'border-aqua bg-aqua/10 text-white' : 'border-line text-ice/75 hover:border-ice/40 hover:text-white'}`}
            >
              <span className="block text-[0.95rem] font-medium">{option.label}</span>
              {option.hint && <span className={`mt-0.5 block text-xs leading-snug ${on ? 'text-aqua' : 'text-ice/45'}`}>{option.hint}</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** A big number with a small label above it. */
export function BigStat({ label, value, note, tone = 'aqua' }: { label: string; value: string; note?: string; tone?: 'aqua' | 'sand' | 'coral' }) {
  const color = tone === 'sand' ? 'text-sand' : tone === 'coral' ? 'text-coral' : 'text-aqua'
  return (
    <div>
      <p className="eyebrow !text-[0.66rem]">{label}</p>
      <p className={`display mt-2 !normal-case text-[clamp(1.5rem,2.6vw,2.2rem)] tracking-[0.04em] ${color}`}>{value}</p>
      {note && <p className="mt-1 text-xs text-ice/50">{note}</p>}
    </div>
  )
}

/** A collapsible "how is this calculated?" box with the formula as a list. */
export function FormulaBox({ title, lines, children }: { title: string; lines: readonly string[]; children?: ReactNode }) {
  return (
    <details className="card-glass group p-6 open:bg-ink/30">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1.02rem] font-medium text-white [&::-webkit-details-marker]:hidden">
        {title}
        <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line" aria-hidden="true">
          <span className="absolute h-px w-3 bg-current" />
          <span className="absolute h-3 w-px bg-current transition-transform group-open:rotate-90 group-open:opacity-0" />
        </span>
      </summary>
      <ul className="mt-5 space-y-3 text-[0.95rem] leading-relaxed text-ice/75">
        {lines.map((line) => (
          <li key={line} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      {children}
    </details>
  )
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card-glass p-6 sm:p-8 ${className}`}>{children}</div>
}

/** Small label + heading used to open a section of a page. */
export function SectionHead({ eyebrow, title, body, className = '' }: { eyebrow?: string; title: string; body?: string; className?: string }) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className={`display max-w-3xl text-[clamp(1.6rem,3.2vw,2.5rem)] text-balance ${eyebrow ? 'mt-4' : ''}`}>{title}</h2>
      {body && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ice/70">{body}</p>}
    </div>
  )
}
