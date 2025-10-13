import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function LoginModal({ open, onClose, defaultEmail = '' }) {
  /** Accessible login modal with inline validation, remember-me, and password UX */
  const { login: doLogin, setIntendedPathIfUnset, intendedPath, completePostLoginRedirect } = useAuth();
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  useEffect(() => {
    if (open) {
      lastActiveElementRef.current = document.activeElement;
      // capture intended path to return to, if not set yet
      setIntendedPathIfUnset(window.location.pathname + window.location.search + window.location.hash);
      setTimeout(() => {
        if (firstFieldRef.current) firstFieldRef.current.focus();
      }, 0);
    } else if (lastActiveElementRef.current) {
      lastActiveElementRef.current.focus();
    }
  }, [open, setIntendedPathIfUnset]);

  useEffect(() => {
    function onKey(e) {
      if (!open) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === 'Tab' && dialogRef.current) {
        // simple focus trap
        const focusable = dialogRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const emailValid = useMemo(() => /\S+@\S+\.\S+/.test(email), [email]);
  const pwdValid = useMemo(() => {
    if (password.length < 8) return false;
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
  }, [password]);

  const pwdStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  }, [password]);

  const canSubmit = emailValid && pwdValid && !submitting;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await Api.login({ email, password });
      if (res?.token) {
        // Persist via AuthContext
        doLogin(res.token, res.user || { email }, remember);
        // redirect back to intended path if any
        const redirectTo = intendedPath || '/';
        onClose?.();
        completePostLoginRedirect(redirectTo);
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError(err?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="login-title" aria-describedby="login-desc">
      <div className="modal" ref={dialogRef}>
        <div className="modal-header">
          <h3 id="login-title" className="m-0">Welcome back</h3>
          <button className="btn outline" onClick={onClose} ref={closeBtnRef} aria-label="Close login modal">Close</button>
        </div>
        <div className="modal-body">
          <p id="login-desc" className="text-muted m-0 mb-4">Sign in to continue your gourmet journey.</p>
          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <label className="form-field">
              <span className="label">Email</span>
              <input
                ref={firstFieldRef}
                className={`input ${email && !emailValid ? 'input-error' : ''}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={email ? String(!emailValid) : 'false'}
                aria-describedby="email-help"
                required
              />
              <small id="email-help" className="hint">
                {email && !emailValid ? 'Enter a valid email like you@example.com' : 'We’ll use this to sign you in.'}
              </small>
            </label>

            <label className="form-field">
              <span className="label">Password</span>
              <div className={`password-wrap ${password && !pwdValid ? 'input-error' : ''}`}>
                <input
                  className="input password-input"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your secure password"
                  aria-invalid={password ? String(!pwdValid) : 'false'}
                  aria-describedby="password-help password-strength"
                  required
                />
                <button
                  type="button"
                  className="btn outline eye-btn"
                  onClick={() => setShowPwd(s => !s)}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? 'Hide' : 'Show'}
                </button>
              </div>
              <small id="password-help" className="hint">
                Use at least 8 characters with letters and numbers.
              </small>
              <div id="password-strength" className="strength">
                <div className={`bar ${pwdStrength >= 1 ? 'on' : ''}`}></div>
                <div className={`bar ${pwdStrength >= 2 ? 'on' : ''}`}></div>
                <div className={`bar ${pwdStrength >= 3 ? 'on' : ''}`}></div>
                <div className={`bar ${pwdStrength >= 4 ? 'on' : ''}`}></div>
                <div className={`bar ${pwdStrength >= 5 ? 'on' : ''}`}></div>
                <span className="strength-label">
                  {password.length === 0 ? '' : pwdStrength <= 2 ? 'Weak' : pwdStrength === 3 ? 'Fair' : 'Strong'}
                </span>
              </div>
            </label>

            <label className="form-checkbox">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Remember me on this device</span>
            </label>

            {error ? <div role="alert" className="form-error">{error}</div> : null}

            <button type="submit" className="btn" disabled={!canSubmit} aria-busy={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
