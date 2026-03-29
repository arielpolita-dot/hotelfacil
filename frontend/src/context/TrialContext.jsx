import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '../services/api/client';
import { useAuth } from './AuthContext';
import { useEmpresa } from './EmpresaContext';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

const TrialContext = createContext();

export function useTrial() {
  const context = useContext(TrialContext);
  if (!context) {
    return { trialStatus: null, isAdmin: () => false, ativarEmpresa: async () => {}, listarTodasEmpresas: async () => [] };
  }
  return context;
}

export function TrialProvider({ children }) {
  const { currentUser } = useAuth();
  const { empresaAtual } = useEmpresa();

  const [trialStatus, setTrialStatus] = useState(null);

  const isAdmin = useCallback(() => {
    return currentUser?.email === ADMIN_EMAIL;
  }, [currentUser]);

  // Check trial when empresa changes
  useEffect(() => {
    if (!empresaAtual?.id) {
      setTrialStatus(null);
      return;
    }

    api.get(`/api/empresas/${empresaAtual.id}/trial`)
      .then(({ data }) => setTrialStatus(data))
      .catch(() => setTrialStatus({ status: 'expired', diasRestantes: 0 }));
  }, [empresaAtual?.id]);

  const ativarEmpresa = useCallback(async (empresaId) => {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem ativar empresas');
    }
    await api.post(`/api/empresas/${empresaId}/activate`);
  }, [isAdmin]);

  const listarTodasEmpresas = useCallback(async () => {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem listar todas as empresas');
    }
    const { data } = await api.get('/api/admin/empresas');
    return data;
  }, [isAdmin]);

  const value = useMemo(() => ({
    trialStatus,
    isAdmin,
    ativarEmpresa,
    listarTodasEmpresas,
  }), [trialStatus, isAdmin, ativarEmpresa, listarTodasEmpresas]);

  return (
    <TrialContext.Provider value={value}>
      {children}
    </TrialContext.Provider>
  );
}
