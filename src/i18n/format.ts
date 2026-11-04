import { translate, getCurrentLocale } from './LanguageContext';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

function toDate(input: Date | string | number | null | undefined): Date | null {
  if (input == null) return null;
  const d = input instanceof Date ? input : new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Tiempo relativo localizado: "Hace 3 horas" / "3 hours ago".
 * Los componentes que lo usan deben consumir `useT()` para re-renderizar al cambiar idioma.
 */
export function formatTimeAgo(input: Date | string | number | null | undefined): string {
  const date = toDate(input);
  if (!date) return '';
  const diff = Math.max(0, Date.now() - date.getTime());

  if (diff < MINUTE) return translate('time.justNow');
  if (diff < HOUR) {
    const n = Math.floor(diff / MINUTE);
    return n === 1 ? translate('time.minuteAgo') : translate('time.minutesAgo', { count: n });
  }
  if (diff < DAY) {
    const n = Math.floor(diff / HOUR);
    return n === 1 ? translate('time.hourAgo') : translate('time.hoursAgo', { count: n });
  }
  if (diff < WEEK) {
    const n = Math.floor(diff / DAY);
    return n === 1 ? translate('time.dayAgo') : translate('time.daysAgo', { count: n });
  }
  if (diff < MONTH) {
    const n = Math.floor(diff / WEEK);
    return n === 1 ? translate('time.weekAgo') : translate('time.weeksAgo', { count: n });
  }
  if (diff < YEAR) {
    const n = Math.floor(diff / MONTH);
    return n === 1 ? translate('time.monthAgo') : translate('time.monthsAgo', { count: n });
  }
  const n = Math.floor(diff / YEAR);
  return n === 1 ? translate('time.yearAgo') : translate('time.yearsAgo', { count: n });
}

/** Fecha localizada (por defecto: "3 nov 2026" / "Nov 3, 2026"). */
export function formatDate(
  input: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
): string {
  const date = toDate(input);
  if (!date) return '';
  try {
    return date.toLocaleDateString(getCurrentLocale(), options);
  } catch {
    return date.toLocaleDateString();
  }
}

/** Conteos compactos: 1234 → "1.2K" (en) / "1,2 mil" (es). */
export function formatCount(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const locale = getCurrentLocale();
  const abs = Math.abs(value);
  const fmt = (n: number) =>
    n.toLocaleString(locale, { maximumFractionDigits: n < 10 ? 1 : 0 });
  if (abs >= 1_000_000) return `${fmt(value / 1_000_000)}${translate('time.millionSuffix')}`;
  if (abs >= 10_000) return `${fmt(value / 1_000)}${translate('time.thousandSuffix')}`;
  return value.toLocaleString(locale);
}

