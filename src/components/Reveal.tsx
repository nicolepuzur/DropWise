import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

/** Fades and lifts its content once it reaches the viewport. */
export function Reveal({ children, delay = 0, className = '' }: RevealProps) {
  const { ref, seen } = useInView<HTMLDivElement>(0.12)
  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-[1000ms] ease-[var(--ease-out-expo)] ${seen ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
