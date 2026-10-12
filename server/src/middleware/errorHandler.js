import { HttpError } from '../utils/httpError.js';

// Runs when no route matched the URL.
export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Runs whenever any route throws an error. Every error response has the same shape:
// { message: '...', errors?: { field: ['...'] } }
// (Express knows this is an error handler because it has 4 parameters.)
export function errorHandler(err, req, res, next) {
  // Errors we threw on purpose (404, 422, 409, ...)
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message, errors: err.errors });
  }

  // The request body was not valid JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON' });
  }

  // Safety nets: database rules that our own checks should normally catch first
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with this value already exists' });
  }
  if (err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ message: 'This record is still used by other records' });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(422).json({ message: 'The data breaks a database rule' });
  }

  // Anything else is a bug: log the details for us, send a generic message to the client
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
}