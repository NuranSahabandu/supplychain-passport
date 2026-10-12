// One place for every call to our Express API.
// It always returns the parsed JSON, or throws an ApiError with a readable message.

export class ApiError extends Error {
  constructor(status, message, fieldErrors = {}) {
    super(message);
    this.status = status; // HTTP status code (0 = the server could not be reached)
    this.fieldErrors = fieldErrors; // e.g. { sku: ['SKU "EGP-1001" is already used...'] }
  }
}

async function request(method, path, body) {
  let response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // fetch only throws when there is no answer at all (server down, no network)
    throw new ApiError(0, 'Cannot reach the server. Check that the API is running.');
  }

  // 204 No Content (e.g. after a delete): success, but nothing to read
  if (response.status === 204) {
    return null;
  }

  // Our API always answers with JSON; if it somehow doesn't, use null
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Our errorHandler always sends { message, errors? }
    throw new ApiError(
      response.status,
      data?.message ?? `Request failed with status ${response.status}`,
      data?.errors ?? {}
    );
  }

  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};