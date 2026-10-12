import { z } from 'zod';

// Reusable building blocks for every validator in the app.

// A required piece of text: trims spaces, must not be empty, has a max length.
export const requiredText = (label, max) =>
  z
    .string({ error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`);

// An optional piece of text: empty or missing becomes null.
export const optionalText = (label, max) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .nullish()
    .transform((value) => value || null);

// An optional URL: empty or missing becomes null; otherwise it must be a valid http(s) URL.
export const optionalUrl = (label) =>
  z
    .string()
    .trim()
    .max(500, `${label} must be at most 500 characters`)
    .refine((value) => value === '' || /^https?:\/\/\S+$/i.test(value), {
      message: `${label} must be a valid URL starting with http:// or https://`,
    })
    .nullish()
    .transform((value) => value || null);

// A required calendar date in YYYY-MM-DD format (rejects impossible dates like 2026-02-30).
export const requiredDate = (label) =>
  z.iso.date({ error: `${label} is required and must be a valid date (YYYY-MM-DD)` });

// An optional calendar date: empty or missing becomes null.
export const optionalDate = (label) =>
  z
    .union([z.iso.date({ error: `${label} must be a valid date (YYYY-MM-DD)` }), z.literal('')])
    .nullish()
    .transform((value) => value || null);