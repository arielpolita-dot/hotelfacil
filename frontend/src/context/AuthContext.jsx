import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    fetch(`${API_URL}/api/auth/status`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) setCurrentUser(data.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(() => {
    // Redirect to backend which redirects to Authify
    window.location.href = `${API_URL}/api/auth/login`;
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    setCurrentUser(null);
    window.location.href = '/';
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    login,
    logout,
  }), [currentUser, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
