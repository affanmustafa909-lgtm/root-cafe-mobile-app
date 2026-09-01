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
