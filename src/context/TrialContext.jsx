import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import { useEmpresa } from './EmpresaContext';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';

const TrialContext = createContext();

export function useTrial() {
  const context = useContext(TrialContext);
  if (!context) throw new Error('useTrial deve ser usado dentro de TrialProvider');
  return context;
}

async function verificarStatusTrial(empresaId) {
  try {
    const empresaRef = doc(db, 'empresas', empresaId);
    const empresaDoc = await getDoc(empresaRef);

    if (!empresaDoc.exists()) {
      return { status: 'expired', diasRestantes: 0 };
    }

    const data = empresaDoc.data();

    if (data.statusPagamento === 'pago') {
      return { status: 'paid', diasRestantes: null };
    }

    const dataInicio = data.dataInicio?.toDate() || data.criadoEm?.toDate() || new Date();
    const hoje = new Date();
    const diasDecorridos = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));
    const diasTrial = data.diasTrial || 3;
    const diasRestantes = diasTrial - diasDecorridos;

    if (diasRestantes > 0) {
      return { status: 'active', diasRestantes };
    }

    if (data.statusPagamento !== 'expirado') {
      await updateDoc(empresaRef, { statusPagamento: 'expirado' });
    }
    return { status: 'expired', diasRestantes: 0 };
  } catch (err) {
    console.error('Erro ao verificar status do trial:', err);
    return { status: 'expired', diasRestantes: 0 };
  }
}

export function TrialProvider({ children }) {
  const { currentUser } = useAuth();
  const { empresaAtual } = useEmpresa();

  const [trialStatus, setTrialStatus] = useState(null);

  const isAdmin = useCallback(() => {
    return currentUser?.email === ADMIN_EMAIL;
  }, [currentUser]);

  // Verificar trial quando empresa mudar
  useEffect(() => {
    if (!empresaAtual?.id) {
      setTrialStatus(null);
      return;
    }
    verificarStatusTrial(empresaAtual.id).then(setTrialStatus);
  }, [empresaAtual?.id]);

  const ativarEmpresa = useCallback(async (empresaId) => {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem ativar empresas');
    }
    const empresaRef = doc(db, 'empresas', empresaId);
    await updateDoc(empresaRef, {
      statusPagamento: 'pago',
      dataPagamento: Timestamp.now(),
      ativo: true
    });
  }, [isAdmin]);

  const listarTodasEmpresas = useCallback(async () => {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem listar todas as empresas');
    }
    const snap = await getDocs(collection(db, 'empresas'));
    return Promise.all(
      snap.docs.map(async (d) => {
        const status = await verificarStatusTrial(d.id);
        return { id: d.id, ...d.data(), trialStatus: status };
      })
    );
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
