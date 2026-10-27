import { useId } from 'react'
import { BRAND } from '../constants/site'

export function DropMark({ className = 'h-9 w-9' }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-d`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9be8ff" />
          <stop offset="1" stopColor="#2563ff" />
        </linearGradient>
      </defs>
      <path d="M24 5c-5.500 8.500-12 15.500-12 23a12 12 0 0 0 24 0C36 20.500 29.500 13.500 24 5z" fill={`url(#${id}-d)`} />
      <path d="M18.500 29a5.800 5.800 0 0 0 5.500 5.800" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/** Drop mark and the wordmark in wide tracked capitals. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-3">
      <DropMark />
      <span className="display text-[1.05rem] tracking-[0.24em] text-white">{BRAND}</span>
    </span>
  )
}
