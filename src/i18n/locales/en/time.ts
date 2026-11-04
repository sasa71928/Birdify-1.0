import type { time as esTime } from '../es/time';

export const time: typeof esTime = {
  justNow: 'Just now',
  minuteAgo: '1 minute ago',
  minutesAgo: '{count} minutes ago',
  hourAgo: '1 hour ago',
  hoursAgo: '{count} hours ago',
  dayAgo: '1 day ago',
  daysAgo: '{count} days ago',
  weekAgo: '1 week ago',
  weeksAgo: '{count} weeks ago',
  monthAgo: '1 month ago',
  monthsAgo: '{count} months ago',
  yearAgo: '1 year ago',
  yearsAgo: '{count} years ago',
  thousandSuffix: 'K',
  millionSuffix: 'M',
};

