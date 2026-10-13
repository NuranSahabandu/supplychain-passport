import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useFetch } from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import OverviewTab from './product-tabs/OverviewTab.jsx';
import SupplyChainTab from './product-tabs/SupplyChainTab.jsx';
import CertificationsTab from './product-tabs/CertificationsTab.jsx';
import PassportTab from './product-tabs/PassportTab.jsx';

// The four sections of a product. The active one is kept in the URL (?tab=...),
// so refreshing the page or pressing Back keeps you on the same section.
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'supply-chain', label: 'Supply chain' },
  { key: 'certifications', label: 'Certifications' },
  { key: 'passport', label: 'Passport' },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const { data: product, loading, error, reload, setData } = useFetch(`/products/${id}`);

  if (loading) return <LoadingState label="Loading product…" />;
  if (error) return <ErrorState error={error} onRetry={error.status === 404 ? undefined : reload} />;

  return <ProductDetail product={product} onProductChange={setData} onReload={reload} />;
}

function ProductDetail({ product, onProductChange, onReload }) {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const [searchParams] = useSearchParams();
  const activeTab = TABS.some((tab) => tab.key === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'overview';

  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${product.name}"? Its stages, certificates and published passport will also be deleted. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/products/${product.id}`);
      navigate('/admin/products', { state: { message: `“${product.name}” was deleted.` } });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <>
      <p>
        <Link to="/admin/products">← All products</Link>
      </p>

      <div className="page-header">
        <div>
          <h1>{product.name}</h1>
          <p className="muted">
            SKU {product.sku} · {product.category}
          </p>
        </div>
        <div className="form-actions">
          <Link to={`/admin/products/${product.id}/edit`} className="btn btn-secondary">
            Edit
          </Link>
          <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>

      {successMessage && (
        <p className="alert alert-success" role="status">
          <strong>Done:</strong> {successMessage}
        </p>
      )}
      {deleteError && (
        <p className="alert alert-error" role="alert">
          <strong>Not deleted:</strong> {deleteError}
        </p>
      )}

      {/* Section navigation: plain links that change ?tab=..., marked with aria-current */}
      <nav className="tabs" aria-label="Product sections">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            to={`?tab=${tab.key}`}
            replace
            className={tab.key === activeTab ? 'tab is-active' : 'tab'}
            aria-current={tab.key === activeTab ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <section aria-label={TABS.find((tab) => tab.key === activeTab).label}>
        {activeTab === 'overview' && <OverviewTab product={product} />}
        {activeTab === 'supply-chain' && <SupplyChainTab product={product} onProductChange={onProductChange} />}
        {activeTab === 'certifications' && <CertificationsTab product={product} onReload={onReload} />}
        {activeTab === 'passport' && <PassportTab product={product} />}
      </section>
    </>
  );
}