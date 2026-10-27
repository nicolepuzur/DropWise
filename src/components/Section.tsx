import type { ReactNode } from 'react'

type Tone = 'plain' | 'glow' | 'warm' | 'paper'

const TONES: Record<Tone, string> = {
  plain: 'bg-ink',
  glow: 'glow-blue',
  warm: 'glow-warm',
  paper: 'bg-ice text-ink',
}

interface SectionProps {
  tone?: Tone
  className?: string
  /** Width of the content column. */
  width?: 'wide' | 'narrow'
  children: ReactNode
}

/** A full-width band with a centred content column. */
export function Section({ tone = 'plain', className = '', width = 'wide', children }: SectionProps) {
  return (
    <section className={`px-6 py-20 sm:px-10 sm:py-28 ${TONES[tone]} ${className}`}>
      <div className={`mx-auto ${width === 'wide' ? 'max-w-[1200px]' : 'max-w-3xl'}`}>{children}</div>
    </section>
  )
}
