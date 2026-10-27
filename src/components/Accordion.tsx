import { useId, useState } from 'react'

interface AccordionItem {
  q: string
  a: string
}

/** Questions that open one at a time, like the FAQ on Magnesia. */
export function Accordion({ items }: { items: readonly AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const uid = useId()

  return (
    <div className="border-t border-line">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q} className="border-b border-line">
            <h3>
              <button
                type="button"
                id={`${uid}-q${i}`}
                aria-expanded={isOpen}
                aria-controls={`${uid}-a${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-6 py-6 text-left text-lg font-medium text-white transition-colors hover:text-aqua sm:text-xl"
              >
                <span>{item.q}</span>
                <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line" aria-hidden="true">
                  <span className="absolute h-px w-3.5 bg-current" />
                  <span className={`absolute h-3.5 w-px bg-current transition-transform duration-500 ease-[var(--ease-out-expo)] ${isOpen ? 'rotate-90 opacity-0' : ''}`} />
                </span>
              </button>
            </h3>
            <div
              id={`${uid}-a${i}`}
              role="region"
              aria-labelledby={`${uid}-q${i}`}
              className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <p className="max-w-3xl pb-7 text-[1.02rem] leading-relaxed text-ice/75">{item.a}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
