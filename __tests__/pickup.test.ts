import { generatePickupDates, generatePickupSlots } from '../src/utils/pickup';
import type { AppSettings } from '../src/types';

const settings: AppSettings = {
  currency: 'EUR',
  taxRate: 0,
  timezone: 'Europe/Dublin',
  pickup: {
    openTime: '08:00',
    closeTime: '08:30',
    slotIntervalMinutes: 15,
    maxDaysAhead: 2,
    asapEstimateMinutes: 15,
  },
};

describe('pickup utils', () => {
  it('generates slots from config', () => {
    expect(generatePickupSlots(settings)).toEqual(['08:00', '08:15', '08:30']);
  });

  it('generates date range including today', () => {
    const dates = generatePickupDates(settings);
    expect(dates).toHaveLength(3);
    expect(dates[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
