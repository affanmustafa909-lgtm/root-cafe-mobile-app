import type { AppSettings } from '../types';

function parseHm(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

function formatHm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function generatePickupSlots(settings: AppSettings): string[] {
  const { openTime, closeTime, slotIntervalMinutes } = settings.pickup;
  const open = parseHm(openTime);
  const close = parseHm(closeTime);
  const slots: string[] = [];
  for (let t = open; t <= close; t += slotIntervalMinutes) {
    slots.push(formatHm(t));
  }
  return slots;
}

export function generatePickupDates(settings: AppSettings): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i <= settings.pickup.maxDaysAhead; i += 1) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
  }
  return dates;
}

export function createLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Normalize API dates like `2026-09-07T00:00:00.000Z` or `2026-09-07` → Date (local calendar day). */
function parsePickupDate(value?: string | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    const year = Number(ymd[1]);
    const month = Number(ymd[2]) - 1;
    const day = Number(ymd[3]);
    const d = new Date(year, month, day);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatPickupTime(value?: string | null): string {
  if (!value) return '';
  const trimmed = value.trim();
  const hm = trimmed.match(/^(\d{1,2}):(\d{2})/);
  if (hm) {
    return `${hm[1].padStart(2, '0')}:${hm[2]}`;
  }
  return trimmed;
}

/** Human-readable pickup line, e.g. `Sun, 7 Sep 2026 · 08:45`. */
export function formatPickupDateTime(
  pickupDate?: string | null,
  pickupTime?: string | null,
): string {
  const date = parsePickupDate(pickupDate);
  const time = formatPickupTime(pickupTime);
  const datePart = date
    ? date.toLocaleDateString(undefined, {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : (pickupDate ?? '').trim();
  if (datePart && time) return `${datePart} · ${time}`;
  return datePart || time || '—';
}
