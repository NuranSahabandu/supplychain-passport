import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getCertificateStatus } from '../src/utils/certificateStatus.js';

// We pass a fixed "today" so the tests give the same result on any day.
const today = '2026-10-12';

test('valid when today is between issue and expiry', () => {
  assert.equal(getCertificateStatus('2026-01-01', '2027-12-31', today), 'Valid');
});

test('expired when expiry date is before today (AT-04)', () => {
  assert.equal(getCertificateStatus('2024-01-01', '2025-12-31', today), 'Expired');
});

test('not yet valid when issue date is in the future (AT-05)', () => {
  assert.equal(getCertificateStatus('2027-01-01', '2028-01-01', today), 'Not yet valid');
});

test('no expiry provided when expiry date is missing', () => {
  assert.equal(getCertificateStatus('2026-01-01', null, today), 'No expiry provided');
});

test('still valid ON the expiry date (inclusive)', () => {
  assert.equal(getCertificateStatus('2026-01-01', today, today), 'Valid');
});

test('valid ON the issue date (inclusive)', () => {
  assert.equal(getCertificateStatus(today, '2027-01-01', today), 'Valid');
});

test('expired the day after the expiry date', () => {
  assert.equal(getCertificateStatus('2026-01-01', '2026-10-11', today), 'Expired');
});

test('future issue date wins even with no expiry', () => {
  assert.equal(getCertificateStatus('2027-01-01', null, today), 'Not yet valid');
});