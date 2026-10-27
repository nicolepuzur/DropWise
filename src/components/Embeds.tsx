interface OwidEmbedProps {
  slug: string
  title: string
  source: string
}

/** Live interactive chart from Our World in Data, with its own country selector and year range. */
export function OwidEmbed({ slug, title, source }: OwidEmbedProps) {
  return (
    <figure className="card-glass overflow-hidden">
      <div className="relative w-full" style={{ paddingTop: '62%' }}>
        <iframe className="absolute inset-0 h-full w-full bg-white" src={`https://ourworldindata.org/grapher/${slug}`} title={title} loading="lazy" />
      </div>
      <figcaption className="p-5">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-xs text-ice/50">{source}</p>
      </figcaption>
    </figure>
  )
}

interface YoutubeEmbedProps {
  videoId: string
  title: string
  credit: string
}

export function YoutubeEmbed({ videoId, title, credit }: YoutubeEmbedProps) {
  return (
    <figure className="card-glass overflow-hidden">
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <figcaption className="p-5">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-xs text-ice/50">{credit}</p>
      </figcaption>
    </figure>
  )
}
