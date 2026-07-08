export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function lerp(start: number, end: number, t: number): number {
  return start * (1 - t) + end * t
}

export function linearToDb(linear: number): number {
  if (linear <= 0) return -Infinity
  return 20 * Math.log10(linear)
}

export function dbToLinear(db: number): number {
  return Math.pow(10, db / 20)
}
