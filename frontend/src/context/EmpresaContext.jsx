import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { api } from '../services/api/client';
import { useAuth } from './AuthContext';

const EmpresaContext = createContext();

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (!context) throw new Error('useEmpresa deve ser usado dentro de EmpresaProvider');
  return context;
}

export function EmpresaProvider({ children }) {
  const { currentUser } = useAuth();

  const [empresaAtual, setEmpresaAtual] = useState(null);
  const [empresasUsuario, setEmpresasUsuario] = useState([]);
  const [loadingEmpresa, setLoadingEmpresa] = useState(false);
  const [errorEmpresa, setErrorEmpresa] = useState(null);

  const selecionarEmpresa = useCallback((empresa) => {
    setEmpresaAtual(empresa);
    localStorage.setItem('empresaAtualId', empresa.id);
  }, []);

  // Load empresas when user logs in
  useEffect(() => {
    if (!currentUser?.id) {
      setEmpresaAtual(null);
      setEmpresasUsuario([]);
      return;
    }

    let cancelled = false;

    async function carregarEmpresas() {
      try {
        setLoadingEmpresa(true);
        const { data: empresas } = await api.get('/api/empresas');

        if (cancelled) return;
        setEmpresasUsuario(empresas);

        if (empresas.length > 0) {
          const empresaIdSalva = localStorage.getItem('empresaAtualId');
          const escolhida = empresas.find(e => e.id === empresaIdSalva) || empresas[0];
          selecionarEmpresa(escolhida);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Erro ao carregar empresas do usuario:', err);
          setErrorEmpresa('Erro ao carregar empresas');
        }
      } finally {
        if (!cancelled) setLoadingEmpresa(false);
      }
    }

    carregarEmpresas();
    return () => { cancelled = true; };
  }, [currentUser?.id, selecionarEmpresa]);

  const value = useMemo(() => ({
    empresaAtual,
    empresasUsuario,
    loadingEmpresa,
    errorEmpresa,
    selecionarEmpresa,
  }), [empresaAtual, empresasUsuario, loadingEmpresa, errorEmpresa, selecionarEmpresa]);

  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}
