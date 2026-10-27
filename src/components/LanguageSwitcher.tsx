import { useLanguage } from '../i18n/LanguageContext'
import type { Lang } from '../i18n/translations'

const OPTIONS: { code: Lang; label: string; name: string }[] = [
  { code: 'ro', label: 'RO', name: 'Română' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ru', label: 'RU', name: 'Русский' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex gap-1 rounded-full border border-line p-1" role="group" aria-label="Language">
      {OPTIONS.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => setLang(option.code)}
          aria-pressed={lang === option.code}
          title={option.name}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.12em] transition-colors ${
            lang === option.code ? 'bg-aqua text-ink' : 'text-ice/70 hover:text-white'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
