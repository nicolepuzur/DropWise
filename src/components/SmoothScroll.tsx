import Lenis from 'lenis'
import { useEffect } from 'react'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { setSmoothScroller } from '../utils/scroll'

/** Eased wheel scrolling like the Magnesia site. Touch keeps its native momentum, and reduced-motion users get none of it. */
export function SmoothScroll() {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    const lenis = new Lenis({ lerp: 0.1 })
    setSmoothScroller(lenis)
    let frame = requestAnimationFrame(function tick(time) {
      lenis.raf(time)
      frame = requestAnimationFrame(tick)
    })
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      setSmoothScroller(null)
    }
  }, [reduced])

  return null
}
