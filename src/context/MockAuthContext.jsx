import { createContext, useContext, useEffect, useState } from 'react';

const MockAuthContext = createContext();

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth deve ser usado dentro de MockAuthProvider');
  }
  return context;
}

export function MockAuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [empresaAtual, setEmpresaAtual] = useState(null);
  const [empresasUsuario, setEmpresasUsuario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simular dados de usuários e empresas
  const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
  const mockEmpresas = JSON.parse(localStorage.getItem('mockEmpresas') || '[]');

  // Função para fazer login mock
  async function login(email, password) {
    try {
      setError(null);
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockUsers.find(u => u.email === email && u.password === password);
      if (!user) {
        throw new Error('Email ou senha incorretos');
      }
      
      const userData = {
        uid: user.id,
        email: user.email,
        displayName: user.nome
      };
      
      setCurrentUser(userData);
      localStorage.setItem('mockCurrentUser', JSON.stringify(userData));
      
      // Carregar empresas do usuário imediatamente
      await carregarEmpresasUsuario(user.id);
      
      return { user: userData };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Função para criar conta mock
  async function signup(email, password, nome, dadosEmpresa) {
    try {
      setError(null);
      setLoading(true);
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verificar se email já existe
      if (mockUsers.find(u => u.email === email)) {
        throw new Error('Este email já está em uso');
      }
      
      // Criar usuário
      const userId = `user_${Date.now()}`;
      const newUser = {
        id: userId,
        email,
        password,
        nome,
        criadoEm: new Date().toISOString()
      };
      
      // Criar empresa
      const empresaId = `empresa_${Date.now()}`;
      const newEmpresa = {
        id: empresaId,
        nome: dadosEmpresa.nome,
        cnpj: dadosEmpresa.cnpj || '',
        telefone: dadosEmpresa.telefone || '',
        endereco: dadosEmpresa.endereco || '',
        proprietario: userId,
        usuarios: [userId],
        criadoEm: new Date().toISOString(),
        ativo: true
      };
      
      // Salvar no localStorage
      const updatedUsers = [...mockUsers, newUser];
      const updatedEmpresas = [...mockEmpresas, newEmpresa];
      
      localStorage.setItem('mockUsers', JSON.stringify(updatedUsers));
      localStorage.setItem('mockEmpresas', JSON.stringify(updatedEmpresas));
      
      // Fazer login automático
      const userData = {
        uid: userId,
        email,
        displayName: nome
      };
      
      setCurrentUser(userData);
      localStorage.setItem('mockCurrentUser', JSON.stringify(userData));
      
      // Carregar empresas do usuário imediatamente
      await carregarEmpresasUsuario(user.id);
      
      return { user: userData };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Função para fazer logout
  async function logout() {
    try {
      setError(null);
      setCurrentUser(null);
      setEmpresaAtual(null);
      setEmpresasUsuario([]);
      localStorage.removeItem('mockCurrentUser');
      localStorage.removeItem('mockEmpresaAtual');
    } catch (error) {
      setError('Erro ao fazer logout');
      throw error;
    }
  }

  // Função para selecionar empresa
  async function selecionarEmpresa(empresaId) {
    try {
      setError(null);
      const empresa = mockEmpresas.find(e => e.id === empresaId);
      if (empresa) {
        setEmpresaAtual(empresa);
        localStorage.setItem('mockEmpresaAtual', JSON.stringify(empresa));
      }
    } catch (error) {
      setError('Erro ao selecionar empresa');
      throw error;
    }
  }

  // Função para carregar empresas do usuário
  async function carregarEmpresasUsuario(userId) {
    try {
      const empresas = mockEmpresas.filter(e => 
        e.usuarios.includes(userId) && e.ativo
      );
      setEmpresasUsuario(empresas);
      
      // Se há empresa salva, selecionar automaticamente
      const empresaSalva = JSON.parse(localStorage.getItem('mockEmpresaAtual') || 'null');
      if (empresaSalva && empresas.find(e => e.id === empresaSalva.id)) {
        setEmpresaAtual(empresaSalva);
      } else if (empresas.length === 1) {
        // Se há apenas uma empresa, selecionar automaticamente
        await selecionarEmpresa(empresas[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas do usuário:', error);
      setError('Erro ao carregar empresas');
    }
  }

  // Efeito para verificar usuário logado ao inicializar
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('mockCurrentUser') || 'null');
        
        if (savedUser) {
          setCurrentUser(savedUser);
          await carregarEmpresasUsuario(savedUser.uid);
        }
      } catch (error) {
        console.error('Erro ao verificar estado de autenticação:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthState();
  }, []);

  const value = {
    currentUser,
    empresaAtual,
    empresasUsuario,
    loading,
    error,
    login,
    signup,
    logout,
    selecionarEmpresa,
    carregarEmpresasUsuario,
    setError
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}
