// Shown when a list loaded fine but has nothing in it.
// `action` is optional: pass a button or link, e.g. "Add your first product".
export default function EmptyState({ title, message, action }) {
  return (
    <div className="card empty-state">
      <h2>{title}</h2>
      {message && <p className="muted">{message}</p>}
      {action}
    </div>
  );
}
