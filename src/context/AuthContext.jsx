import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
// TODO: Extract to services/firestore/auth.firestore.js when backend is ready
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const ADMIN_EMAIL = 'arielpolita@gmail.com.br';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [empresaAtual, setEmpresaAtual] = useState(null);
  const [empresasUsuario, setEmpresasUsuario] = useState([]);
  const [trialStatus, setTrialStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Função para verificar se é admin
  function isAdmin() {
    return currentUser?.email === ADMIN_EMAIL;
  }

  // Função para verificar status do trial
  async function verificarStatusTrial(empresaId) {
    try {
      const empresaRef = doc(db, 'empresas', empresaId);
      const empresaDoc = await getDoc(empresaRef);
      
      if (!empresaDoc.exists()) {
        return { status: 'expired', diasRestantes: 0 };
      }

      const empresaData = empresaDoc.data();
      
      // Se já está pago, retornar ativo
      if (empresaData.statusPagamento === 'pago') {
        return { status: 'paid', diasRestantes: null };
      }

      // Calcular dias desde a criação
      const dataInicio = empresaData.dataInicio?.toDate() || empresaData.criadoEm?.toDate() || new Date();
      const hoje = new Date();
      const diasDecorridos = Math.floor((hoje - dataInicio) / (1000 * 60 * 60 * 24));
      const diasTrial = empresaData.diasTrial || 3;
      const diasRestantes = diasTrial - diasDecorridos;

      if (diasRestantes > 0) {
        return { status: 'active', diasRestantes };
      } else {
        // Atualizar status para expirado se ainda não estiver
        if (empresaData.statusPagamento !== 'expirado') {
          await updateDoc(empresaRef, {
            statusPagamento: 'expirado'
          });
        }
        return { status: 'expired', diasRestantes: 0 };
      }
    } catch (error) {
      console.error('Erro ao verificar status do trial:', error);
      return { status: 'expired', diasRestantes: 0 };
    }
  }

  // Função para fazer login
  async function login(email, password) {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setError(getErrorMessage(error.code));
      throw error;
    }
  }

  // Função para criar conta
  async function criarConta(email, password, nome, empresaData) {
    try {
      setError(null);
      // 1. Criar usuário no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // 2. Atualizar perfil do usuário
      await updateProfile(user, { displayName: nome });
      // 3. Criar documento do usuário no Firestore
      const userDocRef = doc(db, 'usuarios', user.uid);
      await setDoc(userDocRef, {
        nome,
        email,
        criadoEm: Timestamp.now(),
        ativo: true
      });
      // 4. Criar empresa no Firestore com trial de 3 dias
      const empresaRef = doc(collection(db, 'empresas'));
      const empresaId = empresaRef.id;
      
      await setDoc(empresaRef, {
        nome: empresaData.nome,
        cnpj: empresaData.cnpj || '',
        telefone: empresaData.telefone || '',
        endereco: empresaData.endereco || '',
        proprietario: user.uid,
        usuarios: [user.uid],
        criadoEm: Timestamp.now(),
        ativo: true,
        // Campos de trial e pagamento
        statusPagamento: 'trial', // 'trial', 'expirado', 'pago'
        dataInicio: Timestamp.now(),
        diasTrial: 3,
        valorMensal: 99.90
      });
      // 5. Aguardar um pouco para garantir que tudo foi salvo
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 6. Recarregar a página para inicializar o contexto corretamente
      window.location.reload();

      return user;
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      setError(getErrorMessage(error.code));
      throw error;
    }
  }

  // Função para fazer logout
  // Função para recuperar senha
  async function recuperarSenha(email) {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  }

  async function logout() {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      setEmpresaAtual(null);
      setEmpresasUsuario([]);
      setTrialStatus(null);
      localStorage.removeItem('empresaAtualId');
    } catch (error) {
      setError(getErrorMessage(error.code));
      throw error;
    }
  }

  // Função para carregar empresas do usuário
  async function carregarEmpresasUsuario(userId) {
    try {
      const empresasQuery = query(
        collection(db, 'empresas'),
        where('usuarios', 'array-contains', userId)
      );
      
      const empresasSnapshot = await getDocs(empresasQuery);
      const empresas = empresasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setEmpresasUsuario(empresas);
      
      // Se há empresas, selecionar automaticamente a primeira
      if (empresas.length > 0) {
        // Tentar restaurar empresa salva
        const empresaIdSalva = localStorage.getItem('empresaAtualId');
        const empresaParaSelecionar = empresas.find(e => e.id === empresaIdSalva) || empresas[0];
        await selecionarEmpresa(empresaParaSelecionar.id);
      }
      
      return empresas;
    } catch (error) {
      console.error('Erro ao carregar empresas do usuário:', error);
      setError('Erro ao carregar empresas');
      throw error;
    }
  }

  // Função para selecionar empresa
  async function selecionarEmpresa(empresaId) {
    try {
      const empresaDoc = await getDoc(doc(db, 'empresas', empresaId));
      
      if (empresaDoc.exists()) {
        const empresaData = {
          id: empresaDoc.id,
          ...empresaDoc.data()
        };
        
        setEmpresaAtual(empresaData);
        localStorage.setItem('empresaAtualId', empresaId);
        
        // Verificar status do trial
        const status = await verificarStatusTrial(empresaId);
        setTrialStatus(status);
        
      } else {
        throw new Error('Empresa não encontrada');
      }
    } catch (error) {
      console.error('Erro ao selecionar empresa:', error);
      setError('Erro ao selecionar empresa');
      throw error;
    }
  }

  // Função para ativar empresa (apenas admin)
  async function ativarEmpresa(empresaId) {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem ativar empresas');
    }

    try {
      const empresaRef = doc(db, 'empresas', empresaId);
      await updateDoc(empresaRef, {
        statusPagamento: 'pago',
        dataPagamento: Timestamp.now(),
        ativo: true
      });

    } catch (error) {
      console.error('Erro ao ativar empresa:', error);
      throw error;
    }
  }

  // Função para listar todas as empresas (apenas admin)
  async function listarTodasEmpresas() {
    if (!isAdmin()) {
      throw new Error('Apenas administradores podem listar todas as empresas');
    }

    try {
      const empresasSnapshot = await getDocs(collection(db, 'empresas'));
      const empresas = await Promise.all(
        empresasSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const status = await verificarStatusTrial(doc.id);
          
          return {
            id: doc.id,
            ...data,
            trialStatus: status
          };
        })
      );

      return empresas;
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      throw error;
    }
  }

  // Efeito para monitorar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // Usuário está logado
          const userDocRef = doc(db, 'usuarios', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (userDoc.exists() ? userDoc.data().nome : '')
          };
          
          setCurrentUser(userData);
          
          // Carregar empresas do usuário
          await carregarEmpresasUsuario(user.uid);
        } else {
          // Usuário não está logado
          setCurrentUser(null);
          setEmpresaAtual(null);
          setEmpresasUsuario([]);
          setTrialStatus(null);
        }
      } catch (error) {
        console.error('Erro ao carregar empresas do usuário:', error);
        setError('Erro ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  // Função para traduzir erros do Firebase
  function getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este email já está em uso',
      'auth/invalid-email': 'Email inválido',
      'auth/operation-not-allowed': 'Operação não permitida',
      'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
      'auth/user-disabled': 'Usuário desabilitado',
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/invalid-credential': 'Credenciais inválidas',
      'auth/configuration-not-found': 'Configuração do Firebase não encontrada. Verifique se o Authentication está ativado no Firebase Console.'
    };

    return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.';
  }

  const value = {
    currentUser,
    empresaAtual,
    empresasUsuario,
    trialStatus,
    loading,
    error,
    login,
    criarConta,
    logout,
    recuperarSenha,
    selecionarEmpresa,
    ativarEmpresa,
    listarTodasEmpresas,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

