import { NavLink, Outlet } from 'react-router-dom';

// TEMPORARY: replaced by the real layout in 5.5
export default function AdminLayout() {
  return (
    <div>
      <nav>
        <NavLink to="/admin/products">Products</NavLink> | <NavLink to="/admin/suppliers">Suppliers</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}