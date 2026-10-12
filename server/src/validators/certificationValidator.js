import { z } from 'zod';
import { requiredText, optionalUrl, requiredDate, optionalDate } from './common.js';

export const certificationSchema = z
  .object({
    name: requiredText('Certification name', 150),
    issuer: requiredText('Issuer', 150),
    certificate_number: requiredText('Certificate number', 100),
    issued_at: requiredDate('Issue date'),
    expires_at: optionalDate('Expiry date'),
    evidence_url: optionalUrl('Evidence URL'),
  })
  // A rule that compares two fields, so it goes on the whole object (AT-06)
  .refine(
    (cert) => !cert.expires_at || cert.expires_at >= cert.issued_at,
    {
      message: 'Expiry date cannot be earlier than the issue date',
      path: ['expires_at'], // show the error under the expiry field
    }
  );