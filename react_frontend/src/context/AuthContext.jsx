import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// PUBLIC_INTERFACE
export const AuthContext = createContext(null);

// PUBLIC_INTERFACE
export function useAuth() {
  /** Hook to access auth context */
  return useContext(AuthContext);
}

// PUBLIC_INTERFACE
export function AuthProvider({ children }) {
  /** Provides auth state: token, user, login, logout */
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);

  // Load persisted token
  useEffect(() => {
    const saved = localStorage.getItem('auth');
    if (saved) {
      try {
        const { token: t, user: u } = JSON.parse(saved);
        if (t) setToken(t);
        if (u) setUser(u);
      } catch {}
    }
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem('auth', JSON.stringify({ token, user }));
  }, [token, user]);

  const value = useMemo(() => ({
    token, user,
    // PUBLIC_INTERFACE
    login: (t, u) => { setToken(t); setUser(u || null); },
    // PUBLIC_INTERFACE
    logout: () => { setToken(null); setUser(null); }
  }), [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
