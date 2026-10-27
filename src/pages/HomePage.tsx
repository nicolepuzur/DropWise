import { Accordion } from '../components/Accordion'
import { SectionHead } from '../components/controls'
import { HeroSlideshow } from '../components/HeroSlideshow'
import { ImageBand } from '../components/ImageBand'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SolutionRail } from '../components/SolutionRail'
import { StatTile } from '../components/StatTile'
import { ROUTES } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'

export function HomePage() {
  const { t } = useLanguage()
  const h = t.home

  return (
    <div>
      <HeroSlideshow />

      <section className="glow-blue relative overflow-hidden px-6 py-24 sm:px-10 sm:py-36">
        <div className="mx-auto max-w-[1200px]">
          <Reveal>
            <p className="eyebrow">{h.introEyebrow}</p>
            <p className="statement mt-6 max-w-4xl text-[clamp(1.7rem,3.7vw,3.1rem)] text-balance">{h.introStatement}</p>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-12 grid items-end gap-8 md:grid-cols-[1.4fr_1fr]">
              <p className="max-w-xl text-lg leading-relaxed text-ice/75">{h.introBody}</p>
              <div className="md:justify-self-end">
                <Pill to={ROUTES.problem}>{h.introCta}</Pill>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ImageBand scene="sea" title={h.bandSea.title} body={h.bandSea.body} cta={h.bandSea.cta} to={ROUTES.desal} />

      <SolutionRail />

      <Section tone="warm">
        <Reveal>
          <SectionHead eyebrow={h.causes.eyebrow} title={h.causes.title} />
        </Reveal>
        <div className="mt-14 grid overflow-hidden rounded-3xl border border-line bg-navy md:grid-cols-3">
          {h.causes.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 120} className="border-line md:[&:not(:first-child)]:border-l [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-t-0">
              <div className="h-full p-8 sm:p-10">
                <p className="display bg-gradient-to-b from-aqua to-royal/40 bg-clip-text text-[4.5rem] leading-none text-transparent">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="display mt-8 text-2xl">{item.title}</h3>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-ice/70">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-12">
          <Pill to={ROUTES.problem}>{h.causes.cta}</Pill>
        </Reveal>
      </Section>

      <ImageBand scene="pipes" title={h.bandPipes.title} body={h.bandPipes.body} cta={h.bandPipes.cta} to={ROUTES.leaks} />

      <Section tone="plain">
        <p className="eyebrow">{h.statsEyebrow}</p>
        <div className="mt-6 grid border-y border-line md:grid-cols-2 lg:grid-cols-4">
          {h.stats.map((stat) => (
            <StatTile key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} source={stat.source} />
          ))}
        </div>
      </Section>

      <Section tone="glow">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <Reveal>
            <SectionHead eyebrow={h.faq.eyebrow} title={h.faq.title} />
          </Reveal>
          <Reveal delay={100}>
            <Accordion items={h.faq.items} />
          </Reveal>
        </div>
      </Section>

      <section className="px-6 pb-28 pt-12 text-center sm:px-10">
        <Reveal>
          <h2 className="display mx-auto max-w-4xl text-[clamp(2rem,5.2vw,4.2rem)] text-balance">{h.ctaTitle}</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Pill to={ROUTES.athome}>{h.ctaPrimary}</Pill>
            <Pill to={ROUTES.problem} plain>
              {h.ctaSecondary}
            </Pill>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
