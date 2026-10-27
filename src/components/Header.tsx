import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { BRAND, ROUTES } from '../constants/site'
import { useScrolled } from '../hooks/useScrolled'
import { useLanguage } from '../i18n/LanguageContext'
import { Logo } from './Logo'
import { SidebarBody } from './SidebarBody'

function DropIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
      <path d="M12 2.500c-3 4.500-6.500 8-6.500 12a6.500 6.500 0 0 0 13 0c0-4-3.500-7.500-6.500-12z" />
    </svg>
  )
}

/** Logo on the left, the home audit as a quick action, and the menu button on small screens. */
export function Header() {
  const { t } = useLanguage()
  const location = useLocation()
  const scrolled = useScrolled(24)
  const [open, setOpen] = useState(false)
  const [drawerPath, setDrawerPath] = useState(location.pathname)

  // Close the drawer whenever the route changes (adjusting state during render, not in an effect).
  if (drawerPath !== location.pathname) {
    setDrawerPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-30 flex h-[var(--header-h)] items-stretch border-b border-line transition-[background-color,backdrop-filter] duration-500 lg:right-[var(--sidebar-offset)] ${
          scrolled ? 'bg-ink/80 backdrop-blur-xl' : 'bg-gradient-to-b from-ink/70 to-transparent'
        }`}
      >
        <Link to={ROUTES.home} className="flex items-center px-5 sm:px-8" aria-label={BRAND}>
          <Logo />
        </Link>
        <div className="flex-1" />

        <NavLink
          to={ROUTES.athome}
          className="hidden items-center gap-4 border-l border-line px-7 text-sm font-medium text-white transition-colors hover:bg-white/[0.04] sm:flex"
        >
          {t.nav.headerCta}
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-aqua to-royal text-ink">
            <DropIcon />
          </span>
        </NavLink>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.nav.menu}
          aria-expanded={open}
          className="grid w-[var(--header-h)] place-items-center border-l border-line lg:hidden"
        >
          <span className="flex flex-col gap-[7px]">
            <span className="h-px w-7 bg-white" />
            <span className="h-px w-7 bg-white" />
            <span className="h-px w-4 self-end bg-white" />
          </span>
        </button>
      </header>

      <div className={`fixed inset-0 z-50 lg:hidden ${open ? '' : 'pointer-events-none'}`} role="dialog" aria-modal="true" aria-hidden={!open} aria-label={t.nav.menu}>
        <button
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label={t.nav.close}
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink/75 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        />
        <div
          className={`absolute bottom-3 right-3 top-3 w-[min(20rem,calc(100vw-1.5rem))] rounded-3xl border border-line bg-[#06122e] p-3 transition-transform duration-500 ease-[var(--ease-out-expo)] ${
            open ? 'translate-x-0' : 'translate-x-[110%]'
          }`}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.nav.close}
            tabIndex={open ? 0 : -1}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line text-white"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
          <SidebarBody onNavigate={() => setOpen(false)} />
        </div>
      </div>
    </>
  )
}
