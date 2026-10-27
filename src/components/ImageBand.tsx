import { Pill } from './Pill'
import { Reveal } from './Reveal'
import { Scene, type SceneId } from './scenes/Scene'

interface ImageBandProps {
  scene: SceneId
  title: string
  body: string
  cta: string
  to: string
}

/** A full-width band with an animated scene, a short statement on it and a capsule button, like the image breaks on Magnesia. */
export function ImageBand({ scene, title, body, cta, to }: ImageBandProps) {
  return (
    <section className="grain relative isolate flex min-h-[34rem] items-end overflow-hidden bg-ink">
      <Scene scene={scene} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink to-transparent" />
      <div className="relative mx-auto grid w-full max-w-[1240px] items-end gap-8 px-6 pb-14 pt-32 sm:px-10 md:grid-cols-[1fr_auto]">
        <Reveal>
          <h2 className="display max-w-3xl text-[clamp(1.7rem,3.6vw,2.9rem)] text-balance">{title}</h2>
          <p className="mt-4 max-w-xl text-lg text-ice/80">{body}</p>
        </Reveal>
        <Reveal delay={150}>
          <Pill to={to}>{cta}</Pill>
        </Reveal>
      </div>
    </section>
  )
}
