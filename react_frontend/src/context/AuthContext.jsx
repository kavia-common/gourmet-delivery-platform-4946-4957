import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

/** Storage keys */
const AUTH_KEY = 'auth';
const AUTH_STORE = 'auth_store'; // 'local' or 'session'
const INTENDED_PATH = 'auth_intended_path';

// PUBLIC_INTERFACE
export const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context */
  return useContext(AuthContext);
}

/** Helpers to pick storage based on remember flag */
function getStorage() {
  const store = (localStorage.getItem(AUTH_STORE) || 'local');
  return store === 'session' ? sessionStorage : localStorage;
}
function setStoragePreference(remember) {
  localStorage.setItem(AUTH_STORE, remember ? 'local' : 'session');
}
function readAuthFromStorage() {
  const storePref = localStorage.getItem(AUTH_STORE) || 'local';
  const store = storePref === 'session' ? sessionStorage : localStorage;
  const saved = store.getItem(AUTH_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return { token: parsed?.token || null, user: parsed?.user || null };
    } catch {
      return { token: null, user: null };
    }
  }
  return { token: null, user: null };
}
function writeAuthToStorage(token, user) {
  const store = getStorage();
  store.setItem(AUTH_KEY, JSON.stringify({ token, user }));
}
function clearAuthStorage() {
  try { localStorage.removeItem(AUTH_KEY); } catch {}
  try { sessionStorage.removeItem(AUTH_KEY); } catch {}
}

/** Intended path helpers */
function getIntendedPath() {
  return sessionStorage.getItem(INTENDED_PATH) || '';
}
function setIntendedPath(path) {
  if (!path) return;
  sessionStorage.setItem(INTENDED_PATH, path);
}
function clearIntendedPath() {
  sessionStorage.removeItem(INTENDED_PATH);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /**
   * Provides auth state and utilities:
   * - isAuthenticated, token, user
   * - login(email,password,remember) [handled via component calling APIs, this stores based on remember]
   * - register(payload) [caller handles API; on success uses login persist]
   * - logout()
   * - intendedPath management and post-login redirect helper
   */
  const [{ token, user }, setAuth] = useState(() => readAuthFromStorage());
  const [intendedPath, setIntendedPathState] = useState(getIntendedPath());

  // Hydrate from whichever storage holds current auth
  useEffect(() => {
    const { token: t, user: u } = readAuthFromStorage();
    setAuth({ token: t, user: u });
  }, []);

  // Keep storage in sync whenever token/user changes
  useEffect(() => {
    if (token) {
      writeAuthToStorage(token, user);
    } else {
      clearAuthStorage();
    }
  }, [token, user]);

  // PUBLIC_INTERFACE
  const login = (newToken, newUser, remember = true) => {
    setStoragePreference(remember);
    setAuth({ token: newToken, user: newUser || null });
    writeAuthToStorage(newToken, newUser || null);
  };

  // PUBLIC_INTERFACE
  const logout = () => {
    setAuth({ token: null, user: null });
    clearAuthStorage();
  };

  // PUBLIC_INTERFACE
  const setIntendedPathIfUnset = (path) => {
    const current = getIntendedPath();
    if (!current && path) {
      setIntendedPath(path);
      setIntendedPathState(path);
    }
  };

  // PUBLIC_INTERFACE
  const completePostLoginRedirect = (defaultPath = '/') => {
    const dest = getIntendedPath() || defaultPath || '/';
    clearIntendedPath();
    setIntendedPathState('');
    // Use location change to navigate without direct useNavigate dependency
    window.history.replaceState(null, '', dest);
    // Trigger a manual popstate to inform routers if needed
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const value = useMemo(() => ({
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
    intendedPath,
    setIntendedPathIfUnset,
    completePostLoginRedirect
  }), [token, user, intendedPath]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
