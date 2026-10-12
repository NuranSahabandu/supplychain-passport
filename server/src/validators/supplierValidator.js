import { z } from 'zod';
import { requiredText, optionalText } from './common.js';

export const supplierSchema = z.object({
  name: requiredText('Name', 150),
  country: requiredText('Country', 100),
  location: optionalText('Location', 150),
  contact: optionalText('Contact', 255),
});
