import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

// PUBLIC_INTERFACE
export default function RegisterModal({ open, onClose }) {
  /** Accessible register modal with inline validation and password UX */
  const { login: doLogin, setIntendedPathIfUnset, intendedPath, completePostLoginRedirect } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [agree, setAgree] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const dialogRef = useRef(null);
  const firstFieldRef = useRef(null);
  const lastActiveElementRef = useRef(null);

  useEffect(() => {
    if (open) {
      lastActiveElementRef.current = document.activeElement;
      setIntendedPathIfUnset(window.location.pathname + window.location.search + window.location.hash);
      setTimeout(() => { firstFieldRef.current?.focus(); }, 0);
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
  const nameValid = useMemo(() => name.trim().length >= 2, [name]);

  const canSubmit = emailValid && pwdValid && nameValid && agree && !submitting;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      // Attempt real registration first
      const reg = await Api.register({ name, email, password });
      if (!reg.success) {
        // Backend not ready or failed – proceed to login which has built-in mock fallback
        const res = await Api.login({ email, password });
        if (res?.token) {
          doLogin(res.token, res.user || { email, name }, true);
          const redirectTo = intendedPath || '/';
          onClose?.();
          completePostLoginRedirect(redirectTo);
        } else {
          setError(reg.error || 'Registration failed');
        }
      } else {
        // Registration ok; login to get token
        const res = await Api.login({ email, password });
        if (res?.token) {
          doLogin(res.token, res.user || { email, name }, true);
          const redirectTo = intendedPath || '/';
          onClose?.();
          completePostLoginRedirect(redirectTo);
        } else {
          setError('Registration succeeded but auto-login failed');
        }
      }
    } catch (err) {
      setError(err?.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="register-title" aria-describedby="register-desc">
      <div className="modal" ref={dialogRef}>
        <div className="modal-header">
          <h3 id="register-title" className="m-0">Create your account</h3>
          <button className="btn outline" onClick={onClose} aria-label="Close register modal">Close</button>
        </div>
        <div className="modal-body">
          <p id="register-desc" className="text-muted m-0 mb-4">Join us for a better gourmet experience.</p>
          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            <label className="form-field">
              <span className="label">Name</span>
              <input
                ref={firstFieldRef}
                className={`input ${name && !nameValid ? 'input-error' : ''}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                aria-invalid={name ? String(!nameValid) : 'false'}
                aria-describedby="name-help"
                required
              />
              <small id="name-help" className="hint">
                {name && !nameValid ? 'Please enter at least 2 characters.' : 'This will appear on your profile.'}
              </small>
            </label>

            <label className="form-field">
              <span className="label">Email</span>
              <input
                className={`input ${email && !emailValid ? 'input-error' : ''}`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={email ? String(!emailValid) : 'false'}
                aria-describedby="reg-email-help"
                required
              />
              <small id="reg-email-help" className="hint">
                {email && !emailValid ? 'Enter a valid email like you@example.com' : 'We’ll send important updates here.'}
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
                  placeholder="At least 8 characters"
                  aria-invalid={password ? String(!pwdValid) : 'false'}
                  aria-describedby="reg-password-help"
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
              <small id="reg-password-help" className="hint">
                Use at least 8 characters with letters and numbers.
              </small>
            </label>

            <label className="form-checkbox">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>I agree to the Terms and Privacy Policy</span>
            </label>

            {error ? <div role="alert" className="form-error">{error}</div> : null}

            <button type="submit" className="btn" disabled={!canSubmit} aria-busy={submitting}>
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
