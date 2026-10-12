// Shown when loading failed. role="alert" makes screen readers read it out straight away.
// The "Try again" button only appears when the page gives us something to retry.
export default function ErrorState({ error, onRetry }) {
  return (
    <div className="alert alert-error" role="alert">
      <p>
        <strong>Error:</strong> {error.message}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
