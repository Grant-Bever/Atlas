export function formatTimeTo12Hour(timeString) {
  if (!timeString || timeString === '-') {
    return '-'; // Return placeholder if no time
  }

  // Assuming timeString is in HH:MM format (24-hour)
  const [hours, minutes] = timeString.split(':');
  if (hours === undefined || minutes === undefined) {
      return timeString; // Return original if format is unexpected
  }

  const hoursInt = parseInt(hours, 10);
  const minutesInt = parseInt(minutes, 10);

  const ampm = hoursInt >= 12 ? 'PM' : 'AM';
  const hours12 = hoursInt % 12 || 12; // Convert hour 0 to 12

  return `${hours12}:${minutes.padStart(2, '0')} ${ampm}`;
} 