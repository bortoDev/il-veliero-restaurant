import { DaySchedule, OpeningHours } from '../models';

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Lunedì',
  tuesday: 'Martedì',
  wednesday: 'Mercoledì',
  thursday: 'Giovedì',
  friday: 'Venerdì',
  saturday: 'Sabato',
  sunday: 'Domenica',
};

/** Orari reali del locale, usati finché il database non risponde. */
export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
  tuesday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
  wednesday: { lunch: { open: '', close: '' }, dinner: { open: '', close: '' }, isClosed: true },
  thursday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
  friday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
  saturday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
  sunday: { lunch: { open: '12:00', close: '14:00' }, dinner: { open: '19:00', close: '22:00' }, isClosed: false },
  notes: '',
};

export function normalizeOpeningHours(hours?: Partial<OpeningHours> | null): OpeningHours {
  const result = { notes: hours?.notes || '' } as OpeningHours;
  for (const key of DAY_KEYS) {
    const fallback = DEFAULT_OPENING_HOURS[key] as DaySchedule;
    const day = (hours?.[key] as DaySchedule | undefined) || fallback;
    result[key] = {
      isClosed: !!day.isClosed,
      lunch: { open: day.lunch?.open || '', close: day.lunch?.close || '' },
      dinner: { open: day.dinner?.open || '', close: day.dinner?.close || '' },
    } as any;
  }
  return result;
}

export interface DayRow {
  key: DayKey;
  label: string;
  isClosed: boolean;
  text: string;
}

function slot(s?: { open: string; close: string }): string {
  return s?.open && s?.close ? `${s.open}–${s.close}` : '';
}

export function dayRows(hours?: Partial<OpeningHours> | null): DayRow[] {
  const h = normalizeOpeningHours(hours);
  return DAY_KEYS.map((key) => {
    const d = h[key] as DaySchedule;
    const text = [slot(d.lunch), slot(d.dinner)].filter(Boolean).join(' · ');
    return { key, label: DAY_LABELS[key], isClosed: d.isClosed || !text, text };
  });
}

export interface HoursSummary {
  lunch: string;
  dinner: string;
  closedDays: string[];
  /** true se tutti i giorni aperti hanno gli stessi orari: si può mostrare il riassunto compatto. */
  isUniform: boolean;
}

/** Riassunto compatto per home e footer: "Pranzo 12:00–14:00 · Cena 19:00–22:00 · Mercoledì chiuso". */
export function summarizeHours(hours?: Partial<OpeningHours> | null): HoursSummary {
  const h = normalizeOpeningHours(hours);
  const open = DAY_KEYS.filter((k) => !(h[k] as DaySchedule).isClosed).map((k) => h[k] as DaySchedule);
  const first = open[0];
  const isUniform = open.every(
    (d) => slot(d.lunch) === slot(first?.lunch) && slot(d.dinner) === slot(first?.dinner)
  );
  return {
    lunch: slot(first?.lunch),
    dinner: slot(first?.dinner),
    closedDays: DAY_KEYS.filter((k) => (h[k] as DaySchedule).isClosed).map((k) => DAY_LABELS[k]),
    isUniform,
  };
}
