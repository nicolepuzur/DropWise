import { SectionHead } from '../components/controls'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { SolutionIcon, type IconId } from '../components/SolutionIcon'
import { EXTERNAL, ROUTES, TOOL_ROUTES } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'

const ICONS: IconId[] = ['drip', 'loop', 'sun', 'pipe', 'home']
const ORG_LINKS = [EXTERNAL.jmp, EXTERNAL.unwater, EXTERNAL.waterOrg]

export function SolutionPage() {
  const { t } = useLanguage()
  const s = t.solution

  return (
    <div>
      <PageHeader eyebrow={s.eyebrow} title={s.title} sub={s.sub} />

      <Section tone="plain" className="!pt-8 sm:!pt-12">
        <div className="divide-y divide-line">
          {s.items.map((item, i) => (
            <Reveal key={item.title}>
              <article className="grid gap-8 py-14 md:grid-cols-[11rem_1fr] md:gap-14">
                <div className="flex items-center gap-5 md:flex-col md:items-start">
                  <span className="display bg-gradient-to-b from-aqua to-royal/40 bg-clip-text text-[4rem] leading-none text-transparent">{String(i + 1).padStart(2, '0')}</span>
                  <SolutionIcon id={ICONS[i]} className="h-16 w-16 text-aqua" />
                </div>
                <div>
                  <h2 className="display text-[clamp(1.5rem,3vw,2.3rem)]">{item.title}</h2>
                  <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ice/80">{item.body}</p>
                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="card-glass p-6">
                      <p className="eyebrow !text-aqua">{s.exampleLabel}</p>
                      <p className="mt-3 text-[0.98rem] leading-relaxed text-ice/80">{item.example}</p>
                    </div>
                    <div className="card-glass p-6">
                      <p className="eyebrow !text-sand">{s.caveatLabel}</p>
                      <p className="mt-3 text-[0.98rem] leading-relaxed text-ice/80">{item.caveat}</p>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Pill to={TOOL_ROUTES[i]}>{item.cta}</Pill>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="warm">
        <Reveal>
          <SectionHead eyebrow={s.caveatLabel} title={s.honestTitle} body={s.honestBody} />
        </Reveal>
      </Section>

      <Section tone="plain">
        <Reveal>
          <p className="eyebrow">{s.orgsEyebrow}</p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {s.orgs.map((org, i) => (
            <Reveal key={org.name} delay={i * 100}>
              <article className="card-glass flex h-full flex-col p-8">
                <h3 className="text-xl font-medium">{org.name}</h3>
                <p className="mt-3 flex-1 text-[0.98rem] leading-relaxed text-ice/70">{org.body}</p>
                <div className="mt-8">
                  <Pill href={ORG_LINKS[i]}>{org.cta}</Pill>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section tone="glow">
        <Reveal>
          <SectionHead title={s.tipsTitle} />
        </Reveal>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {s.tips.map((tip, i) => (
            <Reveal key={tip} delay={(i % 3) * 90}>
              <li className="card-glass flex h-full gap-4 p-6">
                <span className="mono text-xs tracking-[0.2em] text-aqua">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-[0.98rem] leading-relaxed text-ice/85">{tip}</span>
              </li>
            </Reveal>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-ice/55">{s.tipsNote}</p>
        <div className="mt-10">
          <Pill to={ROUTES.athome}>{t.nav.cta}</Pill>
        </div>
      </Section>
    </div>
  )
}
