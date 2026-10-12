import { z } from 'zod';
import { validationError } from '../utils/httpError.js';

// Returns a middleware that checks req.body against a Zod schema.
// - Valid: replaces req.body with the cleaned data (trimmed, converted) and continues.
// - Invalid: stops with a 422 listing the problems per field.
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body ?? {});

    if (!result.success) {
      // e.g. { name: ['Name is required'], sku: ['SKU is required'] }
      const fieldErrors = z.flattenError(result.error).fieldErrors;
      throw validationError(fieldErrors);
    }

    req.body = result.data;
    next();
  };
}