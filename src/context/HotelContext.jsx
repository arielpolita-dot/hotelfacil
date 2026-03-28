import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import {
  onQuartos,
  onReservas,
  onDespesas,
  onFluxoCaixa,
  onFaturas,
  onUsuarios,
  onFornecedores,
  onBancos,
  addQuarto,
  updateQuarto,
  deleteQuarto,
  addReserva,
  updateReserva,
  checkoutReserva,
  cancelarReserva,
  addDespesa,
  updateDespesa,
  deleteDespesa,
  addFatura,
  updateFatura,
  deleteFatura,
  addFluxoCaixa,
  addUsuario,
  updateUsuario,
  deleteUsuario,
  addFornecedor,
  updateFornecedor,
  deleteFornecedor,
  addBanco,
  updateBanco,
  deleteBanco,
  seedDadosIniciais,
  seedBancosIniciais
} from '../services/firestoreService';

const HotelContext = createContext();

export function useHotel() {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel deve ser usado dentro de HotelProvider');
  return context;
}

export function HotelProvider({ children }) {
  const { currentUser, empresaAtual, logout } = useAuth();

  const [quartos, setQuartos] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [fluxoCaixa, setFluxoCaixa] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [bancos, setBancos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const empresaId = empresaAtual?.id;

  useEffect(() => {
    if (!empresaId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    seedDadosIniciais(empresaId).catch(console.error);
    seedBancosIniciais(empresaId).catch(console.error);

    const unsubs = [
      onQuartos(empresaId, data => { setQuartos(data); setLoading(false); }),
      onReservas(empresaId, setReservas),
      onDespesas(empresaId, setDespesas),
      onFluxoCaixa(empresaId, setFluxoCaixa),
      onFaturas(empresaId, setFaturas),
      onUsuarios(empresaId, setUsuarios),
      onFornecedores(empresaId, setFornecedores),
      onBancos(empresaId, setBancos),
    ];

    return () => unsubs.forEach(u => u());
  }, [empresaId]);

  // ─── QUARTOS ──────────────────────────────────────────────────────────────
  const adicionarQuarto = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addQuarto(empresaId, dados);
  }, [empresaId]);

  const atualizarQuarto = useCallback(async (quartoId, dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateQuarto(empresaId, quartoId, dados);
  }, [empresaId]);

  const removerQuarto = useCallback(async (quartoId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await deleteQuarto(empresaId, quartoId);
  }, [empresaId]);

  const atualizarStatusQuarto = useCallback(async (quartoId, status) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateQuarto(empresaId, quartoId, { status });
  }, [empresaId]);

  // ─── RESERVAS ─────────────────────────────────────────────────────────────
  const adicionarReserva = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addReserva(empresaId, dados);
  }, [empresaId]);

  const atualizarReserva = useCallback(async (reservaId, dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateReserva(empresaId, reservaId, dados);
  }, [empresaId]);

  const fazerCheckout = useCallback(async (reservaId, quartoId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await checkoutReserva(empresaId, reservaId, quartoId);
  }, [empresaId]);

  const cancelarReservaHook = useCallback(async (reservaId, quartoId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await cancelarReserva(empresaId, reservaId, quartoId);
  }, [empresaId]);

  // ─── DESPESAS ─────────────────────────────────────────────────────────────
  const adicionarDespesa = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addDespesa(empresaId, dados);
  }, [empresaId]);

  const atualizarDespesa = useCallback(async (despesaId, dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateDespesa(empresaId, despesaId, dados);
  }, [empresaId]);

  const removerDespesa = useCallback(async (despesaId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await deleteDespesa(empresaId, despesaId);
  }, [empresaId]);

  // ─── FLUXO DE CAIXA ─────────────────────────────────────────────────────
  const adicionarFluxo = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addFluxoCaixa(empresaId, dados);
  }, [empresaId]);

  // ─── FATURAS ──────────────────────────────────────────────────────────────
  const adicionarFatura = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addFatura(empresaId, dados);
  }, [empresaId]);

  const atualizarFatura = useCallback(async (faturaId, dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateFatura(empresaId, faturaId, dados);
  }, [empresaId]);

  const removerFatura = useCallback(async (faturaId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await deleteFatura(empresaId, faturaId);
  }, [empresaId]);

  // ─── USUÁRIOS ─────────────────────────────────────────────────────────────
  const adicionarUsuario = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addUsuario(empresaId, dados);
  }, [empresaId]);

  const atualizarUsuario = useCallback(async (usuarioId, dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateUsuario(empresaId, usuarioId, dados);
  }, [empresaId]);

  const removerUsuario = useCallback(async (usuarioId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await deleteUsuario(empresaId, usuarioId);
  }, [empresaId]);

  // ─── FORNECEDORES ─────────────────────────────────────────────────────────
  const adicionarFornecedor = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addFornecedor(empresaId, dados);
  }, [empresaId]);

  const atualizarFornecedor = useCallback(async (fornecedorId, dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateFornecedor(empresaId, fornecedorId, dados);
  }, [empresaId]);

  const removerFornecedor = useCallback(async (fornecedorId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await deleteFornecedor(empresaId, fornecedorId);
  }, [empresaId]);

  // ─── BANCOS ───────────────────────────────────────────────────────────────
  const adicionarBanco = useCallback(async (dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    return await addBanco(empresaId, dados);
  }, [empresaId]);

  const atualizarBanco = useCallback(async (bancoId, dados) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await updateBanco(empresaId, bancoId, dados);
  }, [empresaId]);

  const removerBanco = useCallback(async (bancoId) => {
    if (!empresaId) throw new Error('Empresa não selecionada');
    await deleteBanco(empresaId, bancoId);
  }, [empresaId]);

  // ─── DISPONIBILIDADE ──────────────────────────────────────────────────────
  const getDisponibilidade = useCallback((data) => {
    const dataStr = typeof data === 'string' ? data : data.toISOString().split('T')[0];
    const resultado = {};
    quartos.forEach(q => {
      const reservaAtiva = reservas.find(r => {
        if (r.quartoId !== q.id) return false;
        if (r.status === 'cancelada') return false;
        const checkin = new Date(r.dataCheckIn).toISOString().split('T')[0];
        const checkout = new Date(r.dataCheckOut).toISOString().split('T')[0];
        return dataStr >= checkin && dataStr < checkout;
      });
      resultado[q.id] = reservaAtiva ? 'ocupado' : q.status === 'disponivel' ? 'disponivel' : q.status;
    });
    return resultado;
  }, [quartos, reservas]);

  const value = useMemo(() => ({
    quartos,
    reservas,
    despesas,
    fluxoCaixa,
    faturas,
    usuarios,
    fornecedores,
    bancos,
    loading,
    error,
    empresaId,
    usuario: currentUser,
    logout,
    // Quartos
    adicionarQuarto,
    atualizarQuarto,
    removerQuarto,
    atualizarStatusQuarto,
    // Reservas
    adicionarReserva,
    atualizarReserva,
    fazerCheckout,
    cancelarReserva: cancelarReservaHook,
    // Despesas
    adicionarDespesa,
    atualizarDespesa,
    removerDespesa,
    // Faturas
    adicionarFatura,
    atualizarFatura,
    removerFatura,
    // Usuários
    adicionarUsuario,
    atualizarUsuario,
    removerUsuario,
    // Fornecedores
    adicionarFornecedor,
    atualizarFornecedor,
    removerFornecedor,
    // Bancos
    adicionarBanco,
    atualizarBanco,
    removerBanco,
    // Fluxo de Caixa
    adicionarFluxo,
    // Disponibilidade
    getDisponibilidade
  }), [
    quartos, reservas, despesas, fluxoCaixa, faturas,
    usuarios, fornecedores, bancos, loading, error, empresaId,
    currentUser, logout,
    adicionarQuarto, atualizarQuarto, removerQuarto, atualizarStatusQuarto,
    adicionarReserva, atualizarReserva, fazerCheckout, cancelarReservaHook,
    adicionarDespesa, atualizarDespesa, removerDespesa,
    adicionarFatura, atualizarFatura, removerFatura,
    adicionarUsuario, atualizarUsuario, removerUsuario,
    adicionarFornecedor, atualizarFornecedor, removerFornecedor,
    adicionarBanco, atualizarBanco, removerBanco,
    adicionarFluxo, getDisponibilidade
  ]);

  return (
    <HotelContext.Provider value={value}>
      {children}
    </HotelContext.Provider>
  );
}
