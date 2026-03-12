import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { quartos, reservas, despesas, fluxoCaixa, gerarDisponibilidade } from '../data/mockData';

// Contexto do sistema hoteleiro
const HotelContext = createContext();

// Estados iniciais
const initialState = {
  quartos: quartos,
  reservas: reservas,
  despesas: despesas,
  fluxoCaixa: fluxoCaixa,
  disponibilidade: {},
  loading: false,
  error: null,
  filtros: {
    tipoQuarto: 'todos',
    statusQuarto: 'todos',
    dataInicio: new Date(),
    dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
  }
};

// Tipos de ações
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_DISPONIBILIDADE: 'SET_DISPONIBILIDADE',
  ADICIONAR_RESERVA: 'ADICIONAR_RESERVA',
  ATUALIZAR_RESERVA: 'ATUALIZAR_RESERVA',
  CANCELAR_RESERVA: 'CANCELAR_RESERVA',
  ADICIONAR_DESPESA: 'ADICIONAR_DESPESA',
  ATUALIZAR_DESPESA: 'ATUALIZAR_DESPESA',
  REMOVER_DESPESA: 'REMOVER_DESPESA',
  ADICIONAR_FLUXO_CAIXA: 'ADICIONAR_FLUXO_CAIXA',
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
    
    case actionTypes.SET_DISPONIBILIDADE:
      return { ...state, disponibilidade: action.payload };
    
    case actionTypes.ADICIONAR_RESERVA:
      return {
        ...state,
        reservas: [...state.reservas, action.payload],
        fluxoCaixa: [...state.fluxoCaixa, {
          id: `fc${Date.now()}`,
          tipo: 'entrada',
          valor: action.payload.valor,
          descricao: `Reserva quarto ${action.payload.quartoId} - ${action.payload.hospede.nome}`,
          data: new Date(),
          categoria: 'Hospedagem',
          origem: action.payload.id
        }]
      };
    
    case actionTypes.ATUALIZAR_RESERVA:
      return {
        ...state,
        reservas: state.reservas.map(reserva =>
          reserva.id === action.payload.id ? { ...reserva, ...action.payload } : reserva
        )
      };
    
    case actionTypes.CANCELAR_RESERVA:
      return {
        ...state,
        reservas: state.reservas.map(reserva =>
          reserva.id === action.payload ? { ...reserva, status: 'cancelada' } : reserva
        )
      };
    
    case actionTypes.ADICIONAR_DESPESA:
      return {
        ...state,
        despesas: [...state.despesas, action.payload],
        fluxoCaixa: [...state.fluxoCaixa, {
          id: `fc${Date.now()}`,
          tipo: 'saida',
          valor: action.payload.valor,
          descricao: action.payload.descricao,
          data: action.payload.data,
          categoria: action.payload.categoria,
          origem: action.payload.id
        }]
      };
    
    case actionTypes.ATUALIZAR_DESPESA:
      return {
        ...state,
        despesas: state.despesas.map(despesa =>
          despesa.id === action.payload.id ? { ...despesa, ...action.payload } : despesa
        )
      };
    
    case actionTypes.REMOVER_DESPESA:
      return {
        ...state,
        despesas: state.despesas.filter(despesa => despesa.id !== action.payload)
      };
    
    case actionTypes.ADICIONAR_FLUXO_CAIXA:
      return {
        ...state,
        fluxoCaixa: [...state.fluxoCaixa, action.payload]
      };
    
    case actionTypes.ATUALIZAR_STATUS_QUARTO:
      return {
        ...state,
        quartos: state.quartos.map(quarto =>
          quarto.id === action.payload.quartoId 
            ? { ...quarto, status: action.payload.status }
            : quarto
        )
      };
    
    case actionTypes.SET_FILTROS:
      return {
        ...state,
        filtros: { ...state.filtros, ...action.payload }
      };
    
    default:
      return state;
  }
}

// Provider do contexto
export function HotelProvider({ children }) {
  const [state, dispatch] = useReducer(hotelReducer, initialState);

  // Carregar dados de disponibilidade na inicialização
  useEffect(() => {
    const disponibilidadeData = gerarDisponibilidade();
    dispatch({ type: actionTypes.SET_DISPONIBILIDADE, payload: disponibilidadeData });
  }, []);

  // Ações do contexto
  const actions = {
    // Reservas
    adicionarReserva: (reserva) => {
      dispatch({ type: actionTypes.ADICIONAR_RESERVA, payload: reserva });
    },
    
    atualizarReserva: (reserva) => {
      dispatch({ type: actionTypes.ATUALIZAR_RESERVA, payload: reserva });
    },
    
    cancelarReserva: (reservaId) => {
      dispatch({ type: actionTypes.CANCELAR_RESERVA, payload: reservaId });
    },

    // Despesas
    adicionarDespesa: (despesa) => {
      dispatch({ type: actionTypes.ADICIONAR_DESPESA, payload: despesa });
    },
    
    atualizarDespesa: (despesa) => {
      dispatch({ type: actionTypes.ATUALIZAR_DESPESA, payload: despesa });
    },
    
    removerDespesa: (despesaId) => {
      dispatch({ type: actionTypes.REMOVER_DESPESA, payload: despesaId });
    },

    // Quartos
    atualizarStatusQuarto: (quartoId, status) => {
      dispatch({ 
        type: actionTypes.ATUALIZAR_STATUS_QUARTO, 
        payload: { quartoId, status } 
      });
    },

    // Filtros
    setFiltros: (filtros) => {
      dispatch({ type: actionTypes.SET_FILTROS, payload: filtros });
    },

    // Utilitários
    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    },
    
    setError: (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    }
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
}

// Hook para usar o contexto
export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) {
    throw new Error('useHotel deve ser usado dentro de um HotelProvider');
  }
  return context;
}

export default HotelContext;
