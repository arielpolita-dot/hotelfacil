import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Estrutura do banco de dados:
// empresas/{empresaId}
//   ├── dados: { nome, cnpj, endereco, telefone, email, plano, ativo }
//   ├── quartos/{quartoId}: { numero, tipo, caracteristicas, preco, status }
//   ├── reservas/{reservaId}: { hospede, quarto, checkin, checkout, valor, status }
//   ├── despesas/{despesaId}: { categoria, descricao, valor, data, tipo, responsavel }
//   ├── usuarios/{userId}: { nome, email, role, ativo, permissions }
//   └── configuracoes/{configId}: { chave, valor }

class FirestoreService {
  constructor() {
    this.empresaId = null;
    this.userId = null;
  }

  // Configurar empresa e usuário atual
  setContext(empresaId, userId) {
    this.empresaId = empresaId;
    this.userId = userId;
  }

  // Métodos para Empresas
  async criarEmpresa(dadosEmpresa) {
    try {
      const empresaRef = await addDoc(collection(db, 'empresas'), {
        ...dadosEmpresa,
        criadoEm: serverTimestamp(),
        ativo: true
      });
      
      // Criar dados iniciais da empresa
      await this.inicializarDadosEmpresa(empresaRef.id);
      
      return empresaRef.id;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }
  }

  async obterEmpresa(empresaId) {
    try {
      const empresaDoc = await getDoc(doc(db, 'empresas', empresaId));
      if (empresaDoc.exists()) {
        return { id: empresaDoc.id, ...empresaDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Erro ao obter empresa:', error);
      throw error;
    }
  }

  async listarEmpresasUsuario(userId) {
    try {
      // Buscar empresas onde o usuário tem acesso
      const q = query(
        collection(db, 'empresas'),
        where('usuarios', 'array-contains', userId),
        where('ativo', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao listar empresas do usuário:', error);
      throw error;
    }
  }

  // Métodos para Quartos
  async adicionarQuarto(dadosQuarto) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const quartoRef = await addDoc(
        collection(db, 'empresas', this.empresaId, 'quartos'),
        {
          ...dadosQuarto,
          criadoEm: serverTimestamp(),
          criadoPor: this.userId
        }
      );
      return quartoRef.id;
    } catch (error) {
      console.error('Erro ao adicionar quarto:', error);
      throw error;
    }
  }

  async listarQuartos() {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const q = query(
        collection(db, 'empresas', this.empresaId, 'quartos'),
        orderBy('numero')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao listar quartos:', error);
      throw error;
    }
  }

  async atualizarQuarto(quartoId, dadosAtualizados) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      await updateDoc(
        doc(db, 'empresas', this.empresaId, 'quartos', quartoId),
        {
          ...dadosAtualizados,
          atualizadoEm: serverTimestamp(),
          atualizadoPor: this.userId
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar quarto:', error);
      throw error;
    }
  }

  // Métodos para Reservas
  async adicionarReserva(dadosReserva) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const reservaRef = await addDoc(
        collection(db, 'empresas', this.empresaId, 'reservas'),
        {
          ...dadosReserva,
          criadoEm: serverTimestamp(),
          criadoPor: this.userId,
          status: 'confirmada'
        }
      );
      
      // Atualizar status do quarto
      await this.atualizarQuarto(dadosReserva.quartoId, { status: 'ocupado' });
      
      return reservaRef.id;
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error);
      throw error;
    }
  }

  async listarReservas() {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const q = query(
        collection(db, 'empresas', this.empresaId, 'reservas'),
        orderBy('criadoEm', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao listar reservas:', error);
      throw error;
    }
  }

  async atualizarReserva(reservaId, dadosAtualizados) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      await updateDoc(
        doc(db, 'empresas', this.empresaId, 'reservas', reservaId),
        {
          ...dadosAtualizados,
          atualizadoEm: serverTimestamp(),
          atualizadoPor: this.userId
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar reserva:', error);
      throw error;
    }
  }

  // Métodos para Despesas
  async adicionarDespesa(dadosDespesa) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const despesaRef = await addDoc(
        collection(db, 'empresas', this.empresaId, 'despesas'),
        {
          ...dadosDespesa,
          criadoEm: serverTimestamp(),
          criadoPor: this.userId
        }
      );
      return despesaRef.id;
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      throw error;
    }
  }

  async listarDespesas() {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const q = query(
        collection(db, 'empresas', this.empresaId, 'despesas'),
        orderBy('data', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao listar despesas:', error);
      throw error;
    }
  }

  async atualizarDespesa(despesaId, dadosAtualizados) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      await updateDoc(
        doc(db, 'empresas', this.empresaId, 'despesas', despesaId),
        {
          ...dadosAtualizados,
          atualizadoEm: serverTimestamp(),
          atualizadoPor: this.userId
        }
      );
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
  }

  async removerDespesa(despesaId) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      await deleteDoc(doc(db, 'empresas', this.empresaId, 'despesas', despesaId));
    } catch (error) {
      console.error('Erro ao remover despesa:', error);
      throw error;
    }
  }

  // Métodos para Usuários da Empresa
  async adicionarUsuarioEmpresa(dadosUsuario) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const usuarioRef = await addDoc(
        collection(db, 'empresas', this.empresaId, 'usuarios'),
        {
          ...dadosUsuario,
          criadoEm: serverTimestamp(),
          criadoPor: this.userId,
          ativo: true
        }
      );
      return usuarioRef.id;
    } catch (error) {
      console.error('Erro ao adicionar usuário à empresa:', error);
      throw error;
    }
  }

  async listarUsuariosEmpresa() {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    try {
      const q = query(
        collection(db, 'empresas', this.empresaId, 'usuarios'),
        where('ativo', '==', true)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Erro ao listar usuários da empresa:', error);
      throw error;
    }
  }

  // Listeners em tempo real
  onQuartosChange(callback) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    const q = query(
      collection(db, 'empresas', this.empresaId, 'quartos'),
      orderBy('numero')
    );
    
    return onSnapshot(q, (snapshot) => {
      const quartos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(quartos);
    });
  }

  onReservasChange(callback) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    const q = query(
      collection(db, 'empresas', this.empresaId, 'reservas'),
      orderBy('criadoEm', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const reservas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(reservas);
    });
  }

  onDespesasChange(callback) {
    if (!this.empresaId) throw new Error('Empresa não definida');
    
    const q = query(
      collection(db, 'empresas', this.empresaId, 'despesas'),
      orderBy('data', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const despesas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(despesas);
    });
  }

  // Inicializar dados da empresa com dados de exemplo
  async inicializarDadosEmpresa(empresaId) {
    try {
      const batch = writeBatch(db);
      
      // Quartos de exemplo
      const quartosExemplo = [
        { numero: '101', tipo: 'standard', caracteristicas: ['Ar condicionado'], preco: 150, status: 'disponivel' },
        { numero: '102', tipo: 'standard', caracteristicas: ['Ar condicionado'], preco: 150, status: 'disponivel' },
        { numero: '201', tipo: 'deluxe', caracteristicas: ['Ar condicionado'], preco: 250, status: 'disponivel' },
        { numero: '301', tipo: 'triplo', caracteristicas: ['Ar condicionado'], preco: 300, status: 'disponivel' }
      ];

      quartosExemplo.forEach(quarto => {
        const quartoRef = doc(collection(db, 'empresas', empresaId, 'quartos'));
        batch.set(quartoRef, {
          ...quarto,
          criadoEm: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('Erro ao inicializar dados da empresa:', error);
      throw error;
    }
  }
}

export default new FirestoreService();
