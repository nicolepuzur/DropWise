import type { Lang } from '../i18n/translations'

// en-US rather than en-GB: its compact form is "2.5M", while en-GB writes a lowercase "m" that reads like metres.
const LOCALES: Record<Lang, string> = { en: 'en-US', ro: 'ro-RO', ru: 'ru-RU' }

export function formatNumber(value: number, lang: Lang, maxFraction = 0): string {
  return new Intl.NumberFormat(LOCALES[lang], { maximumFractionDigits: maxFraction }).format(value)
}

/** 12,400 -> "12.4K", 2,500,000 -> "2.5M", in the reader's language; trailing zeros are dropped. */
export function formatCompact(value: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALES[lang], { notation: 'compact', maximumFractionDigits: 1 }).format(value)
}

export interface VolumeUnits {
  l: string
  m3: string
}

/** Litres below a thousand, cubic metres above, shortened for big numbers. */
export function formatVolume(litres: number, lang: Lang, units: VolumeUnits): string {
  if (litres < 1000) return `${formatNumber(litres, lang, litres < 10 ? 1 : 0)} ${units.l}`
  return `${formatCompact(litres / 1000, lang)} ${units.m3}`
}

/** Cubic metres, shortened for big numbers. */
export function formatM3(m3: number, lang: Lang, unit: string): string {
  return `${m3 < 1000 ? formatNumber(m3, lang, m3 < 10 ? 1 : 0) : formatCompact(m3, lang)} ${unit}`
}

/** Replaces `{name}` placeholders in a translated string. */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
