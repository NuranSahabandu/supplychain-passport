import { z } from 'zod';
import { requiredText, optionalUrl } from './common.js';

export const productSchema = z.object({
  name: requiredText('Name', 150),
  sku: requiredText('SKU', 50)
    .regex(/^[A-Za-z0-9-]+$/, 'SKU may only contain letters, numbers and dashes')
    .transform((sku) => sku.toUpperCase()), // store SKUs in one consistent form
  category: requiredText('Category', 100),
  description: requiredText('Description', 5000),
  primary_material: requiredText('Primary material', 150),
  manufacture_country: requiredText('Country of manufacture', 100),
  image_url: optionalUrl('Image URL'),
});