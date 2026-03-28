import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

// Traduz erros do Firebase para mensagens em PT-BR
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'Este email ja esta em uso',
    'auth/invalid-email': 'Email invalido',
    'auth/operation-not-allowed': 'Operacao nao permitida',
    'auth/weak-password': 'Senha muito fraca. Use pelo menos 6 caracteres',
    'auth/user-disabled': 'Usuario desabilitado',
    'auth/user-not-found': 'Usuario nao encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/invalid-credential': 'Credenciais invalidas',
    'auth/configuration-not-found': 'Configuracao do Firebase nao encontrada. Verifique se o Authentication esta ativado no Firebase Console.'
  };
  return errorMessages[errorCode] || 'Erro desconhecido. Tente novamente.';
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (err) {
      console.error('Erro ao fazer login:', err);
      setError(getErrorMessage(err.code));
      throw err;
    }
  }, []);

  const criarConta = useCallback(async (email, password, nome, empresaData) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nome });

      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        email,
        criadoEm: Timestamp.now(),
        ativo: true
      });

      const empresaRef = doc(collection(db, 'empresas'));
      await setDoc(empresaRef, {
        nome: empresaData.nome,
        cnpj: empresaData.cnpj || '',
        telefone: empresaData.telefone || '',
        endereco: empresaData.endereco || '',
        proprietario: user.uid,
        usuarios: [user.uid],
        criadoEm: Timestamp.now(),
        ativo: true,
        statusPagamento: 'trial',
        dataInicio: Timestamp.now(),
        diasTrial: 3,
        valorMensal: 99.90
      });

      await new Promise(resolve => setTimeout(resolve, 1000));
      window.location.reload();
      return user;
    } catch (err) {
      console.error('Erro ao criar conta:', err);
      setError(getErrorMessage(err.code));
      throw err;
    }
  }, []);

  const recuperarSenha = useCallback(async (email) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      setError(getErrorMessage(err.code));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      setCurrentUser(null);
      localStorage.removeItem('empresaAtualId');
    } catch (err) {
      setError(getErrorMessage(err.code));
      throw err;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userDocRef = doc(db, 'usuarios', user.uid);
          const userDoc = await getDoc(userDocRef);
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || (userDoc.exists() ? userDoc.data().nome : '')
          });
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do usuario:', err);
        setError('Erro ao carregar dados do usuario');
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = useMemo(() => ({
    currentUser,
    loading,
    error,
    login,
    criarConta,
    logout,
    recuperarSenha,
  }), [currentUser, loading, error, login, criarConta, logout, recuperarSenha]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
