// MySQL returns timestamps as text like '2026-10-12 09:30:00' (in UTC, see knexfile.js).
// This turns them into the standard ISO format '2026-10-12T09:30:00Z', which every
// browser understands and converts to the viewer's own local time.
export function toIsoUtc(mysqlTimestamp) {
  if (!mysqlTimestamp) {
    return null;
  }
  return mysqlTimestamp.replace(' ', 'T') + 'Z';
}