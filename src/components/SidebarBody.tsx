import { NavLink } from 'react-router-dom'
import { ROUTES } from '../constants/site'
import { useWater } from '../context/water'
import { useLanguage } from '../i18n/LanguageContext'
import { formatVolume } from '../utils/format'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Pill } from './Pill'

interface NavItem {
  to: string
  label: string
  index?: string
  end?: boolean
}

function NavGroup({ title, items, onNavigate }: { title?: string; items: NavItem[]; onNavigate?: () => void }) {
  return (
    <div>
      {title ? <p className="eyebrow px-3 pb-2 pt-5 !text-ice/45">{title}</p> : <div className="h-4" />}
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-[0.95rem] transition-colors ${
                  isActive ? 'bg-white/[0.07] text-white' : 'text-ice/65 hover:bg-white/[0.04] hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${isActive ? 'bg-aqua shadow-[0_0_10px_#5fd3ff]' : 'bg-ice/25 group-hover:bg-ice/60'}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.index && <span className="mono text-[0.65rem] text-ice/35">{item.index}</span>}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** The navigation shared by the fixed right-hand panel and the mobile drawer. */
export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { t, lang } = useLanguage()
  const { planLitres } = useWater()

  const learn: NavItem[] = [
    { to: ROUTES.home, label: t.nav.home, end: true },
    { to: ROUTES.problem, label: t.nav.problem },
    { to: ROUTES.solution, label: t.nav.solution },
  ]
  const tools: NavItem[] = [
    { to: ROUTES.irrigation, label: t.nav.irrigation, index: '01' },
    { to: ROUTES.reuse, label: t.nav.reuse, index: '02' },
    { to: ROUTES.desal, label: t.nav.desal, index: '03' },
    { to: ROUTES.leaks, label: t.nav.leaks, index: '04' },
    { to: ROUTES.athome, label: t.nav.athome, index: '05' },
  ]
  const other: NavItem[] = [{ to: ROUTES.about, label: t.nav.about }]

  return (
    <div className="flex h-full flex-col">
      <p className="eyebrow px-3 pt-3">{t.nav.tagline}</p>

      <nav className="flex-1 overflow-y-auto pb-2" aria-label="Primary" data-lenis-prevent>
        <NavGroup title={t.nav.groupLearn} items={learn} onNavigate={onNavigate} />
        <NavGroup title={t.nav.groupTools} items={tools} onNavigate={onNavigate} />
        <NavGroup items={other} onNavigate={onNavigate} />
      </nav>

      <div className="space-y-3 pt-2">
        <NavLink to={ROUTES.athome} onClick={onNavigate} className="block rounded-2xl border border-line bg-ink/40 px-4 py-3">
          <p className="eyebrow !text-[0.62rem] !text-ice/50">{t.nav.planLabel}</p>
          {planLitres > 0 ? (
            <p className="mt-1">
              <span className="display !normal-case text-2xl tracking-[0.04em] text-aqua">{formatVolume(planLitres, lang, t.common.units)}</span>
              <span className="ml-2 text-xs text-ice/55">{t.nav.perYear}</span>
            </p>
          ) : (
            <p className="mt-1 text-sm text-ice/60">{t.nav.planEmpty}</p>
          )}
        </NavLink>
        <LanguageSwitcher />
        <Pill to={ROUTES.athome} onClick={onNavigate} className="w-full justify-between">
          {t.nav.cta}
        </Pill>
      </div>
    </div>
  )
}
