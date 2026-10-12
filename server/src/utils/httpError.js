// An Error that also carries an HTTP status code (and optional field errors).
// Throw it anywhere in a controller; the error handler turns it into a JSON response.
export class HttpError extends Error {
  constructor(status, message, errors = undefined) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// Shortcuts for the two errors we use most
export const notFound = (message = 'Resource not found') => new HttpError(404, message);

export const validationError = (errors) =>
  new HttpError(422, 'Validation failed', errors);