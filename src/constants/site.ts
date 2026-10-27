export const BRAND = 'DropWise'

export const ROUTES = {
  home: '/',
  problem: '/problem',
  solution: '/solution',
  irrigation: '/irrigation',
  reuse: '/reuse',
  desal: '/desalination',
  leaks: '/leaks',
  athome: '/at-home',
  about: '/about',
} as const

/** The five tools, in the order of the five solutions. */
export const TOOL_ROUTES = [ROUTES.irrigation, ROUTES.reuse, ROUTES.desal, ROUTES.leaks, ROUTES.athome] as const

export const OWID_SLUG = 'agricultural-water-as-a-share-of-total-water-withdrawals'
export const YOUTUBE_ID = 'otrpxtAmDAk'

export const EXTERNAL = {
  jmp: 'https://washdata.org',
  unwater: 'https://www.unwater.org',
  waterOrg: 'https://water.org',
  sdg6: 'https://sdgs.un.org/goals/goal6',
  repo: 'https://github.com/nicolepuzur/DropWise',
} as const
