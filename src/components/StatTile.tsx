import { useCountUp } from '../hooks/useCountUp'
import { useInView } from '../hooks/useInView'
import { useLanguage } from '../i18n/LanguageContext'
import { formatNumber } from '../utils/format'

interface StatTileProps {
  value: number
  suffix: string
  label: string
  source: string
}

/** A large counting number with its label and where it comes from. */
export function StatTile({ value, suffix, label, source }: StatTileProps) {
  const { lang } = useLanguage()
  const { ref, seen } = useInView<HTMLDivElement>(0.3)
  const shown = useCountUp(seen ? value : 0, 1400)
  const decimals = Number.isInteger(value) ? 0 : 1

  return (
    <div ref={ref} className="border-line px-2 py-10 sm:px-8 [&:not(:first-child)]:border-t md:[&:not(:first-child)]:border-l md:[&:not(:first-child)]:border-t-0">
      <p className="display !normal-case whitespace-nowrap bg-gradient-to-b from-white to-aqua bg-clip-text text-[clamp(2rem,3.6vw,3.2rem)] tracking-[0.04em] text-transparent">
        {formatNumber(shown, lang, decimals)}
        <span className="text-[0.55em] tracking-[0.1em]">{suffix}</span>
      </p>
      <p className="mt-4 max-w-[17rem] text-[0.98rem] leading-snug text-ice/85">{label}</p>
      <p className="mt-3 text-xs text-ice/45">{source}</p>
    </div>
  )
}
