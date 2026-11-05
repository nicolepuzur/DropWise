import { describe, expect, it } from 'vitest'
import { researchText } from './research'
import { LANGS } from './translations'

type Shape = string | Shape[] | { [key: string]: Shape }

function shapeOf(value: unknown): Shape {
  if (Array.isArray(value)) return value.map(shapeOf)
  if (typeof value === 'object' && value !== null) return Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shapeOf(inner)]))
  return typeof value
}

function collect(value: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof value === 'string') out.push({ path, text: value })
  else if (Array.isArray(value)) value.forEach((item, i) => collect(item, `${path}[${i}]`, out))
  else if (typeof value === 'object' && value !== null) for (const [key, inner] of Object.entries(value)) collect(inner, `${path}.${key}`, out)
}

describe('research page text', () => {
  it('has the same keys and list lengths in every language', () => {
    const reference = shapeOf(researchText.en)
    for (const lang of LANGS) expect(shapeOf(researchText[lang]), lang).toEqual(reference)
  })

  it('never leaves a string empty', () => {
    for (const lang of LANGS) {
      const strings: { path: string; text: string }[] = []
      collect(researchText[lang], lang, strings)
      for (const { path, text } of strings) expect(text.trim().length, path).toBeGreaterThan(0)
    }
  })

  it('keeps the same {placeholders} in every language', () => {
    const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort()
    const reference: { path: string; text: string }[] = []
    collect(researchText.en, 'en', reference)
    for (const lang of LANGS) {
      const strings: { path: string; text: string }[] = []
      collect(researchText[lang], 'en', strings)
      strings.forEach(({ path, text }, i) => expect(placeholders(text), `${lang} ${path}`).toEqual(placeholders(reference[i].text)))
    }
  })
})
