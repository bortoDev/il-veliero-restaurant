/** Valore per <input type="datetime-local"> nell'ora locale (toISOString sposterebbe l'orario in UTC). */
export function toLocalDateTimeInput(value?: string | Date | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Valore per <input type="date"> nell'ora locale. */
export function toLocalDateInput(value?: string | Date | null): string {
  return toLocalDateTimeInput(value).slice(0, 10);
}

export function entityId(item: { id?: string; _id?: string }): string {
  return (item.id || item._id || '') as string;
}

export function formatDayLabel(value: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(value));
}

export function formatDateTimeLabel(value: string | Date): string {
  return new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
