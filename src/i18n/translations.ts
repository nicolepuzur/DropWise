import { en, type Translation } from './en'
import { ro } from './ro'
import { ru } from './ru'

export type Lang = 'en' | 'ro' | 'ru'
export type { Translation }

export const LANGS: readonly Lang[] = ['en', 'ro', 'ru']

export const translations: Record<Lang, Translation> = { en, ro, ru }
