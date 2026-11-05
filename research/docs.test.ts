import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import benchmark from './results/benchmark.json' with { type: 'json' }
import { abstractHtml, annexHtml, assertVerdicts, fmt, today, withKnownDemand } from './docs.ts'

const file = (name: string) => readFileSync(new URL(`../docs/moldsef/${name}`, import.meta.url), 'utf8')

describe('docs/moldsef are built from the benchmark', () => {
  it('has an abstract that is exactly what research/docs.ts builds from benchmark.json (run node research/makeDocs.ts after a new benchmark)', () => {
    expect(file('abstract.html')).toBe(abstractHtml())
  })

  it('has a visual annex that is exactly what research/docs.ts builds', () => {
    expect(file('visual-annex.html')).toBe(annexHtml())
  })

  it('writes prose that matches the verdicts of the benchmark', () => {
    expect(() => assertVerdicts()).not.toThrow()
    expect(benchmark.hypotheses.h1.verdict).toBe('partially supported')
    expect(benchmark.hypotheses.h2.verdict).toBe('partially supported')
    expect(file('abstract.html')).toContain('<b>H1 is partially supported:</b>')
    expect(file('abstract.html')).toContain('<b>H2 is partially supported:</b>')
  })

  it('quotes the main numbers of the benchmark', () => {
    const abstract = file('abstract.html')
    const h1 = benchmark.hypotheses.h1.reduction.estimate * 100
    expect(abstract).toContain(`${h1.toFixed(1)}% fewer dry holes`)
    for (const id of ['random', 'naive', 'fingerprint', 'fit'] as const) {
      expect(abstract).toContain(benchmark.main.methods[id].meanDryHoles.estimate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    }
  })

  it('has a pitch whose numbers are the numbers of the benchmark and the cost model', () => {
    const pitch = file('../PITCH.md')
    const known = benchmark.robustness.find((c) => c.condition.demandFactor === 0)!
    expect(pitch).toContain(`${(benchmark.hypotheses.h1.reduction.estimate * 100).toFixed(1)}%`)
    expect(pitch).toContain(`${Math.round(known.reductionVersusNaive.fingerprint.estimate * 100)}%`)
    expect(pitch).toContain(`about ${Math.round(withKnownDemand.fingerprint.paybackMonths)} months`)
    expect(pitch).toContain(`about ${Math.round(today.dryHoleCostEur / 10) * 10} euro`)
    expect(pitch).toContain(`${fmt(today.waterLostM3PerDay)} cubic metres`)
  })

  it('has a poster built from the same data', () => {
    const poster = readFileSync(new URL('../docs/poster/poster-A0.html', import.meta.url), 'utf8')
    expect(poster).toContain('@page { size: 841mm 1189mm; margin: 0; }')
    expect(poster).toContain(`${(benchmark.hypotheses.h1.reduction.estimate * 100).toFixed(1)}%`)
  })

  it('uses Times New Roman at 12 pt and stays small enough to upload', () => {
    const abstract = file('abstract.html')
    expect(abstract).toContain('font-family: "Times New Roman"')
    expect(abstract).toContain('font-size: 12pt')
    expect(Buffer.byteLength(abstract)).toBeLessThan(1_000_000)
  })
})
