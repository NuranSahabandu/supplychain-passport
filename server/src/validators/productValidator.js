import { z } from 'zod';

// A required piece of text: trims spaces, must not be empty, has a max length.
const requiredText = (label, max) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

// An optional URL: empty or missing becomes null; otherwise it must be a valid http(s) URL.
const optionalUrl = (label) =>
  z
    .string()
    .trim()
    .max(500, `${label} must be at most 500 characters`)
    .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), {
      message: `${label} must be a valid URL starting with http:// or https://`,
    })
    .nullish()
    .transform((value) => value || null);

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