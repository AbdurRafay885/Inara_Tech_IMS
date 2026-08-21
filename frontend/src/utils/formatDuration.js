export const formatDuration = (totalHours) => {
  const weeks = Math.floor(totalHours / 40);
  const remainingHoursAfterWeeks = totalHours % 40;
  const days = Math.floor(remainingHoursAfterWeeks / 8);
  const hours = remainingHoursAfterWeeks % 8;

  const parts = [];
  if (weeks > 0) parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
  if (days > 0) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours > 0 || parts.length === 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);

  return parts.join(' ');
};
