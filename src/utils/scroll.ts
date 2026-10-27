import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setSmoothScroller(lenis: Lenis | null): void {
  instance = lenis
}

/** Jumps to the top of the page without animating, whether or not smooth scrolling is on. */
export function scrollToTop(): void {
  if (instance) instance.scrollTo(0, { immediate: true })
  else window.scrollTo({ top: 0, behavior: 'instant' })
}

/** Scrolls smoothly to a y position (used by the "scroll down" buttons). */
export function scrollToY(y: number): void {
  if (instance) instance.scrollTo(y)
  else window.scrollTo({ top: y, behavior: 'smooth' })
}
