import { createContext, useContext, useEffect, useState, useReducer } from 'react';
import { useAuth } from './AuthContext';
import { quartos, reservas, despesas, fluxoCaixa, gerarDisponibilidade } from '../data/mockData';

// Contexto híbrido simplificado - usa apenas dados mock locais
const HybridHotelContext = createContext();

export function useHotel() {
  const context = useContext(HybridHotelContext);
  if (!context) {
    throw new Error('useHotel deve ser usado dentro de HybridHotelProvider');
  }
  return context;
}

// Estados iniciais
const initialState = {
  quartos: [],
  reservas: [],
  despesas: [],
  fluxoCaixa: [],
  disponibilidade: {},
  loading: false,
  error: null,
  filtros: {
    tipoQuarto: 'todos',
    statusQuarto: 'todos',
    dataInicio: new Date(),
    dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
};

// Tipos de ações
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_QUARTOS: 'SET_QUARTOS',
  SET_RESERVAS: 'SET_RESERVAS',
  SET_DESPESAS: 'SET_DESPESAS',
  SET_FLUXO_CAIXA: 'SET_FLUXO_CAIXA',
  SET_DISPONIBILIDADE: 'SET_DISPONIBILIDADE',
  ADICIONAR_RESERVA: 'ADICIONAR_RESERVA',
  ADICIONAR_QUARTO: 'ADICIONAR_QUARTO',
  ATUALIZAR_QUARTO: 'ATUALIZAR_QUARTO',
  REMOVER_QUARTO: 'REMOVER_QUARTO',
  ADICIONAR_DESPESA: 'ADICIONAR_DESPESA',
  ATUALIZAR_DESPESA: 'ATUALIZAR_DESPESA',
  REMOVER_DESPESA: 'REMOVER_DESPESA',
  ATUALIZAR_STATUS_QUARTO: 'ATUALIZAR_STATUS_QUARTO',
  SET_FILTROS: 'SET_FILTROS'
};

// Reducer para gerenciar o estado
function hotelReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.SET_QUARTOS:
      return { ...state, quartos: action.payload };
    
    case actionTypes.SET_RESERVAS:
      return { ...state, reservas: action.payload };
    
    case actionTypes.SET_DESPESAS:
      return { ...state, despesas: action.payload };
    
    case actionTypes.SET_FLUXO_CAIXA:
      return { ...state, fluxoCaixa: action.payload };
    
    case actionTypes.SET_DISPONIBILIDADE:
      return { ...state, disponibilidade: action.payload };
    
    case actionTypes.ADICIONAR_RESERVA:
      const novaReserva = action.payload;
      const novoFluxoEntrada = {
        id: `fc_${Date.now()}`,
        tipo: 'entrada',
        valor: novaReserva.valor,
        descricao: `Reserva quarto ${novaReserva.quarto} - ${novaReserva.hospede.nome}`,
        data: new Date(),
        categoria: 'Hospedagem',
        origem: novaReserva.id
      };
      
      return {
        ...state,
        reservas: [...state.reservas, novaReserva],
        fluxoCaixa: [...state.fluxoCaixa, novoFluxoEntrada],
        quartos: state.quartos.map(q => 
          q.numero === novaReserva.quarto ? { ...q, status: 'ocupado' } : q
        )
      };
    
    case actionTypes.ADICIONAR_QUARTO:
      return {
        ...state,
        quartos: [...state.quartos, action.payload]
      };
    
    case actionTypes.ATUALIZAR_QUARTO:
      return {
        ...state,
        quartos: state.quartos.map(q => 
          q.id === action.payload.id ? { ...q, ...action.payload.dados } : q
        )
      };
    
    case actionTypes.REMOVER_QUARTO:
      return {
        ...state,
        quartos: state.quartos.filter(q => q.id !== action.payload)
      };

    case actionTypes.ADICIONAR_DESPESA:
      const novaDespesa = action.payload;
      const novoFluxoSaida = {
        id: `fc_${Date.now()}`,
        tipo: 'saida',
        valor: novaDespesa.valor,
        descricao: novaDespesa.descricao,
        data: novaDespesa.data,
        categoria: novaDespesa.categoria,
        origem: novaDespesa.id
      };
      
      return {
        ...state,
        despesas: [...state.despesas, novaDespesa],
        fluxoCaixa: [...state.fluxoCaixa, novoFluxoSaida]
      };
    
    case actionTypes.ATUALIZAR_DESPESA:
      return {
        ...state,
        despesas: state.despesas.map(d => 
          d.id === action.payload.id ? { ...d, ...action.payload.dados } : d
        )
      };
    
    case actionTypes.REMOVER_DESPESA:
      return {
        ...state,
        despesas: state.despesas.filter(d => d.id !== action.payload),
        fluxoCaixa: state.fluxoCaixa.filter(f => f.origem !== action.payload)
      };
    
    case actionTypes.ATUALIZAR_STATUS_QUARTO:
      return {
        ...state,
        quartos: state.quartos.map(q => 
          q.id === action.payload.quartoId ? { ...q, status: action.payload.status } : q
        )
      };
    
    case actionTypes.SET_FILTROS:
      return { ...state, filtros: { ...state.filtros, ...action.payload } };
    
    default:
      return state;
  }
}

export function HybridHotelProvider({ children }) {
  const [state, dispatch] = useReducer(hotelReducer, initialState);
  const { currentUser, empresaAtual } = useAuth();

  console.log('✅ Passo 2: HybridHotelProvider funcionando');

  // Carregar dados iniciais (apenas mock)
  useEffect(() => {
    const carregarDados = () => {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      try {
        // Usar dados mock locais
        console.log('📦 Carregando dados mock...');
        dispatch({ type: actionTypes.SET_QUARTOS, payload: quartos });
        dispatch({ type: actionTypes.SET_RESERVAS, payload: reservas });
        dispatch({ type: actionTypes.SET_DESPESAS, payload: despesas });
        dispatch({ type: actionTypes.SET_FLUXO_CAIXA, payload: fluxoCaixa });
        
        // Gerar disponibilidade
        const disponibilidadeData = gerarDisponibilidade();
        dispatch({ type: actionTypes.SET_DISPONIBILIDADE, payload: disponibilidadeData });
        
        console.log('✅ Dados mock carregados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao carregar dados' });
      } finally {
        dispatch({ type: actionTypes.SET_LOADING, payload: false });
      }
    };

    if (currentUser && empresaAtual) {
      carregarDados();
    }
  }, [currentUser, empresaAtual]);

  // Funções para manipular dados
  const adicionarReserva = async (dadosReserva) => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      
      const novaReserva = {
        id: `res_${Date.now()}`,
        ...dadosReserva,
        criadoEm: new Date(),
        status: 'confirmada'
      };
      dispatch({ type: actionTypes.ADICIONAR_RESERVA, payload: novaReserva });
    } catch (error) {
      console.error('Erro ao adicionar reserva:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao adicionar reserva' });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  };

  const adicionarQuarto = async (dadosQuarto) => {
    try {
      const novoQuarto = {
        id: `q_${Date.now()}`,
        ...dadosQuarto,
        status: 'disponivel'
      };
      dispatch({ type: actionTypes.ADICIONAR_QUARTO, payload: novoQuarto });
    } catch (error) {
      console.error('Erro ao adicionar quarto:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao adicionar quarto' });
    }
  };

  const atualizarQuarto = async (quartoId, dadosAtualizados) => {
    try {
      dispatch({ 
        type: actionTypes.ATUALIZAR_QUARTO, 
        payload: { id: quartoId, dados: dadosAtualizados } 
      });
    } catch (error) {
      console.error('Erro ao atualizar quarto:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao atualizar quarto' });
    }
  };

  const removerQuarto = async (quartoId) => {
    try {
      dispatch({ type: actionTypes.REMOVER_QUARTO, payload: quartoId });
    } catch (error) {
      console.error('Erro ao remover quarto:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao remover quarto' });
    }
  };

  const adicionarDespesa = async (dadosDespesa) => {
    try {
      const novaDespesa = {
        id: `desp_${Date.now()}`,
        ...dadosDespesa,
        criadoEm: new Date()
      };
      dispatch({ type: actionTypes.ADICIONAR_DESPESA, payload: novaDespesa });
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao adicionar despesa' });
    }
  };

  const atualizarDespesa = async (despesaId, dadosAtualizados) => {
    try {
      dispatch({ 
        type: actionTypes.ATUALIZAR_DESPESA, 
        payload: { id: despesaId, dados: dadosAtualizados } 
      });
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao atualizar despesa' });
    }
  };

  const removerDespesa = async (despesaId) => {
    try {
      dispatch({ type: actionTypes.REMOVER_DESPESA, payload: despesaId });
    } catch (error) {
      console.error('Erro ao remover despesa:', error);
      dispatch({ type: actionTypes.SET_ERROR, payload: 'Erro ao remover despesa' });
    }
  };

  const atualizarStatusQuarto = (quartoId, novoStatus) => {
    dispatch({ 
      type: actionTypes.ATUALIZAR_STATUS_QUARTO, 
      payload: { quartoId, status: novoStatus } 
    });
  };

  const setFiltros = (novosFiltros) => {
    dispatch({ type: actionTypes.SET_FILTROS, payload: novosFiltros });
  };

  const value = {
    ...state,
    adicionarReserva,
    adicionarQuarto,
    atualizarQuarto,
    removerQuarto,
    adicionarDespesa,
    atualizarDespesa,
    removerDespesa,
    atualizarStatusQuarto,
    setFiltros
  };

  return (
    <HybridHotelContext.Provider value={value}>
      {children}
    </HybridHotelContext.Provider>
  );
}

