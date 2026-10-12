import { useFetch } from '../hooks/useFetch.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

// TEMPORARY version: proves the API client and useFetch work.
// The real product list is built in Step 6.
export default function ProductListPage() {
  const { data: products, loading, error, reload } = useFetch('/products');

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={reload} />;
  }

  return (
    <div>
      <h1>Products</h1>
      <p>{products.length} product(s) loaded from the API:</p>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} ({product.sku})
          </li>
        ))}
      </ul>
    </div>
  );
}