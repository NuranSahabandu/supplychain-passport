// Works out a certificate's status from its dates.
// The status is never stored: it depends on today's date, so it is calculated every time.

export const CERTIFICATE_STATUS = {
  NOT_YET_VALID: 'Not yet valid',
  NO_EXPIRY: 'No expiry provided',
  EXPIRED: 'Expired',
  VALID: 'Valid',
};

// Today's date in UTC, as 'YYYY-MM-DD'.
// e.g. new Date().toISOString() = '2026-10-12T08:30:00.000Z' → '2026-10-12'
export function todayUtc() {
  return new Date().toISOString().slice(0, 10);
}

// issuedAt and expiresAt are 'YYYY-MM-DD' strings (expiresAt may be null).
// Dates in this format can be compared as plain text: '2025-12-31' < '2026-01-01'.
// Both dates are inclusive: a certificate is still valid ON its expiry date.
export function getCertificateStatus(issuedAt, expiresAt, today = todayUtc()) {
  if (issuedAt > today) {
    return CERTIFICATE_STATUS.NOT_YET_VALID;
  }
  if (!expiresAt) {
    return CERTIFICATE_STATUS.NO_EXPIRY;
  }
  if (expiresAt < today) {
    return CERTIFICATE_STATUS.EXPIRED;
  }
  return CERTIFICATE_STATUS.VALID;
}

// Returns a copy of a certificate row with its calculated status added.
export function withStatus(certificate) {
  return {
    ...certificate,
    status: getCertificateStatus(certificate.issued_at, certificate.expires_at),
  };
}