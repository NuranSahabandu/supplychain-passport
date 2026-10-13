import { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../../api/client.js';
import { useFetch } from '../../hooks/useFetch.js';
import { formatDateTime } from '../../utils/format.js';
import LoadingState from '../../components/LoadingState.jsx';
import ErrorState from '../../components/ErrorState.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import PassportView from '../../components/PassportView.jsx';

// Preview the passport built from the current (draft) data, publish it,
// and share the public link. The preview is loaded fresh every time the tab opens.
export default function PassportTab({ product }) {
  const { data, loading, error, reload, setData } = useFetch(`/products/${product.id}/passport-preview`);

  const [publishing, setPublishing] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [publishError, setPublishError] = useState(null);

  async function handlePublish() {
    setPublishing(true);
    setSuccessMessage(null);
    setPublishError(null);
    try {
      // The server answers with the new publication info (published_at, link, ...)
      const publication = await api.post(`/products/${product.id}/publish`);
      setData({ ...data, publication });
      setSuccessMessage('Published. The public passport now shows this version.');
    } catch (err) {
      setPublishError(err.message);
    } finally {
      setPublishing(false);
    }
  }

  if (loading) return <LoadingState label="Building passport preview…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const { publication, passport } = data;

  return (
    <>
      <div className="card publish-panel">
        <div className="page-header">
          <div>
            <h2>Passport</h2>
            <p>
              <StatusBadge status={publication.is_published ? 'Published' : 'Draft'} />{' '}
              {publication.is_published
                ? `Last published ${formatDateTime(publication.published_at)}`
                : 'Not published yet: customers cannot see this product.'}
            </p>
          </div>
          <button type="button" className="btn btn-primary" onClick={handlePublish} disabled={publishing}>
            {publishing ? 'Publishing…' : publication.is_published ? 'Republish' : 'Publish'}
          </button>
        </div>

        {successMessage && (
          <p className="alert alert-success" role="status">
            <strong>Done:</strong> {successMessage}
          </p>
        )}
        {publishError && (
          <p className="alert alert-error" role="alert">
            <strong>Not published:</strong> {publishError}
          </p>
        )}

        {publication.is_published && publication.has_unpublished_changes && (
          <p className="notice" role="note">
            <strong>Unpublished changes:</strong> the preview below differs from the public passport.
            Republish to make these changes public.
          </p>
        )}
        {publication.is_published && !publication.has_unpublished_changes && (
          <p className="muted">The public passport is up to date with the data below.</p>
        )}

        {publication.is_published && <PublicLink path={publication.public_path} />}
      </div>

      <h2>Preview</h2>
      <p className="muted">This is exactly what customers will see after you publish.</p>
      <PassportView passport={passport} publishedAt={null} />
    </>
  );
}

// The shareable public URL, with Copy and Open buttons and a QR code of the same URL.
function PublicLink({ path }) {
  const url = `${window.location.origin}${path}`;
  const sku = decodeURIComponent(path.split('/').pop()); // path is '/passport/EGP-1001'
  const [copyMessage, setCopyMessage] = useState('');
  const qrRef = useRef(null); // the QR's <svg> element, needed for the download

  // Save the QR exactly as drawn: turn the <svg> into text, wrap it in a file,
  // and click a temporary download link pointing at that file.
  function downloadQrCode() {
    const svgText = new XMLSerializer().serializeToString(qrRef.current);
    const fileUrl = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));

    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `passport-${sku}.svg`;
    link.click();

    URL.revokeObjectURL(fileUrl); // free the memory; the download has already started
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyMessage('Link copied.');
    } catch {
      // Clipboard access can be blocked by the browser; the link is still selectable
      setCopyMessage('Could not copy automatically. Select the link and copy it.');
    }
  }

  return (
    <div className="field">
      <label htmlFor="public-link">Public passport link</label>
      <div className="public-link">
        <input id="public-link" type="text" value={url} readOnly onFocus={(event) => event.target.select()} />
        <button type="button" className="btn btn-secondary" onClick={copyLink}>
          Copy
        </button>
        <a href={path} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
          Open<span className="visually-hidden"> public passport in a new tab</span>
        </a>
      </div>
      {/* aria-live makes screen readers announce the message when it appears */}
      <p className="field-hint" aria-live="polite">
        {copyMessage}
      </p>

      {/* Dark-on-white with a 4-module quiet zone (marginSize) so phone cameras can read it */}
      <figure className="qr-code">
        <QRCodeSVG
          ref={qrRef}
          value={url}
          size={160}
          bgColor="#FFFFFF"
          fgColor="#2E1E46"
          marginSize={4}
          role="img"
          aria-label={`QR code linking to the public passport for ${sku}`}
        />
        <figcaption>Scan to open the public passport</figcaption>
        <button type="button" className="btn btn-secondary btn-small" onClick={downloadQrCode}>
          Download QR code
        </button>
      </figure>
    </div>
  );
}