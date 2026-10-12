import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout.jsx';
import ProductListPage from './pages/ProductListPage.jsx';
import ProductFormPage from './pages/ProductFormPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import SupplierListPage from './pages/SupplierListPage.jsx';
import PublicPassportPage from './pages/PublicPassportPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Every page of the app and the URL that shows it.
export default function App() {
  return (
    <Routes>
      {/* Opening the site goes straight to the admin product list */}
      <Route path="/" element={<Navigate to="/admin/products" replace />} />

      {/* Admin pages share the sidebar layout; <Outlet /> inside it shows the page */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="products" replace />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="products/new" element={<ProductFormPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="products/:id/edit" element={<ProductFormPage />} />
        <Route path="suppliers" element={<SupplierListPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      {/* The public passport has no admin layout and needs no login */}
      <Route path="/passport/:sku" element={<PublicPassportPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}