import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'ohospedeiro_active_empresa_id';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const EmpresaContext = createContext(null);

export function useEmpresa() {
  return useContext(EmpresaContext);
}

function resolveActiveEmpresa(companies) {
  if (!companies.length) return null;
  const storedId = localStorage.getItem(STORAGE_KEY);
  if (storedId) {
    const found = companies.find(c => c.id === storedId);
    if (found) return found;
  }
  return companies[0];
}

export function EmpresaProvider({ children }) {
  const { currentUser, companies } = useAuth();
  const [activeEmpresa, setActiveEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !companies.length) {
      setLoading(false);
      return;
    }
    const active = resolveActiveEmpresa(companies);
    setActiveEmpresa(active);
    if (active) localStorage.setItem(STORAGE_KEY, active.id);
    setLoading(false);
  }, [currentUser, companies]);

  const switchEmpresa = useCallback(async (id) => {
    localStorage.setItem(STORAGE_KEY, id);
    try {
      await fetch(`${API_URL}/api/empresas/${id}/switch`, {
        method: 'POST', credentials: 'include',
      });
    } catch { /* best-effort server sync */ }
    window.location.reload();
  }, []);

  const createEmpresa = useCallback(async (data) => {
    const res = await fetch(`${API_URL}/api/empresas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create empresa');
    const empresa = await res.json();
    localStorage.setItem(STORAGE_KEY, empresa.id);
    window.location.reload();
    return empresa;
  }, []);

  const value = useMemo(() => ({
    activeEmpresa,
    empresaAtual: activeEmpresa,
    companies,
    empresasUsuario: companies,
    loading,
    loadingEmpresa: loading,
    switchEmpresa,
    createEmpresa,
    selecionarEmpresa: switchEmpresa,
  }), [activeEmpresa, companies, loading, switchEmpresa, createEmpresa]);

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}
