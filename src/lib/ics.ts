import type { Sesion, Speaker } from '../types.js';
import { SALA_NOMBRE } from '../types.js';
import { EVENT_TZ } from './now.js';

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function toIcsLocal(iso: string): string {
  const [date, time] = iso.replace('-03:00', '').split('T');
  if (!date || !time) return iso.replace(/[-:]/g, '').replace(/\.\d+/, '');
  return `${date.replace(/-/g, '')}T${time.replace(/:/g, '')}`;
}

function speakersToDescription(sesion: Sesion, speakers: Speaker[]): string {
  const byId = new Map(speakers.map((s) => [s.id, s]));
  const lines: string[] = [];
  if (sesion.descripcion) lines.push(sesion.descripcion);
  if (sesion.speakers.length > 0) {
    lines.push('');
    lines.push('Speakers:');
    for (const id of sesion.speakers) {
      const sp = byId.get(id);
      if (sp) lines.push(`· ${sp.nombre} — ${sp.rol}`);
    }
  }
  if (sesion.moderador) {
    const mod = byId.get(sesion.moderador);
    if (mod) {
      lines.push('');
      lines.push(`Moderador: ${mod.nombre} — ${mod.rol}`);
    }
  }
  return lines.join('\n');
}

function buildVevent(sesion: Sesion, speakers: Speaker[]): string {
  const uid = `${sesion.id}@aifi26`;
  const dtstart = toIcsLocal(sesion.inicio);
  const dtend = toIcsLocal(sesion.fin);
  const summary = escapeIcsText(sesion.titulo);
  const location = escapeIcsText(`Salón ${SALA_NOMBRE[sesion.sala]} · Hotel Hilton Buenos Aires`);
  const description = escapeIcsText(speakersToDescription(sesion, speakers));

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')}`,
    `DTSTART;TZID=${EVENT_TZ}:${dtstart}`,
    `DTEND;TZID=${EVENT_TZ}:${dtend}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'END:VEVENT',
  ].join('\r\n');
}

export function buildIcs(sesiones: Sesion[], speakers: Speaker[]): string {
  const events = sesiones.map((s) => buildVevent(s, speakers)).join('\r\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AIFI26//cronograma no oficial//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    events,
    'END:VCALENDAR',
  ].join('\r\n');
}

export function buildIcsFilename(sesion?: Sesion): string {
  if (!sesion) return 'aifi26-agenda.ics';
  return `aifi26-${sesion.id}.ics`;
}
