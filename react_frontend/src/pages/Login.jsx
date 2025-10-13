import React, { useState } from 'react';
import LoginModal from '../components/auth/LoginModal';

export default function Login() {
  /** Dedicated page which reuses LoginModal component */
  const [open, setOpen] = useState(true);
  return (
    <div className="container page" style={{ maxWidth: 520 }}>
      <div className="card" style={{ padding: 16 }}>
        <h2 className="title">Login</h2>
        <p className="text-muted m-0 mb-4">For best experience, use the modal. This page opens it automatically.</p>
        <button className="btn" onClick={() => setOpen(true)}>Open Login</button>
      </div>
      <LoginModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
