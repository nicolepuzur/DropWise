import { SectionHead } from '../components/controls'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { EXTERNAL, ROUTES } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'

export function AboutPage() {
  const { t } = useLanguage()
  const a = t.about

  return (
    <div>
      <PageHeader eyebrow={a.eyebrow} title={a.title} sub={a.sub} />

      <Section tone="plain">
        <div className="grid gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHead title={a.whatTitle} body={a.whatBody} />
          </Reveal>
          <Reveal delay={100}>
            <h2 className="display text-[clamp(1.4rem,2.6vw,2rem)]">{a.numbersTitle}</h2>
            <ul className="mt-6 space-y-4">
              {a.numbers.map((line) => (
                <li key={line} className="flex gap-3 text-[1.02rem] leading-relaxed text-ice/80">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-aqua" />
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      <Section tone="glow">
        <Reveal>
          <SectionHead title={a.sourcesTitle} />
        </Reveal>
        <dl className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-2">
          {a.sources.map((source) => (
            <div key={source.name} className="bg-navy p-6">
              <dt className="font-medium text-white">{source.name}</dt>
              <dd className="mt-1.5 text-[0.95rem] leading-relaxed text-ice/65">{source.note}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="plain">
        <div className="grid gap-10 md:grid-cols-2">
          {[
            { title: a.teamTitle, body: a.teamBody },
            { title: a.privacyTitle, body: a.privacyBody },
            { title: a.aiTitle, body: a.aiBody },
            { title: a.licenceTitle, body: a.licenceBody },
          ].map((block, i) => (
            <Reveal key={block.title} delay={i * 100}>
              <h2 className="display text-xl">{block.title}</h2>
              <p className="mt-4 text-[0.98rem] leading-relaxed text-ice/70">{block.body}</p>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-16 flex flex-wrap gap-3">
          <Pill href={EXTERNAL.repo}>{a.repoCta}</Pill>
          <Pill to={ROUTES.home} plain>
            {t.common.backHome}
          </Pill>
        </Reveal>
      </Section>
    </div>
  )
}
