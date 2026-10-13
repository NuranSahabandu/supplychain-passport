import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { formatDateTime } from '../utils/format.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function ProductListPage() {
  const { data: products, loading, error, reload } = useFetch('/products');
  const [search, setSearch] = useState('');

  // A success message passed by the previous page, e.g. after saving a product
  const location = useLocation();
  const successMessage = location.state?.message;

  return (
    <>
      <div className="page-header">
        <h1>Products</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          Add product
        </Link>
      </div>

      {successMessage && (
        <p className="alert alert-success" role="status">
          <strong>Done:</strong> {successMessage}
        </p>
      )}

      {loading && <LoadingState label="Loading products…" />}

      {error && <ErrorState error={error} onRetry={reload} />}

      {products && products.length === 0 && (
        <EmptyState
          title="No products yet"
          message="Add your first product to start building its supply chain and passport."
          action={
            <Link to="/admin/products/new" className="btn btn-primary">
              Add product
            </Link>
          }
        />
      )}

      {products && products.length > 0 && (
        <ProductTable products={products} search={search} onSearchChange={setSearch} />
      )}
    </>
  );
}

function ProductTable({ products, search, onSearchChange }) {
  // Simple search over name, SKU and category (optional bonus feature)
  const term = search.trim().toLowerCase();
  const visibleProducts = products.filter((product) =>
    [product.name, product.sku, product.category].some((text) => text.toLowerCase().includes(term))
  );

  return (
    <>
      <div className="field">
        <label htmlFor="product-search">Search products</label>
        <input
          id="product-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Name, SKU or category"
        />
      </div>

      {visibleProducts.length === 0 ? (
        <p className="muted">No products match “{search}”.</p>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">SKU</th>
                <th scope="col">Category</th>
                <th scope="col">Made in</th>
                <th scope="col">Passport</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <Link to={`/admin/products/${product.id}`}>{product.name}</Link>
                  </td>
                  <td>{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{product.manufacture_country}</td>
                  <td>
                    {product.published_at ? (
                      <>
                        <StatusBadge status="Published" />
                        <div className="muted">{formatDateTime(product.published_at)}</div>
                      </>
                    ) : (
                      <StatusBadge status="Draft" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}