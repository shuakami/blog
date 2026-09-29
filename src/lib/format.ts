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

const ROMAN: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

export function toRoman(n: number) {
  let rest = Math.floor(n);
  let out = '';
  for (const [value, glyph] of ROMAN) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

const ONES = ['nought', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/* Numbers the old way: "five and twenty". Falls back to digits past ninety-nine. */
export function toOldWords(n: number) {
  if (n < 20) return ONES[n];
  if (n > 99) return n.toLocaleString('en-US');
  const tens = TENS[Math.floor(n / 10)];
  const ones = n % 10;
  return ones === 0 ? tens : `${ONES[ones]} and ${tens}`;
}

function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

const MONTH = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'Asia/Shanghai' });
const PARTS = new Intl.DateTimeFormat('en-US', { year: 'numeric', day: 'numeric', timeZone: 'Asia/Shanghai' });

/* "The 27th of July, MMXXVI" */
export function formatFolioDate(input: string | Date) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  const parts = PARTS.formatToParts(date);
  const day = Number(parts.find((p) => p.type === 'day')?.value);
  const year = Number(parts.find((p) => p.type === 'year')?.value);
  return `The ${ordinal(day)} of ${MONTH.format(date)}, ${year}`;
}
