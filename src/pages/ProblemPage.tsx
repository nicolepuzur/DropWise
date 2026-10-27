import { SectionHead } from '../components/controls'
import { EarthWater } from '../components/EarthWater'
import { OwidEmbed, YoutubeEmbed } from '../components/Embeds'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { EXTERNAL, OWID_SLUG, ROUTES, YOUTUBE_ID } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'

export function ProblemPage() {
  const { t } = useLanguage()
  const p = t.problem

  return (
    <div>
      <PageHeader eyebrow={p.eyebrow} title={p.title} sub={p.sub} />

      <Section tone="plain" className="!py-16 sm:!py-20">
        <p className="eyebrow">{p.statsEyebrow}</p>
        <div className="mt-6 grid border-y border-line md:grid-cols-3">
          {p.stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 100} className="border-line md:[&:not(:first-child)]:border-l">
              <div className="px-2 py-10 sm:px-8">
                <p className="display !normal-case bg-gradient-to-b from-white to-aqua bg-clip-text text-[clamp(2rem,3.6vw,3.2rem)] tracking-[0.04em] text-transparent">{stat.value}</p>
                <p className="mt-4 max-w-[18rem] text-[0.98rem] leading-snug text-ice/85">{stat.label}</p>
                <p className="mt-3 text-xs text-ice/45">{stat.source}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="glow">
        <Reveal>
          <SectionHead eyebrow={p.earth.eyebrow} title={p.earth.title} body={p.earth.body} />
        </Reveal>
        <div className="mt-14">
          <EarthWater />
        </div>
      </Section>

      <Section tone="warm">
        <Reveal>
          <SectionHead eyebrow={p.causes.eyebrow} title={p.causes.title} />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {p.causes.items.map((item, i) => (
            <Reveal key={item.title} delay={i * 110}>
              <article className="card-glass flex h-full flex-col p-8">
                <p className="mono text-xs tracking-[0.2em] text-sand">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="display mt-5 text-2xl">{item.title}</h3>
                <p className="mt-4 flex-1 text-[1rem] leading-relaxed text-ice/75">{item.body}</p>
                <p className="mt-6 border-t border-line pt-4 text-xs text-ice/45">
                  {t.common.source}: {item.source}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="plain">
        <Reveal>
          <SectionHead eyebrow={p.safe.eyebrow} title={p.safe.title} body={p.safe.body} />
        </Reveal>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
          {p.safe.items.map((item, i) => (
            <li key={item.title} className="bg-navy p-8">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-aqua/50 text-sm text-aqua">{i + 1}</span>
              <h3 className="mt-6 text-xl font-medium">{item.title}</h3>
              <p className="mt-2 text-[0.98rem] leading-relaxed text-ice/70">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="glow">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">{p.chart.eyebrow}</p>
            <OwidEmbed slug={OWID_SLUG} title={p.chart.title} source={p.chart.source} />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow mb-4">{p.video.eyebrow}</p>
            <YoutubeEmbed videoId={YOUTUBE_ID} title={p.video.title} credit={p.video.credit} />
          </Reveal>
        </div>
      </Section>

      <Section tone="paper" className="!py-20">
        <Reveal>
          <div className="grid items-center gap-8 md:grid-cols-[1.6fr_1fr]">
            <div>
              <h2 className="display text-[clamp(1.5rem,3vw,2.3rem)] text-balance">{p.sdg.title}</h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">{p.sdg.body}</p>
            </div>
            <div className="md:justify-self-end">
              <Pill href={EXTERNAL.sdg6}>{p.sdg.cta}</Pill>
            </div>
          </div>
        </Reveal>
      </Section>

      <section className="px-6 pb-28 pt-24 text-center sm:px-10">
        <Reveal>
          <Pill to={ROUTES.solution}>{p.next}</Pill>
        </Reveal>
      </section>
    </div>
  )
}
