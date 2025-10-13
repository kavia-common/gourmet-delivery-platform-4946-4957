import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';

export default function Navbar() {
  const { items, openCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const count = items.reduce((n, i) => n + i.qty, 0);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const initials = (user?.name || user?.email || '')
    .split('@')[0]
    .split(' ')
    .map(s => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
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
              <div className="auth-menu" ref={menuRef} style={{ position: 'relative' }}>
                <button
                  className="btn outline"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(o => !o)}
                >
                  <span className="avatar">{initials || 'U'}</span>
                </button>
                {menuOpen && (
                  <div className="menu-dropdown surface" role="menu" aria-label="Account menu">
                    <button className="menu-item" role="menuitem" onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                      Profile
                    </button>
                    <button className="menu-item" role="menuitem" onClick={() => { setMenuOpen(false); navigate('/orders'); }}>
                      Orders
                    </button>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                    <button
                      className="menu-item"
                      role="menuitem"
                      onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn outline" onClick={() => setShowLogin(true)} aria-label="Open login">Log in</button>
                <button className="btn" onClick={() => setShowRegister(true)} aria-label="Open sign up">Sign up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
      <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} />
    </>
  );
}
