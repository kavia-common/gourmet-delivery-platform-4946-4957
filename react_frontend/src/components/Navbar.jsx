import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { items, openCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand" aria-label="Gourmet Delivery Home">
          <span className="dot" />
          Gourmet
          <span style={{ color: 'var(--primary)' }}>Delivery</span>
        </Link>

        <div className="nav-actions">
          <NavLink to="/" className="btn outline" aria-label="Browse restaurants">Browse</NavLink>
          <button className="btn secondary" onClick={openCart} aria-label={`Open cart with ${count} items`}>
            Cart • {count}
          </button>
          {user ? (
            <button
              className="btn"
              onClick={() => { logout(); navigate('/'); }}
              aria-label="Logout"
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" className="btn" aria-label="Login">Login</NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
