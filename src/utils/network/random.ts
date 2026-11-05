/** A small seeded random generator, so every experiment can be repeated exactly. */
export type Rng = () => number

/** mulberry32: a few lines, uniform on [0, 1), good enough for simulations. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** One draw from a normal distribution (Box-Muller). */
export function normal(rng: Rng, mean = 0, sd = 1): number {
  const u = 1 - rng()
  const v = rng()
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Log-uniform on [min, max]: every factor of ten is equally likely. */
export function logUniform(rng: Rng, min: number, max: number): number {
  return Math.exp(Math.log(min) + rng() * (Math.log(max) - Math.log(min)))
}

/** A random order of 0..n-1 (Fisher-Yates). */
export function shuffled(rng: Rng, n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  return order
}
