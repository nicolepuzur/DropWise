import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow: string
  title: string
  sub?: string
  children?: ReactNode
}

/** Opening of every inner page: a small label, a wide tracked headline, one line of context, and a glow of blue light. */
export function PageHeader({ eyebrow, title, sub, children }: PageHeaderProps) {
  return (
    <header className="glow-blue relative overflow-hidden border-b border-line px-6 pb-14 pt-[calc(var(--header-h)+3.5rem)] sm:px-10 sm:pb-20 sm:pt-[calc(var(--header-h)+5rem)]">
      <svg className="pointer-events-none absolute -right-24 top-10 hidden h-[28rem] w-[28rem] text-aqua/10 md:block" viewBox="0 0 200 200" fill="none" stroke="currentColor" aria-hidden="true">
        {[30, 55, 80, 105].map((r, i) => (
          <circle key={r} cx="100" cy="100" r={r} strokeWidth="0.6" strokeDasharray={i % 2 ? '2 5' : '1 3'} />
        ))}
      </svg>
      <div className="relative mx-auto max-w-[1200px]">
        <p className="eyebrow rise-in">{eyebrow}</p>
        <h1 className="display rise-in mt-5 max-w-4xl text-[clamp(2rem,5vw,3.9rem)] text-balance" style={{ animationDelay: '0.08s' }}>
          {title}
        </h1>
        {sub && (
          <p className="rise-in mt-6 max-w-2xl text-lg leading-relaxed text-ice/75 sm:text-xl" style={{ animationDelay: '0.16s' }}>
            {sub}
          </p>
        )}
        {children && (
          <div className="rise-in mt-8" style={{ animationDelay: '0.24s' }}>
            {children}
          </div>
        )}
      </div>
    </header>
  )
}
