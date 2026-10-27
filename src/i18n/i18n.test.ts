import { describe, expect, it } from 'vitest'
import { LANGS, translations } from './translations'

type Shape = string | Shape[] | { [key: string]: Shape }

/** Describes a value by its keys and array lengths, ignoring the text itself. */
function shapeOf(value: unknown): Shape {
  if (Array.isArray(value)) return value.map(shapeOf)
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shapeOf(inner)]))
  }
  return typeof value
}

function collectStrings(value: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof value === 'string') out.push({ path, text: value })
  else if (Array.isArray(value)) value.forEach((item, i) => collectStrings(item, `${path}[${i}]`, out))
  else if (typeof value === 'object' && value !== null) {
    for (const [key, inner] of Object.entries(value)) collectStrings(inner, `${path}.${key}`, out)
  }
}

describe('translations', () => {
  it('has the same keys and list lengths in every language', () => {
    const reference = shapeOf(translations.en)
    for (const lang of LANGS) expect(shapeOf(translations[lang]), lang).toEqual(reference)
  })

  it('never leaves a string empty', () => {
    for (const lang of LANGS) {
      const strings: { path: string; text: string }[] = []
      collectStrings(translations[lang], lang, strings)
      for (const { path, text } of strings) expect(text.trim().length, path).toBeGreaterThan(0)
    }
  })

  it('keeps the same {placeholders} in every language', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
    const reference: { path: string; text: string }[] = []
    collectStrings(translations.en, 'en', reference)
    for (const lang of LANGS) {
      const strings: { path: string; text: string }[] = []
      collectStrings(translations[lang], 'en', strings)
      strings.forEach(({ path, text }, i) => expect(placeholders(text), `${lang} ${path}`).toEqual(placeholders(reference[i].text)))
    }
  })
})
