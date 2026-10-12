// Shown while a page waits for the API.
// role="status" makes screen readers announce the label without moving focus.
export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="loading-state" role="status">
      <span className="spinner" aria-hidden="true"></span>
      <span>{label}</span>
    </div>
  );
}
