import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './AdminLayout.css';

// The frame around every admin page: top bar, demo warning, navigation and the page itself.
export default function AdminLayout() {
  // Only matters on small screens; on desktop the CSS always shows the sidebar.
  const [menuOpen, setMenuOpen] = useState(false);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="admin">
      <header className="topbar">
        <p className="topbar-title">
          SupplyChain Passport <span className="topbar-tag">Admin</span>
        </p>
        <button
          type="button"
          className="btn btn-secondary menu-button"
          aria-expanded={menuOpen}
          aria-controls="admin-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          Menu
        </button>
      </header>

      {/* Always visible: this app has no login, so it must never be put online */}
      <p className="demo-banner">
        <span aria-hidden="true">⚠ </span>
        Unsecured demo — no login. Run locally only; do not deploy publicly.
      </p>

      <div className="admin-body">
        <nav id="admin-nav" aria-label="Admin" className={menuOpen ? 'sidebar is-open' : 'sidebar'}>
          <ul>
            <li>
              <NavLink to="/admin/products" onClick={closeMenu}>
                Products
              </NavLink>
            </li>
            <li>
              <NavLink to="/admin/suppliers" onClick={closeMenu}>
                Suppliers
              </NavLink>
            </li>
          </ul>
        </nav>

        <main className="admin-main">
          <div className="admin-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
