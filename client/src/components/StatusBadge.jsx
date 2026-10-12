// Colour tone and symbol for each status. The status text is always shown too,
// so the meaning never depends on colour alone.
const BADGE_STYLES = {
  Valid: { tone: 'success', symbol: '✓' },
  Published: { tone: 'success', symbol: '✓' },
  Expired: { tone: 'danger', symbol: '✕' },
  'Not yet valid': { tone: 'warning', symbol: '!' },
  'No expiry provided': { tone: 'warning', symbol: '!' },
  Draft: { tone: 'neutral', symbol: '•' },
};

// Anything we don't recognise is shown as a plain grey badge rather than breaking
const DEFAULT_STYLE = { tone: 'neutral', symbol: '•' };

export default function StatusBadge({ status }) {
  const { tone, symbol } = BADGE_STYLES[status] ?? DEFAULT_STYLE;

  return (
    <span className={`badge badge-${tone}`}>
      <span aria-hidden="true">{symbol}</span>
      {status}
    </span>
  );
}
