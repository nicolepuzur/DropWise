import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { TOOL_ROUTES } from '../constants/site'
import { useMediaQuery, usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { useLanguage } from '../i18n/LanguageContext'
import { Arrow } from './Pill'
import { SolutionIcon, type IconId } from './SolutionIcon'

const ICONS: IconId[] = ['drip', 'loop', 'sun', 'pipe', 'home']

/**
 * The five solutions as tall cards on a horizontal track. On large screens the track is pinned and slides sideways as
 * the page scrolls down (like the product row on Magnesia); on small screens it is an ordinary swipeable row.
 */
export function SolutionRail() {
  const { t } = useLanguage()
  const r = t.home.rail
  const wide = useMediaQuery('(min-width: 1024px)')
  const reduced = usePrefersReducedMotion()
  const pinned = wide && !reduced

  const outerRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const outer = outerRef.current
    const sticky = stickyRef.current
    const track = trackRef.current
    if (!pinned || !outer || !sticky || !track) return

    let shift = 0
    function measure() {
      if (!outer || !sticky || !track) return
      shift = Math.max(0, track.scrollWidth - sticky.clientWidth)
      outer.style.height = `${shift + sticky.clientHeight}px`
      update()
    }
    function update() {
      if (!outer || !track) return
      const top = outer.getBoundingClientRect().top
      const progress = shift === 0 ? 0 : Math.min(Math.max(-top / shift, 0), 1)
      track.style.transform = `translate3d(${-progress * shift}px,0,0)`
    }

    measure()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', measure)
      observer.disconnect()
      if (outer) outer.style.height = ''
      if (track) track.style.transform = ''
    }
  }, [pinned])

  const heading = (
    <div className="w-[min(32rem,84vw)] shrink-0 self-center pr-6">
      <p className="eyebrow">{r.eyebrow}</p>
      <h2 className="display mt-4 text-[clamp(1.7rem,3vw,2.7rem)] text-balance">{r.title}</h2>
    </div>
  )

  const cards = r.cards.map((card, i) => (
    <Link
      key={card.title}
      to={TOOL_ROUTES[i]}
      className={`card-glass group relative flex h-[32rem] w-[min(25rem,82vw)] shrink-0 snap-start flex-col p-7 transition-[border-color,transform] duration-500 hover:border-aqua/60 lg:h-[min(32rem,66vh)] ${i % 2 === 1 ? 'lg:mt-[min(6rem,10vh)]' : ''}`}
    >
      <span className="mono text-xs tracking-[0.2em] text-ice/50">{String(i + 1).padStart(2, '0')}</span>
      <div className="relative flex flex-1 items-center justify-center">
        <span className="absolute h-44 w-44 rounded-full bg-aqua/10 blur-2xl transition-opacity duration-500 group-hover:bg-aqua/20" />
        <SolutionIcon id={ICONS[i]} className="relative h-28 w-28 text-aqua transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div>
        <h3 className="display text-[clamp(1.2rem,5.4vw,1.6rem)]">{card.title}</h3>
        <p className="mono mt-3 text-[0.72rem] uppercase tracking-[0.14em] text-aqua">{card.tag}</p>
        <p className="mt-4 text-[0.98rem] leading-relaxed text-ice/75">{card.body}</p>
        <span className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm font-medium text-white">
          {card.cta}
          <span className="pill-dot">
            <Arrow />
          </span>
        </span>
      </div>
    </Link>
  ))

  if (!pinned) {
    return (
      <section className="glow-blue py-20" aria-label={r.title}>
        <div className="px-6 pb-8 sm:px-10">
          <p className="eyebrow">{r.eyebrow}</p>
          <h2 className="display mt-4 text-[clamp(2rem,6vw,3rem)] text-balance">{r.title}</h2>
        </div>
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-6 sm:px-10" data-lenis-prevent>
          {cards}
        </div>
      </section>
    )
  }

  return (
    <section ref={outerRef} className="glow-blue relative" aria-label={r.title}>
      <div ref={stickyRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div ref={trackRef} className="flex items-start gap-6 px-10 will-change-transform">
          {heading}
          {cards}
          <div className="w-10 shrink-0" />
        </div>
      </div>
    </section>
  )
}
