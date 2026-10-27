import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { ROUTES } from '../constants/site'
import { usePrefersReducedMotion } from '../hooks/useMediaQuery'
import { useLanguage } from '../i18n/LanguageContext'
import { scrollToY } from '../utils/scroll'
import { Arrow, Pill } from './Pill'
import { Scene, type SceneId } from './scenes/Scene'

const SCENES: SceneId[] = ['drop', 'field', 'loop', 'sea', 'pipes', 'tap']
const LINKS = [ROUTES.problem, ROUTES.irrigation, ROUTES.reuse, ROUTES.desal, ROUTES.leaks, ROUTES.athome]
const INTERVAL_MS = 7000
const SWIPE_PX = 50

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function RoundButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-ink/30 text-white backdrop-blur transition-colors hover:border-aqua hover:text-aqua"
    >
      {children}
    </button>
  )
}

/** The full-screen opening slideshow: one scene per solution, a wide headline, a coloured tag line and a capsule button. */
export function HeroSlideshow() {
  const { t } = useLanguage()
  const slides = t.home.slides
  const reduced = usePrefersReducedMotion()
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [pageHidden, setPageHidden] = useState(false)
  const swipeStart = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const go = useCallback((to: number) => setIndex(((to % slides.length) + slides.length) % slides.length), [slides.length])
  const paused = hovered || pageHidden || reduced

  useEffect(() => {
    if (paused) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL_MS)
    return () => window.clearTimeout(id)
  }, [index, paused, slides.length])

  useEffect(() => {
    const onVisibility = () => setPageHidden(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowRight') go(index + 1)
    if (event.key === 'ArrowLeft') go(index - 1)
  }

  function onPointerDown(event: PointerEvent<HTMLElement>) {
    swipeStart.current = event.clientX
  }

  function onPointerUp(event: PointerEvent<HTMLElement>) {
    if (swipeStart.current === null) return
    const delta = event.clientX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(delta) > SWIPE_PX) go(index + (delta < 0 ? 1 : -1))
  }

  function scrollDown() {
    const bottom = sectionRef.current?.getBoundingClientRect().bottom ?? window.innerHeight
    scrollToY(window.scrollY + bottom)
  }

  return (
    <section
      ref={sectionRef}
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink"
      aria-roledescription="carousel"
      aria-label={t.home.introEyebrow}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {SCENES.map((scene, i) => (
        <div
          key={scene}
          className={`absolute inset-0 transition-opacity duration-[1400ms] ease-[var(--ease-in-out-deep)] ${i === index ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={i !== index}
        >
          <div className="absolute inset-0" style={i === index && !reduced ? { animation: `ken-burns ${INTERVAL_MS + 2500}ms ease-out both` } : undefined} key={i === index ? `on-${index}` : `off-${i}`}>
            <Scene scene={scene} paused={i !== index} />
          </div>
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_50%_48%,transparent_30%,rgba(2,8,20,0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_52%_34%_at_50%_50%,rgba(2,8,20,0.62),transparent_80%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-ink to-transparent" />

      <div className="relative z-10 flex flex-1 items-center justify-center px-6 pb-28 pt-28 text-center" aria-live={paused ? 'polite' : 'off'}>
        {slides.map((slide, i) =>
          i === index ? (
            <div key={index} className="max-w-5xl">
              <h1 className="display rise-in text-[clamp(2.3rem,6.4vw,5rem)] text-balance [text-shadow:0_2px_40px_rgba(2,8,20,0.55)]">{slide.title}</h1>
              <p className="rise-in mt-5 text-[0.95rem] font-medium uppercase tracking-[0.16em] text-white [text-shadow:0_1px_16px_rgba(2,8,20,0.95)] sm:text-lg" style={{ animationDelay: '0.12s' }}>
                <span className="text-aqua">{slide.tag[0][0]}</span> {slide.tag[0][1]}
                <span className="mx-2 text-white/50">/</span>
                <span className="text-aqua">{slide.tag[1][0]}</span> {slide.tag[1][1]}
              </p>
              <div className="rise-in mt-9" style={{ animationDelay: '0.24s' }}>
                <Pill to={LINKS[i]}>{slide.cta}</Pill>
              </div>
            </div>
          ) : null,
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-6 sm:px-8">
        <div className="relative flex items-end justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="mono mb-3 text-xs tracking-[0.2em] text-ice/80">
              {pad(index + 1)} <span className="text-ice/40">/ {pad(slides.length)}</span>
            </p>
            <div className="flex gap-2">
              {slides.map((slide, i) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`${t.common.slide} ${i + 1}: ${slide.title}`}
                  aria-current={i === index}
                  className="group relative h-6 flex-1 sm:max-w-14"
                >
                  <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/20">
                    <span
                      className="absolute inset-0 origin-left rounded-full bg-aqua"
                      style={
                        i < index
                          ? { transform: 'scaleX(1)' }
                          : i === index
                            ? { animation: reduced ? undefined : `slide-fill ${INTERVAL_MS}ms linear both`, animationPlayState: paused ? 'paused' : 'running', transform: reduced ? 'scaleX(1)' : undefined }
                            : { transform: 'scaleX(0)' }
                      }
                      key={i === index ? `fill-${index}` : `idle-${i}`}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={scrollDown}
            aria-label={t.common.scrollDown}
            className="absolute bottom-0 left-1/2 hidden h-11 w-11 -translate-x-1/2 place-items-center rounded-full border border-white/25 bg-ink/30 text-white backdrop-blur transition-colors hover:border-aqua hover:text-aqua sm:grid"
          >
            <Arrow className="h-4 w-4 rotate-90" />
          </button>

          <div className="flex shrink-0 gap-2">
            <RoundButton label={t.common.previous} onClick={() => go(index - 1)}>
              <Arrow className="h-4 w-4 rotate-180" />
            </RoundButton>
            <RoundButton label={t.common.next} onClick={() => go(index + 1)}>
              <Arrow />
            </RoundButton>
          </div>
        </div>
      </div>
    </section>
  )
}
