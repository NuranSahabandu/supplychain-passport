import { useFetch } from '../hooks/useFetch.js';

// TEMPORARY version: proves the API client and useFetch work.
// The real product list is built in Step 6.
export default function ProductListPage() {
  const { data: products, loading, error, reload } = useFetch('/products');

  if (loading) {
    return <p>Loading products…</p>;
  }

  if (error) {
    return (
      <div>
        <p>Could not load products: {error.message}</p>
        <button type="button" onClick={reload}>Try again</button>
      </div>
    );
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