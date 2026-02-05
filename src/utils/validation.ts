// toni/src/utils/validation.ts

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function isValidAttribute(value: number): boolean {
  return value >= 0 && value <= 100;
}

export function isValidFitness(value: number): boolean {
  return value >= 0 && value <= 100;
}

export function isValidPosition(pos: string): boolean {
  return typeof pos === 'string' && pos.length >= 2;
}
