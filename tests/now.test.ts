import { describe, expect, test } from 'vitest';
import {
  EVENT_END_ISO,
  EVENT_START_ISO,
  countActiveSalas,
  getAppMode,
  getCurrentSessionInSala,
  getDefaultRoute,
  getMinutesUntilNextChange,
  getNextSessionInSala,
  isSessionEndingSoon,
  isSessionFuture,
  isSessionLive,
  isSessionPast,
  minutesUntil,
} from '../src/lib/now.js';
import type { Sesion } from '../src/types.js';

const t = (iso: string) => new Date(iso);

function s(id: string, inicio: string, fin: string, sala: Sesion['sala'] = 'pacifico'): Sesion {
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

describe('getAppMode', () => {
  test('pre-evento antes de las 8am del 21', () => {
    expect(getAppMode(t('2026-05-20T22:00:00-03:00'))).toBe('pre');
    expect(getAppMode(t('2026-05-21T07:59:59-03:00'))).toBe('pre');
  });

  test('during evento entre 8am y 17:30', () => {
    expect(getAppMode(t(EVENT_START_ISO))).toBe('during');
    expect(getAppMode(t('2026-05-21T11:42:00-03:00'))).toBe('during');
    expect(getAppMode(t(EVENT_END_ISO))).toBe('during');
  });

  test('post-evento después de 17:30', () => {
    expect(getAppMode(t('2026-05-21T17:30:01-03:00'))).toBe('post');
    expect(getAppMode(t('2026-05-22T09:00:00-03:00'))).toBe('post');
  });
});

describe('getDefaultRoute', () => {
  test('pre y post → /dia', () => {
    expect(getDefaultRoute(t('2026-05-20T22:00:00-03:00'))).toBe('/dia');
    expect(getDefaultRoute(t('2026-05-22T10:00:00-03:00'))).toBe('/dia');
  });
  test('during → /ahora', () => {
    expect(getDefaultRoute(t('2026-05-21T11:42:00-03:00'))).toBe('/ahora');
  });
});

describe('isSessionLive · grace de 60s', () => {
  const sesion = s('demo', '2026-05-21T11:15:00-03:00', '2026-05-21T12:00:00-03:00');

  test('antes del inicio no es live', () => {
    expect(isSessionLive(sesion, t('2026-05-21T11:14:59-03:00'))).toBe(false);
  });

  test('al inicio exacto es live', () => {
    expect(isSessionLive(sesion, t('2026-05-21T11:15:00-03:00'))).toBe(true);
  });

  test('en el medio es live', () => {
    expect(isSessionLive(sesion, t('2026-05-21T11:42:00-03:00'))).toBe(true);
  });

  test('justo en el fin todavía es live (grace 60s)', () => {
    expect(isSessionLive(sesion, t('2026-05-21T12:00:00-03:00'))).toBe(true);
  });

  test('30s después del fin todavía es live (grace 60s)', () => {
    expect(isSessionLive(sesion, t('2026-05-21T12:00:30-03:00'))).toBe(true);
  });

  test('más de 60s después del fin ya no es live', () => {
    expect(isSessionLive(sesion, t('2026-05-21T12:01:01-03:00'))).toBe(false);
  });
});

describe('isSessionPast · isSessionFuture', () => {
  const sesion = s('demo', '2026-05-21T11:15:00-03:00', '2026-05-21T12:00:00-03:00');

  test('past después del fin + grace', () => {
    expect(isSessionPast(sesion, t('2026-05-21T12:01:01-03:00'))).toBe(true);
    expect(isSessionPast(sesion, t('2026-05-21T11:45:00-03:00'))).toBe(false);
  });

  test('future antes del inicio', () => {
    expect(isSessionFuture(sesion, t('2026-05-21T11:00:00-03:00'))).toBe(true);
    expect(isSessionFuture(sesion, t('2026-05-21T11:30:00-03:00'))).toBe(false);
  });
});

describe('isSessionEndingSoon · 5 min', () => {
  const sesion = s('demo', '2026-05-21T11:15:00-03:00', '2026-05-21T12:00:00-03:00');

  test('a 5 minutos del fin es ending soon', () => {
    expect(isSessionEndingSoon(sesion, t('2026-05-21T11:55:00-03:00'))).toBe(true);
    expect(isSessionEndingSoon(sesion, t('2026-05-21T11:58:00-03:00'))).toBe(true);
  });

  test('a 6 minutos del fin NO es ending soon', () => {
    expect(isSessionEndingSoon(sesion, t('2026-05-21T11:54:00-03:00'))).toBe(false);
  });

  test('si no es live no es ending soon', () => {
    expect(isSessionEndingSoon(sesion, t('2026-05-21T13:00:00-03:00'))).toBe(false);
    expect(isSessionEndingSoon(sesion, t('2026-05-21T10:00:00-03:00'))).toBe(false);
  });
});

describe('minutesUntil', () => {
  test('calcula minutos a futuro', () => {
    expect(
      minutesUntil('2026-05-21T12:00:00-03:00', t('2026-05-21T11:42:00-03:00')),
    ).toBe(18);
  });

  test('pasado devuelve 0, nunca negativo', () => {
    expect(
      minutesUntil('2026-05-21T11:00:00-03:00', t('2026-05-21T11:42:00-03:00')),
    ).toBe(0);
  });
});

describe('getCurrentSessionInSala · getNextSessionInSala', () => {
  const sesiones: Sesion[] = [
    s('a', '2026-05-21T09:00:00-03:00', '2026-05-21T09:30:00-03:00', 'pacifico'),
    s('b', '2026-05-21T09:30:00-03:00', '2026-05-21T10:10:00-03:00', 'pacifico'),
    s('c', '2026-05-21T10:00:00-03:00', '2026-05-21T10:45:00-03:00', 'atlantico-b'),
  ];

  test('encuentra la live en pacifico', () => {
    const now = t('2026-05-21T09:45:00-03:00');
    expect(getCurrentSessionInSala(sesiones, 'pacifico', now)?.id).toBe('b');
  });

  test('encuentra la próxima en pacifico', () => {
    const now = t('2026-05-21T09:15:00-03:00');
    expect(getNextSessionInSala(sesiones, 'pacifico', now)?.id).toBe('b');
  });

  test('devuelve null si no hay live', () => {
    const now = t('2026-05-21T12:00:00-03:00');
    expect(getCurrentSessionInSala(sesiones, 'pacifico', now)).toBeNull();
  });

  test('devuelve null si no hay próximas', () => {
    const now = t('2026-05-21T18:00:00-03:00');
    expect(getNextSessionInSala(sesiones, 'pacifico', now)).toBeNull();
  });
});

describe('countActiveSalas', () => {
  const sesiones: Sesion[] = [
    s('a', '2026-05-21T11:00:00-03:00', '2026-05-21T12:00:00-03:00', 'pacifico'),
    s('b', '2026-05-21T11:30:00-03:00', '2026-05-21T12:15:00-03:00', 'atlantico-b'),
    s('c', '2026-05-21T14:00:00-03:00', '2026-05-21T14:30:00-03:00', 'atlantico-c'),
  ];

  test('cuenta 2 salas activas a las 11:45', () => {
    expect(countActiveSalas(sesiones, t('2026-05-21T11:45:00-03:00'))).toBe(2);
  });

  test('cuenta 0 a las 13:00 (lunch)', () => {
    expect(countActiveSalas(sesiones, t('2026-05-21T13:00:00-03:00'))).toBe(0);
  });

  test('cuenta 1 a las 14:15', () => {
    expect(countActiveSalas(sesiones, t('2026-05-21T14:15:00-03:00'))).toBe(1);
  });
});

describe('getMinutesUntilNextChange', () => {
  const sesiones: Sesion[] = [
    s('a', '2026-05-21T11:15:00-03:00', '2026-05-21T12:00:00-03:00', 'pacifico'),
    s('b', '2026-05-21T11:30:00-03:00', '2026-05-21T12:15:00-03:00', 'atlantico-b'),
  ];

  test('próximo cambio es el fin de a (18 min)', () => {
    const r = getMinutesUntilNextChange(sesiones, t('2026-05-21T11:42:00-03:00'));
    expect(r).toBe(18);
  });

  test('antes del inicio, próximo cambio es el inicio de a', () => {
    const r = getMinutesUntilNextChange(sesiones, t('2026-05-21T11:00:00-03:00'));
    expect(r).toBe(15);
  });

  test('después de todo, devuelve null', () => {
    expect(getMinutesUntilNextChange(sesiones, t('2026-05-22T09:00:00-03:00'))).toBeNull();
  });
});
