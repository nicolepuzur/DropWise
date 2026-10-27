import { Link } from 'react-router-dom'
import { BRAND, EXTERNAL, ROUTES } from '../constants/site'
import { useLanguage } from '../i18n/LanguageContext'
import { DropMark } from './Logo'

export function Footer() {
  const { t } = useLanguage()

  const tools = [
    { to: ROUTES.irrigation, label: t.nav.irrigation },
    { to: ROUTES.reuse, label: t.nav.reuse },
    { to: ROUTES.desal, label: t.nav.desal },
    { to: ROUTES.leaks, label: t.nav.leaks },
    { to: ROUTES.athome, label: t.nav.athome },
  ]
  const learn = [
    { to: ROUTES.problem, label: t.nav.problem },
    { to: ROUTES.solution, label: t.nav.solution },
    { to: ROUTES.about, label: t.nav.about },
  ]
  const sources = [
    { href: EXTERNAL.jmp, label: 'WHO/UNICEF JMP' },
    { href: 'https://www.usgs.gov/special-topic/water-science-school/science/where-earths-water', label: 'USGS' },
    { href: 'https://www.fao.org/aquastat', label: 'FAO AQUASTAT' },
    { href: 'https://ourworldindata.org/grapher/agricultural-water-as-a-share-of-total-water-withdrawals', label: 'Our World in Data' },
    { href: EXTERNAL.sdg6, label: 'SDG 6' },
  ]
  const linkClass = 'block py-1 text-[0.95rem] text-ice/70 transition-colors hover:text-aqua'

  return (
    <footer className="relative overflow-hidden border-t border-line bg-navy">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-6 pb-12 pt-16 sm:grid-cols-[1.3fr_1fr_1fr_1fr] sm:px-10">
        <div>
          <DropMark className="h-11 w-11" />
          <p className="mt-5 max-w-[16rem] text-[0.98rem] leading-snug text-ice/75">{t.footer.line}</p>
        </div>
        <div>
          <p className="eyebrow">{t.footer.tools}</p>
          <ul className="mt-3">
            {tools.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t.footer.learn}</p>
          <ul className="mt-3">
            {learn.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">{t.footer.sources}</p>
          <ul className="mt-3">
            {sources.map((link) => (
              <li key={link.href}>
                <a href={link.href} target="_blank" rel="noreferrer noopener" className={linkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-6 pb-4 text-xs uppercase tracking-[0.16em] text-ice/45 sm:px-10">
        <span>© 2026 {BRAND}</span>
        <span>
          {t.footer.licence} · {t.footer.open}
        </span>
      </div>

      <p
        aria-hidden="true"
        className="display pointer-events-none select-none whitespace-nowrap bg-gradient-to-b from-aqua/25 to-transparent bg-clip-text text-center leading-[0.8] tracking-[0.06em] text-transparent"
        style={{ fontSize: 'clamp(3.5rem, 15vw, 15rem)', marginBottom: '-0.12em' }}
      >
        {BRAND}
      </p>
    </footer>
  )
}
