// Formatting helpers for showing dates to people.

// A full timestamp from the API ('2026-10-12T09:30:00Z') in the viewer's local time.
// e.g. "12 Oct 2026, 15:00" for a viewer in Sri Lanka
export function formatDateTime(isoTimestamp) {
  if (!isoTimestamp) {
    return '—';
  }
  return new Date(isoTimestamp).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// A calendar date from the API ('2027-12-31') as "31 Dec 2027".
// timeZone 'UTC' stops the browser from shifting it to the previous day.
export function formatDate(isoDate) {
  if (!isoDate) {
    return '—';
  }
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
}