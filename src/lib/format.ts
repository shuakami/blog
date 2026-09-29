const SHORT = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', timeZone: 'Asia/Shanghai' });
const LONG = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Shanghai' });

export function formatShortDate(input: string | Date) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return SHORT.format(date);
}

export function formatLongDate(input: string | Date) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return LONG.format(date);
}

export function formatIsoDate(input: string | Date) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}.${m}.${d}`;
}

export function yearOf(input: string | Date) {
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? '' : String(date.getFullYear());
}
