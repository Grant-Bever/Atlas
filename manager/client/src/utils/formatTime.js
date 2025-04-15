/**
 * Converts a 24-hour time string (HH:mm) to a 12-hour AM/PM format.
 * Returns the original string if it doesn't match the format or is invalid.
 * @param {string} timeString - The time string in HH:mm format.
 * @returns {string} The formatted time string (e.g., "05:00 PM") or the original string.
 */
export const formatTimeTo12Hour = (timeString) => {
  if (!timeString || typeof timeString !== 'string' || !timeString.includes(':')) {
    return timeString; // Return original if invalid or not a time string
  }

  const parts = timeString.split(':');
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);

  if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return timeString; // Return original if invalid time parts
  }

  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12; // Convert hour to 12-hour format (0 becomes 12)
  const minuteFormatted = minute < 10 ? `0${minute}` : minute; // Add leading zero to minutes
  const hourFormatted = hour12 < 10 ? `0${hour12}` : hour12; // Add leading zero to hour

  return `${hourFormatted}:${minuteFormatted} ${ampm}`;
}; 