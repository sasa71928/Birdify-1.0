const timeFormatters = new Map<string, Intl.DateTimeFormat>();
const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const shortDateFormatters = new Map<string, Intl.DateTimeFormat>();
const weekdayFormatters = new Map<string, Intl.DateTimeFormat>();

function getTimeFormatter(locale = 'es-ES'): Intl.DateTimeFormat {
  let formatter = timeFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' });
    timeFormatters.set(locale, formatter);
  }
  return formatter;
}

function getDateFormatter(locale = 'es-ES'): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    dateFormatters.set(locale, formatter);
  }
  return formatter;
}

function getShortDateFormatter(locale = 'es-ES'): Intl.DateTimeFormat {
  let formatter = shortDateFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: '2-digit' });
    shortDateFormatters.set(locale, formatter);
  }
  return formatter;
}

function getWeekdayFormatter(locale = 'es-ES'): Intl.DateTimeFormat {
  let formatter = weekdayFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    weekdayFormatters.set(locale, formatter);
  }
  return formatter;
}

export function formatMessageTime(dateStr?: string | null, locale = 'es-ES'): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return getTimeFormatter(locale).format(d);
  } catch {
    return '';
  }
}

export function formatDayLabel(
  dateStr: string,
  locale = 'es-ES',
  labels = { today: 'Hoy', yesterday: 'Ayer' }
): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return labels.today;
    if (diffDays === 1) return labels.yesterday;

    return getDateFormatter(locale).format(date);
  } catch {
    return dateStr;
  }
}

export function formatThreadTime(
  dateStr?: string | null,
  locale = 'es-ES',
  labels = { today: 'Hoy', yesterday: 'Ayer' }
): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return getTimeFormatter(locale).format(date);
    }
    if (diffDays === 1) {
      return labels.yesterday;
    }
    if (diffDays < 7) {
      return getWeekdayFormatter(locale).format(date);
    }
    return getShortDateFormatter(locale).format(date);
  } catch {
    return '';
  }
}

