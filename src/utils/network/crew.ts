import { DIG_RADIUS } from '../leaks.ts'
import type { PipePosition } from './graph.ts'

/**
 * The next place a crew digs, one step at a time: the first place of the ranking that is not within the dig radius of a
 * place already dug. `runDigs` in localize.ts follows the same rule for a whole hunt at once.
 */
export function nextDigPlace(ranking: readonly PipePosition[], digs: readonly { x: number; y: number }[], radius = DIG_RADIUS): PipePosition | null {
  for (const place of ranking) {
    if (!digs.some((d) => Math.hypot(d.x - place.x, d.y - place.y) <= radius)) return place
  }
  return null
}
