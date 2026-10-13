import { Link } from 'react-router-dom';

// Shown for any URL that doesn't match a page.
export default function NotFoundPage() {
  return (
    <div className="card public-not-found">
      <h1>Page not found</h1>
      <p className="muted">The page you were looking for doesn’t exist.</p>
      <Link to="/admin/products" className="btn btn-primary">
        Go to products
      </Link>
    </div>
  );
}