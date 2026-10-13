import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import PassportView from '../components/PassportView.jsx';

// The customer-facing passport at /passport/:sku. No login, read-only.
// It only ever calls the public endpoint, which reads the published snapshot.
export default function PublicPassportPage() {
  const { sku } = useParams();
  const { data, loading, error, reload } = useFetch(`/public/passports/${encodeURIComponent(sku)}`);

  // Show the product name in the browser tab once it has loaded
  useEffect(() => {
    document.title = data ? `${data.product.name} – Product Passport` : 'Product Passport';
  }, [data]);

  return (
    <div className="public-page">
      <header className="public-header">
        <span className="public-brand">SupplyChain Passport</span>
        <span className="public-tag">Product Passport</span>
      </header>

      <main className="public-main">
        {loading && <LoadingState label="Loading passport…" />}

        {/* 404 = unknown SKU OR not published. Same friendly message for both, no details. */}
        {error && error.status === 404 && <PassportNotFound sku={sku} />}

        {/* Anything else (server down, network) can be retried */}
        {error && error.status !== 404 && <ErrorState error={error} onRetry={reload} />}

        {data && <PassportView passport={data} publishedAt={data.published_at} />}
      </main>
    </div>
  );
}

function PassportNotFound({ sku }) {
  return (
    <div className="card public-not-found">
      <h1>Passport not available</h1>
      <p>
        We couldn’t find a published passport for <strong>{sku}</strong>.
      </p>
      <p className="muted">
        Check the link or the code on the product label. The product may not have a public passport yet.
      </p>
    </div>
  );
}