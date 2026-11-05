import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { researchText } from '../i18n/research'
import { fill, formatNumber } from '../utils/format'
import {
  breakEvenLeaksPerYear,
  DEFAULT_ASSUMPTIONS,
  estimateLeakEconomics,
  MARKET_PRICES,
  MDL_PER_EUR,
  WATER_TARIFF_MDL,
  type LeakEconomicsInput,
  type MethodEconomics,
  type MethodKey,
} from '../utils/leakEconomics'
import { Panel, RangeField } from './controls'

interface Props {
  /** Mean dry holes of each method in the main experiment. */
  dryToday: Record<MethodKey, number>
  /** The same when customer demand is known exactly. */
  dryKnown: Record<MethodKey, number>
}

export function LeakMoney({ dryToday, dryKnown }: Props) {
  const { lang } = useLanguage()
  const r = researchText[lang]
  const [leak, setLeak] = useState(DEFAULT_ASSUMPTIONS.leakLitresPerSecond)
  const [costDig, setCostDig] = useState(DEFAULT_ASSUMPTIONS.costPerDigEur)
  const [daysDig, setDaysDig] = useState(DEFAULT_ASSUMPTIONS.daysPerDig)
  const [value, setValue] = useState(DEFAULT_ASSUMPTIONS.waterValueShare)
  const [leaksYear, setLeaksYear] = useState(DEFAULT_ASSUMPTIONS.leaksPerYear)
  const [system, setSystem] = useState(DEFAULT_ASSUMPTIONS.systemCostEur)
  const [running, setRunning] = useState(DEFAULT_ASSUMPTIONS.runningCostEurPerYear)

  const input = (dryHoles: Record<MethodKey, number>): LeakEconomicsInput => ({
    leakLitresPerSecond: leak,
    dryHoles,
    costPerDigEur: costDig,
    daysPerDig: daysDig,
    waterValueShare: value,
    leaksPerYear: leaksYear,
    systemCostEur: system,
    runningCostEurPerYear: running,
  })
  const today = estimateLeakEconomics(input(dryToday))
  const known = estimateLeakEconomics(input(dryKnown))
  const breakEven = breakEvenLeaksPerYear(input(dryToday), 'fit', 5)

  const eur = (x: number) => `${x < 0 ? '−' : ''}${formatNumber(Math.abs(x), lang, 0)} €`
  const payback = (m: MethodEconomics) => (Number.isFinite(m.paybackMonths) ? `${formatNumber(m.paybackMonths, lang, m.paybackMonths < 10 ? 1 : 0)} ${r.months}` : r.never)
  const avoided = (m: MethodEconomics) => formatNumber(m.dryHolesAvoidedPerLeak, lang, 2)

  const columns: { head: string; sub: string; data: MethodEconomics }[] = [
    { head: r.methods.fingerprint.name, sub: r.today, data: today.fingerprint },
    { head: r.methods.fit.name, sub: r.today, data: today.fit },
    { head: r.methods.fingerprint.name, sub: r.known, data: known.fingerprint },
    { head: r.methods.fit.name, sub: r.known, data: known.fit },
  ]
  const rows: { label: string; cell: (m: MethodEconomics) => string }[] = [
    { label: r.rows.avoided, cell: avoided },
    { label: r.rows.perLeak, cell: (m) => eur(m.savingPerLeakEur) },
    { label: r.rows.perYear, cell: (m) => eur(m.savingPerYearEur) },
    { label: r.rows.payback, cell: payback },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
        <Panel className="space-y-7">
          <RangeField id="m-leak" label={r.sliders.leak} value={leak} min={5} max={25} onChange={setLeak} display={formatNumber(leak, lang)} />
          <RangeField id="m-dig" label={r.sliders.costDig} value={costDig} min={200} max={2000} step={100} onChange={setCostDig} display={`${formatNumber(costDig, lang)} €`} />
          <RangeField id="m-days" label={r.sliders.daysDig} value={daysDig} min={0.25} max={2} step={0.25} onChange={setDaysDig} display={formatNumber(daysDig, lang, 2)} />
          <RangeField id="m-value" label={r.sliders.value} value={value} min={0.25} max={1} step={0.05} onChange={setValue} display={`${formatNumber(value * 100, lang)} %`} />
          <RangeField id="m-year" label={r.sliders.leaksYear} value={leaksYear} min={1} max={12} onChange={setLeaksYear} display={formatNumber(leaksYear, lang)} />
          <RangeField id="m-system" label={r.sliders.system} value={system} min={4000} max={30000} step={1000} onChange={setSystem} display={`${formatNumber(system, lang)} €`} />
          <RangeField id="m-run" label={r.sliders.running} value={running} min={0} max={5000} step={250} onChange={setRunning} display={`${formatNumber(running, lang)} €`} />
        </Panel>

        <Panel>
          <p className="text-[0.95rem] leading-relaxed text-ice/80">{fill(r.waterLost, { m3: formatNumber(today.waterLostM3PerDay, lang), mdl: formatNumber(today.waterLostMdlPerDay, lang) })}</p>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ice/80">
            {fill(r.dryHoleCost, { eur: formatNumber(today.dryHoleCostEur, lang), mdl: formatNumber(today.dryHoleCostEur * MDL_PER_EUR, lang) })}
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead>
                <tr className="text-ice/60">
                  <th className="pb-3 pr-4 font-normal" />
                  {columns.map((c, i) => (
                    <th key={i} className="pb-3 pr-4 align-bottom font-normal">
                      <span className="block text-white">{c.head}</span>
                      <span className="block text-xs text-ice/50">{c.sub}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <th className="py-3 pr-4 font-normal text-ice/75">{row.label}</th>
                    {columns.map((c, i) => (
                      <td key={i} className="mono py-3 pr-4 text-aqua">
                        {row.cell(c.data)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {Number.isFinite(breakEven) && <p className="mt-5 text-sm text-ice/70">{fill(r.breakEven, { leaks: formatNumber(breakEven, lang, 1) })}</p>}
          <p className="mt-4 text-xs leading-relaxed text-ice/50">{fill(r.tariffNote, { tariff: formatNumber(WATER_TARIFF_MDL, lang, 2), rate: formatNumber(MDL_PER_EUR, lang, 2) })}</p>
        </Panel>
      </div>

      <Panel>
        <h3 className="text-lg font-medium">{r.marketTitle}</h3>
        <p className="mt-2 text-sm text-ice/60">{r.marketNote}</p>
        <ul className="mt-5 space-y-4" lang="en">
          {MARKET_PRICES.map((p) => (
            <li key={p.id} className="border-t border-line pt-4 text-sm leading-relaxed">
              <p className="font-medium text-white">{p.what}</p>
              <p className="mono mt-1 text-aqua">{p.price}</p>
              <p className="mt-1 text-ice/60">{p.source}</p>
              <p className="mt-1 text-ice/50">{p.note}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
