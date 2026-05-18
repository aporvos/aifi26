import type { AppMode, SalaSlug, Sesion } from '../types.js';

export const EVENT_TZ = 'America/Argentina/Buenos_Aires';
export const EVENT_DATE_BA = '2026-05-21';
export const EVENT_START_ISO = '2026-05-21T08:00:00-03:00';
export const EVENT_END_ISO = '2026-05-21T17:30:00-03:00';

export const LIVE_GRACE_MS = 60 * 1000;
export const ENDING_SOON_MS = 5 * 60 * 1000;

export function nowInBA(reference?: Date): Date {
  return reference ? new Date(reference.getTime()) : new Date();
}

export function getAppMode(now: Date = nowInBA()): AppMode {
  const start = new Date(EVENT_START_ISO).getTime();
  const end = new Date(EVENT_END_ISO).getTime();
  const t = now.getTime();
  if (t < start) return 'pre';
  if (t > end) return 'post';
  return 'during';
}

export function getDefaultRoute(now: Date = nowInBA()): '/dia' | '/ahora' {
  return getAppMode(now) === 'during' ? '/ahora' : '/dia';
}

export function getSessionEndWithGrace(sesion: Sesion): number {
  return new Date(sesion.fin).getTime() + LIVE_GRACE_MS;
}

export function isSessionLive(sesion: Sesion, now: Date = nowInBA()): boolean {
  const t = now.getTime();
  const start = new Date(sesion.inicio).getTime();
  const endWithGrace = getSessionEndWithGrace(sesion);
  return t >= start && t < endWithGrace;
}

export function isSessionPast(sesion: Sesion, now: Date = nowInBA()): boolean {
  return now.getTime() >= getSessionEndWithGrace(sesion);
}

export function isSessionFuture(sesion: Sesion, now: Date = nowInBA()): boolean {
  return now.getTime() < new Date(sesion.inicio).getTime();
}

export function isSessionEndingSoon(sesion: Sesion, now: Date = nowInBA()): boolean {
  if (!isSessionLive(sesion, now)) return false;
  const t = now.getTime();
  const end = new Date(sesion.fin).getTime();
  const msLeft = end - t;
  return msLeft >= 0 && msLeft <= ENDING_SOON_MS;
}

export function minutesUntil(targetIso: string, now: Date = nowInBA()): number {
  const diff = new Date(targetIso).getTime() - now.getTime();
  return Math.max(0, Math.round(diff / 60000));
}

export function getCurrentSessionInSala(
  sesiones: Sesion[],
  sala: SalaSlug,
  now: Date = nowInBA(),
): Sesion | null {
  return sesiones.find((s) => s.sala === sala && isSessionLive(s, now)) ?? null;
}

export function getNextSessionInSala(
  sesiones: Sesion[],
  sala: SalaSlug,
  now: Date = nowInBA(),
): Sesion | null {
  const t = now.getTime();
  const upcoming = sesiones
    .filter((s) => s.sala === sala && new Date(s.inicio).getTime() > t)
    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime());
  return upcoming[0] ?? null;
}

export function getMinutesUntilNextChange(
  sesiones: Sesion[],
  now: Date = nowInBA(),
): number | null {
  const t = now.getTime();
  const upcomingChanges: number[] = [];

  for (const s of sesiones) {
    const end = new Date(s.fin).getTime();
    if (isSessionLive(s, now) && end > t) upcomingChanges.push(end - t);
    const start = new Date(s.inicio).getTime();
    if (start > t) upcomingChanges.push(start - t);
  }

  if (upcomingChanges.length === 0) return null;
  const minMs = Math.min(...upcomingChanges);
  return Math.max(0, Math.round(minMs / 60000));
}

export function countActiveSalas(sesiones: Sesion[], now: Date = nowInBA()): number {
  const salas = new Set<SalaSlug>();
  for (const s of sesiones) {
    if (isSessionLive(s, now)) salas.add(s.sala);
  }
  return salas.size;
}
