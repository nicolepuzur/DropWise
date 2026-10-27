import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { SmoothScroll } from './components/SmoothScroll'
import { ROUTES } from './constants/site'
import { WaterProvider } from './context/WaterProvider'
import { LanguageProvider, useLanguage } from './i18n/LanguageContext'
import { AboutPage } from './pages/AboutPage'
import { AtHomePage } from './pages/AtHomePage'
import { DesalPage } from './pages/DesalPage'
import { HomePage } from './pages/HomePage'
import { IrrigationPage } from './pages/IrrigationPage'
import { LeaksPage } from './pages/LeaksPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProblemPage } from './pages/ProblemPage'
import { ReusePage } from './pages/ReusePage'
import { SolutionPage } from './pages/SolutionPage'
import { scrollToTop } from './utils/scroll'

/** Every page opens at its top, so a route change starts there. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    scrollToTop()
  }, [pathname])
  return null
}

function AppShell() {
  const { t } = useLanguage()
  return (
    <div className="min-h-screen bg-ink text-white">
      <a
        href="#main"
        className="fixed left-4 top-4 z-[60] -translate-y-24 rounded-full bg-aqua px-5 py-2.5 text-sm font-semibold text-ink transition-transform focus:translate-y-0"
      >
        {t.common.skip}
      </a>
      <SmoothScroll />
      <ScrollToTop />
      <Header />
      <Sidebar />
      <div className="lg:pr-[var(--sidebar-offset)]">
        <main id="main">
          <Routes>
            <Route path={ROUTES.home} element={<HomePage />} />
            <Route path={ROUTES.problem} element={<ProblemPage />} />
            <Route path={ROUTES.solution} element={<SolutionPage />} />
            <Route path={ROUTES.irrigation} element={<IrrigationPage />} />
            <Route path={ROUTES.reuse} element={<ReusePage />} />
            <Route path={ROUTES.desal} element={<DesalPage />} />
            <Route path={ROUTES.leaks} element={<LeaksPage />} />
            <Route path={ROUTES.athome} element={<AtHomePage />} />
            <Route path={ROUTES.about} element={<AboutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <WaterProvider>
        <AppShell />
      </WaterProvider>
    </LanguageProvider>
  )
}

export default App
