import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Arrow({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  )
}

interface PillProps {
  to?: string
  href?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  /** Pressed state, for toggle buttons. */
  pressed?: boolean
  /** Hide the round arrow and show just the capsule. */
  plain?: boolean
  children: ReactNode
}

/** The Magnesia call-to-action: a translucent capsule with a luminous round arrow. */
export function Pill({ to, href, onClick, disabled, type = 'button', className = '', pressed, plain, children }: PillProps) {
  const classes = `pill ${plain ? 'pill-ghost' : ''} ${className}`
  const inner = (
    <>
      <span>{children}</span>
      {!plain && (
        <span className="pill-dot">
          <Arrow />
        </span>
      )}
    </>
  )
  if (to) {
    return (
      <Link to={to} className={classes}>
        {inner}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer noopener">
        {inner}
      </a>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} aria-pressed={pressed} className={classes}>
      {inner}
    </button>
  )
}
