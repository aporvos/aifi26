import { describe, expect, test } from 'vitest';
import { countConflicts, findConflicts, getConflictsFor, hasOverlap } from '../src/lib/conflicts.js';
import type { Sesion } from '../src/types.js';

function s(id: string, inicio: string, fin: string, sala: Sesion['sala']): Sesion {
  return {
    id,
    titulo: id,
    sala,
    inicio,
    fin,
    speakers: [],
    tipo: 'talk',
    category: 'estrategia-y-liderazgo',
  };
}

describe('hasOverlap', () => {
  test('dos sesiones que se pisan parcialmente → overlap', () => {
    const a = s('a', '2026-05-21T11:00:00-03:00', '2026-05-21T12:00:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T11:30:00-03:00', '2026-05-21T12:30:00-03:00', 'atlantico-c');
    expect(hasOverlap(a, b)).toBe(true);
  });

  test('una termina cuando la otra empieza → NO overlap', () => {
    const a = s('a', '2026-05-21T11:00:00-03:00', '2026-05-21T12:00:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T12:00:00-03:00', '2026-05-21T13:00:00-03:00', 'atlantico-c');
    expect(hasOverlap(a, b)).toBe(false);
  });

  test('una contiene a la otra → overlap', () => {
    const a = s('a', '2026-05-21T11:00:00-03:00', '2026-05-21T13:00:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T11:30:00-03:00', '2026-05-21T12:00:00-03:00', 'atlantico-c');
    expect(hasOverlap(a, b)).toBe(true);
  });

  test('disjuntas → NO overlap', () => {
    const a = s('a', '2026-05-21T09:00:00-03:00', '2026-05-21T10:00:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T14:00:00-03:00', '2026-05-21T15:00:00-03:00', 'atlantico-c');
    expect(hasOverlap(a, b)).toBe(false);
  });
});

describe('findConflicts', () => {
  test('detecta el conflicto del caso real: EVIDENT (14:00 Pacífico) vs VCs (14:00 Atlántico C)', () => {
    const a = s('evident', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'pacifico');
    const b = s('vcs', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'atlantico-c');
    const result = findConflicts([a, b]);
    expect(result).toHaveLength(1);
    expect(result[0]!.a.id).toBe('evident');
    expect(result[0]!.b.id).toBe('vcs');
  });

  test('dos sesiones en la misma sala no es conflicto (es secuencia)', () => {
    const a = s('a', '2026-05-21T11:00:00-03:00', '2026-05-21T12:00:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T11:30:00-03:00', '2026-05-21T12:30:00-03:00', 'pacifico');
    expect(findConflicts([a, b])).toHaveLength(0);
  });

  test('sin favoritos devuelve array vacío', () => {
    expect(findConflicts([])).toEqual([]);
  });

  test('un solo favorito devuelve array vacío', () => {
    const a = s('a', '2026-05-21T11:00:00-03:00', '2026-05-21T12:00:00-03:00', 'pacifico');
    expect(findConflicts([a])).toEqual([]);
  });

  test('múltiples conflictos detectados', () => {
    const a = s('a', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T14:00:00-03:00', '2026-05-21T14:45:00-03:00', 'atlantico-b');
    const c = s('c', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'atlantico-c');
    const conflicts = findConflicts([a, b, c]);
    expect(conflicts).toHaveLength(3);
  });
});

describe('getConflictsFor', () => {
  test('devuelve solo los conflictos de una sesión específica', () => {
    const a = s('a', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'atlantico-c');
    const c = s('c', '2026-05-21T15:00:00-03:00', '2026-05-21T15:30:00-03:00', 'pacifico');
    const result = getConflictsFor('a', [a, b, c]);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe('b');
  });

  test('id no existente devuelve array vacío', () => {
    const a = s('a', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'pacifico');
    expect(getConflictsFor('xxx', [a])).toEqual([]);
  });
});

describe('countConflicts', () => {
  test('cuenta correcto', () => {
    const a = s('a', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'pacifico');
    const b = s('b', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'atlantico-c');
    expect(countConflicts([a, b])).toBe(1);
    expect(countConflicts([])).toBe(0);
  });
});
