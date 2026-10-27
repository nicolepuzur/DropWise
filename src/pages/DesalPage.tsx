import { BigStat, Chips, FormulaBox, Panel, RangeField } from '../components/controls'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { ROUTES } from '../constants/site'
import { useWater } from '../context/water'
import { useLanguage } from '../i18n/LanguageContext'
import { calcDesal, MAX_LITRES, MIN_LITRES, REGIONS, TECHS } from '../utils/desal'
import { fill, formatCompact, formatM3, formatNumber } from '../utils/format'
import { nearestPeopleStep, PEOPLE_STEPS } from '../utils/reuse'

const MAX_PITCHES_SHOWN = 24

function Pitch() {
  return (
    <svg viewBox="0 0 54 36" className="h-9 w-[3.4rem]" aria-hidden="true">
      <rect width="54" height="36" rx="3" fill="#0f3d8f" stroke="#5fd3ff" strokeOpacity=".7" />
      <path d="M27 0V36M0 12h5v12H0M54 12h-5v12h5" stroke="#5fd3ff" strokeOpacity=".45" fill="none" />
      <circle cx="27" cy="18" r="5" fill="none" stroke="#5fd3ff" strokeOpacity=".45" />
      <path d="M8 6H46M8 14H46M8 22H46M8 30H46" stroke="#8fe3ff" strokeOpacity=".14" />
    </svg>
  )
}

export function DesalPage() {
  const { t, lang } = useLanguage()
  const { desal: s, update } = useWater()
  const d = t.desal
  const u = t.common.units
  const result = calcDesal(s.people, s.litres, s.tech, s.region)
  const stepIndex = PEOPLE_STEPS.indexOf(nearestPeopleStep(s.people))

  const solar = result.solarKwp >= 1000 ? `${formatNumber(result.solarKwp / 1000, lang, result.solarKwp < 10000 ? 1 : 0)} ${u.mwp}` : `${formatNumber(result.solarKwp, lang)} ${u.kwp}`
  const pitchCount = Math.max(1, Math.round(result.pitches))
  const pitchesText =
    pitchCount === 1 ? d.pitchesOne : fill(d.pitchesNote, { n: formatNumber(result.pitches, lang, result.pitches < 10 ? 1 : 0) })

  return (
    <div>
      <PageHeader eyebrow={d.eyebrow} title={d.title} sub={d.sub} />

      <Section tone="plain" className="!pt-12">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
          <Panel className="space-y-8">
            <RangeField
              id="desal-people"
              label={d.cityLabel}
              value={stepIndex}
              min={0}
              max={PEOPLE_STEPS.length - 1}
              onChange={(index) => update('desal', { people: PEOPLE_STEPS[index] })}
              display={`${formatCompact(PEOPLE_STEPS[stepIndex], lang)} ${u.people}`}
            />
            <RangeField id="desal-litres" label={d.litresLabel} value={s.litres} min={MIN_LITRES} max={MAX_LITRES} step={5} onChange={(litres) => update('desal', { litres })} display={`${s.litres} ${u.l}`} />
            <Chips label={d.techLabel} value={s.tech} onChange={(tech) => update('desal', { tech })} options={TECHS.map((id) => ({ id, label: d.techs[id].name, hint: d.techs[id].desc }))} />
            <Chips label={d.regionLabel} value={s.region} onChange={(region) => update('desal', { region })} options={REGIONS.map((id) => ({ id, label: d.regions[id].name, hint: d.regions[id].desc }))} />
          </Panel>

          <Panel>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              <BigStat label={d.stats.fresh} value={formatM3(result.freshM3PerDay, lang, u.m3)} />
              <BigStat label={d.stats.energy} value={`${formatCompact(result.energyKwhPerDay, lang)} ${u.kwh}`} />
              <BigStat label={d.stats.solar} value={solar} tone="sand" />
              <BigStat label={d.stats.area} value={formatM3(result.panelAreaM2, lang, u.m2)} tone="sand" />
              <BigStat label={d.stats.brine} value={formatM3(result.brineM3PerDay, lang, u.m3)} tone="coral" />
            </div>

            <div className="mt-8 border-t border-line pt-8">
              <div className="flex flex-wrap gap-2" role="img" aria-label={pitchesText}>
                {Array.from({ length: Math.min(pitchCount, MAX_PITCHES_SHOWN) }, (_, k) => (
                  <Pitch key={k} />
                ))}
                {pitchCount > MAX_PITCHES_SHOWN && <span className="mono self-center pl-2 text-sm text-aqua">+{formatNumber(pitchCount - MAX_PITCHES_SHOWN, lang)}</span>}
              </div>
              <p className="mt-4 text-[1rem] text-ice/80">{pitchesText}</p>
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FormulaBox title={d.formulaTitle} lines={d.formula} />
          <Panel>
            <h2 className="text-[1.02rem] font-medium">{d.noteTitle}</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-ice/75">{d.note}</p>
            <p className="mt-4 text-xs text-ice/45">
              {t.common.source}: {d.sources}
            </p>
          </Panel>
        </div>

        <Reveal className="mt-14">
          <Pill to={ROUTES.leaks}>{t.nav.leaks}</Pill>
        </Reveal>
      </Section>
    </div>
  )
}
