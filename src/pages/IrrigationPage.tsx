import { BigStat, Chips, FormulaBox, Panel, RangeField } from '../components/controls'
import { FieldArt } from '../components/FieldArt'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { ROUTES } from '../constants/site'
import { useWater } from '../context/water'
import { useLanguage } from '../i18n/LanguageContext'
import { fill, formatM3, formatNumber } from '../utils/format'
import { CROPS, EFFICIENCY, MAX_HECTARES, METHODS, MIN_HECTARES, poolsOf, savingM3, savingShare, waterUseM3, type MethodId } from '../utils/irrigation'

const BAR_COLOR: Record<MethodId, string> = { flood: 'bg-sand', sprinkler: 'bg-sky', drip: 'bg-aqua' }

export function IrrigationPage() {
  const { t, lang } = useLanguage()
  const { irrigation: s, update } = useWater()
  const i = t.irrigation
  const unit = t.common.units.m3

  const uses = METHODS.map((method) => ({ method, use: waterUseM3(s.crop, s.hectares, method) }))
  const maxUse = Math.max(...uses.map((u) => u.use))
  const saving = savingM3(s.crop, s.hectares, s.current)
  const share = savingShare(s.current)

  return (
    <div>
      <PageHeader eyebrow={i.eyebrow} title={i.title} sub={i.sub} />

      <Section tone="plain" className="!pt-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
          <Panel className="space-y-8">
            <RangeField
              id="hectares"
              label={i.fieldLabel}
              value={s.hectares}
              min={MIN_HECTARES}
              max={MAX_HECTARES}
              onChange={(hectares) => update('irrigation', { hectares })}
              display={`${formatNumber(s.hectares, lang)} ${t.common.units.ha}`}
            />
            <Chips label={i.cropLabel} value={s.crop} onChange={(crop) => update('irrigation', { crop })} options={CROPS.map((c) => ({ id: c.id, label: i.crops[c.id], hint: `${c.netMm} ${t.common.units.mm}` }))} />
            <Chips
              label={i.currentLabel}
              value={s.current}
              onChange={(current) => update('irrigation', { current })}
              options={METHODS.map((m) => ({ id: m, label: i.methods[m].name, hint: i.methods[m].desc }))}
            />
          </Panel>

          <Panel>
            <p className="eyebrow">{i.resultEyebrow}</p>
            <ul className="mt-6 space-y-5">
              {uses.map(({ method, use }) => (
                <li key={method} className={`grid grid-cols-[6.5rem_1fr] items-center gap-5 rounded-2xl p-3 transition-colors sm:grid-cols-[8rem_1fr] ${method === s.current ? 'bg-white/[0.05] ring-1 ring-line' : ''}`}>
                  <div className="aspect-[5/3] overflow-hidden rounded-xl">
                    <FieldArt method={method} />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium">{i.methods[method].name}</span>
                      <span className="display !normal-case text-lg tracking-[0.04em] text-white">{formatM3(use, lang, unit)}</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full transition-[width] duration-700 ease-[var(--ease-out-expo)] ${BAR_COLOR[method]}`} style={{ width: `${(use / maxUse) * 100}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-ice/50">
                      {Math.round(EFFICIENCY[method] * 100)} % {i.efficiencyLabel}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-aqua/30 bg-aqua/[0.06] p-6">
              {s.current === 'drip' ? (
                <p className="text-[1.02rem] leading-relaxed text-ice/85">{i.alreadyDrip}</p>
              ) : (
                <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
                  <BigStat label={i.savedTitle} value={formatM3(saving, lang, unit)} />
                  <p className="text-[1rem] leading-relaxed text-ice/80">
                    {fill(i.savedBody, { share: `${formatNumber(share * 100, lang)} %`, pools: formatNumber(poolsOf(saving), lang, 1) })}
                  </p>
                </div>
              )}
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FormulaBox title={i.formulaTitle} lines={i.formula} />
          <Panel>
            <h2 className="text-[1.02rem] font-medium">{i.noteTitle}</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ice/75">{i.note}</p>
            <p className="mt-4 text-xs text-ice/45">
              {t.common.source}: {i.sources}
            </p>
          </Panel>
        </div>

        <Reveal className="mt-14 flex flex-wrap gap-3">
          <Pill to={ROUTES.reuse}>{t.nav.reuse}</Pill>
        </Reveal>
      </Section>
    </div>
  )
}
