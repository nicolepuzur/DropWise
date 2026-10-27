import { Pill } from '../components/Pill'
import { ROUTES } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'

export function NotFoundPage() {
  const { t } = useLanguage()
  return (
    <section className="glow-blue flex min-h-[80svh] flex-col items-center justify-center px-6 pt-[var(--header-h)] text-center">
      <p className="display bg-gradient-to-b from-aqua to-royal/30 bg-clip-text text-[clamp(5rem,16vw,11rem)] leading-none text-transparent">404</p>
      <h1 className="display mt-6 text-[clamp(1.6rem,4vw,2.8rem)]">{t.notFound.title}</h1>
      <p className="mt-4 text-lg text-ice/70">{t.notFound.body}</p>
      <div className="mt-9">
        <Pill to={ROUTES.home}>{t.notFound.cta}</Pill>
      </div>
    </section>
  )
}
