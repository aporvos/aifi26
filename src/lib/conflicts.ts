import type { Sesion } from '../types.js';

export interface ConflictPair {
  a: Sesion;
  b: Sesion;
}

export function hasOverlap(a: Sesion, b: Sesion): boolean {
  const aStart = new Date(a.inicio).getTime();
  const aEnd = new Date(a.fin).getTime();
  const bStart = new Date(b.inicio).getTime();
  const bEnd = new Date(b.fin).getTime();
  return aStart < bEnd && bStart < aEnd;
}

export function findConflicts(favoritas: Sesion[]): ConflictPair[] {
  const sorted = [...favoritas].sort(
    (x, y) => new Date(x.inicio).getTime() - new Date(y.inicio).getTime(),
  );
  const out: ConflictPair[] = [];
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i]!;
      const b = sorted[j]!;
      if (new Date(b.inicio).getTime() >= new Date(a.fin).getTime()) break;
      if (a.sala !== b.sala && hasOverlap(a, b)) out.push({ a, b });
    }
  }
  return out;
}

export function getConflictsFor(
  sesionId: string,
  favoritas: Sesion[],
): Sesion[] {
  const self = favoritas.find((s) => s.id === sesionId);
  if (!self) return [];
  return favoritas.filter(
    (other) =>
      other.id !== sesionId && other.sala !== self.sala && hasOverlap(self, other),
  );
}

export function countConflicts(favoritas: Sesion[]): number {
  return findConflicts(favoritas).length;
}
