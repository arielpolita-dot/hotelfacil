import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
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

  const selecionarEmpresa = useCallback(async (empresaId) => {
    try {
      const empresaDoc = await getDoc(doc(db, 'empresas', empresaId));
      if (empresaDoc.exists()) {
        setEmpresaAtual({ id: empresaDoc.id, ...empresaDoc.data() });
        localStorage.setItem('empresaAtualId', empresaId);
      } else {
        throw new Error('Empresa nao encontrada');
      }
    } catch (err) {
      console.error('Erro ao selecionar empresa:', err);
      setErrorEmpresa('Erro ao selecionar empresa');
      throw err;
    }
  }, []);

  // Carregar empresas quando o usuario logar
  useEffect(() => {
    if (!currentUser?.uid) {
      setEmpresaAtual(null);
      setEmpresasUsuario([]);
      return;
    }

    let cancelled = false;

    async function carregarEmpresas() {
      try {
        setLoadingEmpresa(true);
        const empresasQuery = query(
          collection(db, 'empresas'),
          where('usuarios', 'array-contains', currentUser.uid)
        );
        const snap = await getDocs(empresasQuery);
        const empresas = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        if (cancelled) return;
        setEmpresasUsuario(empresas);

        if (empresas.length > 0) {
          const empresaIdSalva = localStorage.getItem('empresaAtualId');
          const escolhida = empresas.find(e => e.id === empresaIdSalva) || empresas[0];
          await selecionarEmpresa(escolhida.id);
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
  }, [currentUser?.uid, selecionarEmpresa]);

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
