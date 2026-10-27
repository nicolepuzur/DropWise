import type { ReactNode } from 'react'
import { FormulaBox, Panel, RangeField } from '../components/controls'
import { PageHeader } from '../components/PageHeader'
import { Pill } from '../components/Pill'
import { Reveal } from '../components/Reveal'
import { Section } from '../components/Section'
import { ROUTES } from '../constants/site'
import { useWater } from '../context/water'
import { useLanguage } from '../i18n/LanguageContext'
import { fill, formatNumber, formatVolume } from '../utils/format'
import { BATH_L, clampField, DRINKING_L_PER_YEAR, HOME_RANGES, homeSavings, PLAN_KEYS, type HomeField, type PlanKey } from '../utils/home'

const BAR: Record<PlanKey, string> = { shower: 'bg-aqua', aerator: 'bg-sky', leak: 'bg-sand', rain: 'bg-[#47d68b]' }

interface ActionCardProps {
  id: PlanKey
  title: string
  body: string
  saving: string
  on: boolean
  addLabel: string
  addedLabel: string
  onToggle: () => void
  children?: ReactNode
}

function ActionCard({ id, title, body, saving, on, addLabel, addedLabel, onToggle, children }: ActionCardProps) {
  return (
    <article className={`card-glass flex h-full flex-col p-7 transition-colors ${on ? '!border-aqua/60' : ''}`}>
      <div className="flex items-start gap-3">
        <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${BAR[id]}`} />
        <div>
          <h3 className="display text-xl">{title}</h3>
          <p className="mt-2 text-[0.95rem] leading-relaxed text-ice/70">{body}</p>
        </div>
      </div>
      {children && <div className="mt-6 space-y-6">{children}</div>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-7">
        <p className="mono text-sm text-aqua">{saving}</p>
        <Pill onClick={onToggle} pressed={on} plain>
          {on ? `✓ ${addedLabel}` : addLabel}
        </Pill>
      </div>
    </article>
  )
}

export function AtHomePage() {
  const { t, lang } = useLanguage()
  const { home, update } = useWater()
  const a = t.athome
  const u = t.common.units

  const set = (field: HomeField) => (value: number) => update('home', { [field]: clampField(field, value) })
  const togglePlan = (key: PlanKey) => update('home', { plan: { ...home.plan, [key]: !home.plan[key] } })

  const potential = homeSavings(home)
  const plan = homeSavings(home, home.plan)
  const vol = (litres: number) => formatVolume(litres, lang, u)
  const savesLine = (litres: number) => (litres > 0 ? fill(a.savesLine, { x: vol(litres) }) : a.noSaving)
  const chosen = PLAN_KEYS.filter((key) => home.plan[key])

  return (
    <div>
      <PageHeader eyebrow={a.eyebrow} title={a.title} sub={a.sub} />

      <Section tone="plain" className="!pt-12">
        <Panel className="max-w-xl">
          <RangeField id="people" label={a.peopleLabel} value={home.people} min={HOME_RANGES.people.min} max={HOME_RANGES.people.max} onChange={set('people')} display={String(home.people)} />
        </Panel>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <ActionCard id="shower" title={a.actions.shower.title} body={a.actions.shower.body} saving={savesLine(potential.shower)} on={home.plan.shower} addLabel={a.add} addedLabel={a.added} onToggle={() => togglePlan('shower')}>
            <RangeField id="shower-now" label={a.showerNow} value={home.showerMin} min={HOME_RANGES.showerMin.min} max={HOME_RANGES.showerMin.max} onChange={set('showerMin')} display={`${home.showerMin} ${u.min}`} />
            <RangeField id="shower-target" label={a.showerTarget} value={home.targetMin} min={HOME_RANGES.targetMin.min} max={HOME_RANGES.targetMin.max} onChange={set('targetMin')} display={`${home.targetMin} ${u.min}`} />
          </ActionCard>

          <ActionCard id="aerator" title={a.actions.aerator.title} body={a.actions.aerator.body} saving={savesLine(potential.aerator)} on={home.plan.aerator} addLabel={a.add} addedLabel={a.added} onToggle={() => togglePlan('aerator')} />

          <ActionCard id="leak" title={a.actions.leak.title} body={a.actions.leak.body} saving={savesLine(potential.leak)} on={home.plan.leak} addLabel={a.add} addedLabel={a.added} onToggle={() => togglePlan('leak')}>
            <RangeField id="drips" label={a.dripsLabel} value={home.leakDrops} min={HOME_RANGES.leakDrops.min} max={HOME_RANGES.leakDrops.max} onChange={set('leakDrops')} display={String(home.leakDrops)} />
          </ActionCard>

          <ActionCard id="rain" title={a.actions.rain.title} body={a.actions.rain.body} saving={savesLine(potential.rain)} on={home.plan.rain} addLabel={a.add} addedLabel={a.added} onToggle={() => togglePlan('rain')}>
            <RangeField id="roof" label={a.roofLabel} value={home.roofM2} min={HOME_RANGES.roofM2.min} max={HOME_RANGES.roofM2.max} step={5} onChange={set('roofM2')} display={`${home.roofM2} ${u.m2}`} />
            <RangeField id="rain" label={a.rainLabel} value={home.rainMm} min={HOME_RANGES.rainMm.min} max={HOME_RANGES.rainMm.max} step={10} onChange={set('rainMm')} display={`${home.rainMm} ${u.mm}`} />
            <RangeField id="garden" label={a.gardenLabel} value={home.gardenM2} min={HOME_RANGES.gardenM2.min} max={HOME_RANGES.gardenM2.max} step={10} onChange={set('gardenM2')} display={`${home.gardenM2} ${u.m2}`} />
          </ActionCard>
        </div>

        <Reveal className="mt-8">
          <div className="rounded-3xl border border-aqua/30 bg-gradient-to-br from-aqua/[0.09] to-royal/[0.08] p-8 sm:p-10">
            <p className="eyebrow">{a.totalTitle}</p>
            {plan.total > 0 ? (
              <>
                <p className="display !normal-case mt-4 text-[clamp(2.2rem,5vw,3.8rem)] text-aqua">
                  {vol(plan.total)} <span className="text-[0.4em] tracking-[0.1em] text-ice/70">{t.nav.perYear}</span>
                </p>
                <div className="mt-6 flex h-3 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
                  {chosen.map((key) => (
                    <div key={key} className={`h-full transition-[width] duration-700 ease-[var(--ease-out-expo)] ${BAR[key]}`} style={{ width: `${(plan[key] / plan.total) * 100}%` }} />
                  ))}
                </div>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ice/70">
                  {chosen.map((key) => (
                    <li key={key} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${BAR[key]}`} />
                      {a.actions[key].title} · {vol(plan[key])}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[1.02rem] text-ice/85">
                  {fill(a.bathtubs, { n: formatNumber(plan.total / BATH_L, lang) })}, {fill(a.drinking, { n: formatNumber(plan.total / DRINKING_L_PER_YEAR, lang) })}.
                </p>
              </>
            ) : (
              <p className="mt-4 text-[1.1rem] text-ice/75">{a.totalEmpty}</p>
            )}
            <p className="mt-6 border-t border-line pt-5 text-sm text-ice/60">{fill(a.potentialLine, { x: vol(potential.total) })}</p>
          </div>
        </Reveal>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <FormulaBox title={a.formulaTitle} lines={a.formula} />
          <Panel>
            <p className="text-[0.98rem] leading-relaxed text-ice/80">{a.note}</p>
          </Panel>
        </div>

        <Reveal className="mt-14">
          <Pill to={ROUTES.solution}>{t.nav.solution}</Pill>
        </Reveal>
      </Section>
    </div>
  )
}
