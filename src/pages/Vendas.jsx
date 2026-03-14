import { toDate, toDateString } from '../utils/dateUtils';
import { useState, useMemo, useRef } from 'react';
import { useHotel } from '../context/HotelFirestoreContext';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, X, CalendarCheck, BedDouble, CreditCard, Building2, Pencil, ShoppingCart, LogIn, LogOut, Ban, Printer, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);

const STATUS_CFG = {
  confirmada:   { label: 'Confirmada',  cls: 'bg-blue-100 text-blue-700' },
  'check-in':   { label: 'Check-in',   cls: 'bg-emerald-100 text-emerald-700' },
  checkin:      { label: 'Check-in',   cls: 'bg-emerald-100 text-emerald-700' },
  checkout:     { label: 'Check-out',  cls: 'bg-slate-100 text-slate-600' },
  'check-out':  { label: 'Check-out',  cls: 'bg-slate-100 text-slate-600' },
  cancelada:    { label: 'Cancelada',  cls: 'bg-red-100 text-red-700' },
};

const FORMAS_PAGAMENTO = [
  { value: 'a_definir',       label: 'A Definir' },
  { value: 'dinheiro',        label: 'Dinheiro' },
  { value: 'pix',             label: 'PIX' },
  { value: 'cartao_credito',  label: 'Cartão de Crédito' },
  { value: 'cartao_debito',   label: 'Cartão de Débito' },
  { value: 'transferencia',   label: 'Transferência Bancária' },
  { value: 'cheque',          label: 'Cheque' },
  { value: 'faturado',        label: 'Faturado (Empresa)' },
];

const EMPTY_FORM = {
  nomeHospede: '', email: '', telefone: '', cpf: '',
  quartoId: '', numeroQuarto: '',
  dataCheckIn: '', dataCheckOut: '',
  adultos: 1, criancas: 0,
  valorTotal: '', formaPagamento: 'a_definir',
  observacoes: '', status: 'confirmada',
  // Dados de faturamento (quando formaPagamento === 'faturado')
  faturadoCnpj: '', faturadoEmpresa: '', faturadoContato: '', faturadoEndereco: '',
  // Ajustes de valor
  valorExtra: '', desconto: '', parcelas: '1',
  // Data de pagamento
  dataPagamento: '',
  // Banco
  bancoId: '',
};

// ─── Modal centralizado e responsivo ───────────────────────────────────────
// IMPORTANTE: NÃO fecha ao clicar fora para não perder dados digitados
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'rgba(15,23,42,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 25px 60px -12px rgba(0,0,0,0.35)',
          width: '100%',
          maxWidth: '42rem',
          maxHeight: 'calc(100vh - 2rem)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cabeçalho fixo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
          backgroundColor: '#ffffff',
        }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            title="Fechar"
            style={{
              color: '#94a3b8',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.375rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>
        {/* Conteúdo com scroll interno */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '1.25rem 1.5rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const selectCls = "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 mt-1">{children}</p>
  );
}

// ─── Funções de máscara ─────────────────────────────────────────────
function maskCPF(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}
function maskCNPJ(v) {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}
function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim().replace(/-$/, '');
}

export default function Vendas() {
  const { quartos, reservas, bancos, adicionarReserva, atualizarReserva, adicionarFatura, adicionarBanco, atualizarBanco, removerBanco, loading } = useHotel();
  const { empresaAtual } = useAuth();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editReserva, setEditReserva] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [useCnpj, setUseCnpj] = useState(false);
  const [cancelando, setCancelando] = useState(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [reciboData, setReciboData] = useState(null); // dados do recibo após pagamento
  const reciboRef = useRef(null);
  const [modalBanco, setModalBanco] = useState(false);
  const [editBancoId, setEditBancoId] = useState(null);
  const [bancoForm, setBancoForm] = useState({ nome: '', agencia: '', conta: '' });
  const [salvandoBanco, setSalvandoBanco] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const setVal = (f, v) => setForm(p => ({ ...p, [f]: v }));
  // Campo de texto com maiúsculas automáticas
  const setUpper = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value.toUpperCase() }));
  // Campo com máscara
  const setMasked = (f, maskFn) => (e) => setForm(p => ({ ...p, [f]: maskFn(e.target.value) }));

  const abrirNovo = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setEditReserva(null);
    setModal('form');
  };

  const abrirEditar = (r) => {
    setForm({
      nomeHospede: r.nomeHospede || r.hospede?.nome || '',
      email: r.email || r.hospede?.email || '',
      telefone: r.telefone || r.hospede?.telefone || '',
      cpf: r.cpf || r.hospede?.cpf || '',
      quartoId: r.quartoId || '',
      numeroQuarto: r.numeroQuarto || r.quartoNumero || '',
      dataCheckIn: toDate(r.dataCheckIn) ? format(toDate(r.dataCheckIn), 'yyyy-MM-dd') : '',
      dataCheckOut: toDate(r.dataCheckOut) ? format(toDate(r.dataCheckOut), 'yyyy-MM-dd') : '',
      adultos: r.adultos || 1,
      criancas: r.criancas || 0,
      valorTotal: r.valorTotal || r.valor || '',
      formaPagamento: r.formaPagamento || 'a_definir',
      observacoes: r.observacoes || '',
      status: r.status || 'confirmada',
      faturadoCnpj: r.faturadoCnpj || '',
      faturadoEmpresa: r.faturadoEmpresa || '',
      faturadoContato: r.faturadoContato || '',
      faturadoEndereco: r.faturadoEndereco || '',
    });
    setEditId(r.id);
    setEditReserva(r);
    setModal('form');
  };

  const abrirPagamento = (r) => {
    setForm(p => ({
      ...EMPTY_FORM,
      nomeHospede: r.nomeHospede || r.hospede?.nome || '',
      valorTotal: r.valorTotal || r.valor || '',
      formaPagamento: r.formaPagamento || 'a_definir',
      faturadoCnpj: r.faturadoCnpj || '',
      faturadoEmpresa: r.faturadoEmpresa || '',
      faturadoContato: r.faturadoContato || '',
      faturadoEndereco: r.faturadoEndereco || '',
      valorExtra: r.valorExtra || '',
      desconto: r.desconto || '',
      parcelas: r.parcelas || '1',
      // Pré-preenche com a data do check-out
      dataPagamento: r.dataPagamento
        ? (toDate(r.dataPagamento) ? format(toDate(r.dataPagamento), 'yyyy-MM-dd') : r.dataPagamento)
        : (toDate(r.dataCheckOut) ? format(toDate(r.dataCheckOut), 'yyyy-MM-dd') : ''),
      bancoId: r.bancoId || '',
    }));
    setEditId(r.id);
    setEditReserva(r);
    setModal('pagamento');
  };

  const calcularValor = (qId, ci, co) => {
    const quartoId = qId || form.quartoId;
    const dataCI = ci || form.dataCheckIn;
    const dataCO = co || form.dataCheckOut;
    if (!quartoId || !dataCI || !dataCO) return;
    const quarto = quartos.find(q => q.id === quartoId);
    if (!quarto) return;
    const d1 = new Date(dataCI);
    const d2 = new Date(dataCO);
    const dias = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)));
    setForm(p => ({
      ...p,
      valorTotal: (quarto.precoDiaria * dias).toFixed(2),
      numeroQuarto: quarto.numero,
    }));
  };

  const salvar = async () => {
    setSaving(true);
    try {
      // Montar dados — datas só se válidas
      const dados = { ...form };
      dados.valorTotal = parseFloat(form.valorTotal) || 0;
      dados.adultos = parseInt(form.adultos) || 1;
      dados.criancas = parseInt(form.criancas) || 0;
      // Datas: converte string para Date só se não estiver vazia
      if (form.dataCheckIn) {
        const d = new Date(form.dataCheckIn + 'T12:00:00');
        if (!isNaN(d.getTime())) dados.dataCheckIn = d;
      }
      if (form.dataCheckOut) {
        const d = new Date(form.dataCheckOut + 'T12:00:00');
        if (!isNaN(d.getTime())) dados.dataCheckOut = d;
      }
      if (editId) {
        await atualizarReserva(editId, dados);
      } else {
        await adicionarReserva(dados);
      }
      setModal(null);
    } catch (e) {
      console.error('Erro ao salvar reserva:', e);
      alert('Erro ao salvar: ' + (e?.message || 'Verifique o console'));
    }
    setSaving(false);
  };

  const isCartao = (fp) => fp === 'cartao_credito' || fp === 'cartao_debito';

  const calcularValorFinal = () => {
    const base = parseFloat(form.valorTotal) || 0;
    const extra = parseFloat(form.valorExtra) || 0;
    const desc = parseFloat(form.desconto) || 0;
    return Math.max(0, base + extra - desc);
  };

  const salvarPagamento = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const valorFinal = calcularValorFinal();
      const dados = {
        formaPagamento: form.formaPagamento,
        valorTotal: valorFinal,
        valorBase: parseFloat(form.valorTotal) || 0,
        valorExtra: parseFloat(form.valorExtra) || 0,
        desconto: parseFloat(form.desconto) || 0,
        parcelas: isCartao(form.formaPagamento) ? parseInt(form.parcelas) || 1 : 1,
        dataPagamento: form.dataPagamento || null,
        bancoId: form.bancoId || null,
      };
      // Se faturado, adicionar dados da empresa
      if (form.formaPagamento === 'faturado') {
        dados.faturadoCnpj = form.faturadoCnpj;
        dados.faturadoEmpresa = form.faturadoEmpresa;
        dados.faturadoContato = form.faturadoContato;
        dados.faturadoEndereco = form.faturadoEndereco;
        dados.isFaturado = true;
        // Criar fatura automaticamente
        if (adicionarFatura) {
          await adicionarFatura({
            tipo: 'reserva',
            reservaId: editId,
            nomeHospede: editReserva?.nomeHospede || editReserva?.hospede?.nome || '',
            empresaCnpj: form.faturadoCnpj,
            empresaNome: form.faturadoEmpresa,
            empresaContato: form.faturadoContato,
            empresaEndereco: form.faturadoEndereco,
            valor: parseFloat(form.valorTotal) || 0,
            status: 'pendente',
            dataInicio: editReserva?.dataCheckIn || new Date(),
            dataFim: editReserva?.dataCheckOut || new Date(),
          });
        }
      }
      await atualizarReserva(editId, dados);
      // Preparar dados do recibo
      const valorFinalCalc = calcularValorFinal();
      setReciboData({
        reservaId: editId,
        nomeHospede: editReserva?.nomeHospede || editReserva?.hospede?.nome || '',
        cpf: editReserva?.cpf || editReserva?.hospede?.cpf || '',
        telefone: editReserva?.telefone || editReserva?.hospede?.telefone || '',
        email: editReserva?.email || editReserva?.hospede?.email || '',
        numeroQuarto: editReserva?.numeroQuarto || editReserva?.quartoNumero || '',
        dataCheckIn: editReserva?.dataCheckIn,
        dataCheckOut: editReserva?.dataCheckOut,
        adultos: editReserva?.adultos || 1,
        criancas: editReserva?.criancas || 0,
        valorBase: parseFloat(form.valorTotal) || 0,
        valorExtra: parseFloat(form.valorExtra) || 0,
        desconto: parseFloat(form.desconto) || 0,
        valorFinal: valorFinalCalc,
        formaPagamento: form.formaPagamento,
        parcelas: isCartao(form.formaPagamento) ? parseInt(form.parcelas) || 1 : 1,
        dataPagamento: form.dataPagamento || new Date().toISOString().split('T')[0],
        observacoes: editReserva?.observacoes || '',
      });
      setModal('recibo');
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const atualizarStatus = async (id, status) => {
    if (status === 'cancelada') {
      // Abre modal de cancelamento para solicitar motivo
      setCancelando({ id });
      setMotivoCancelamento('');
      return;
    }
    try { await atualizarReserva(id, { status }); } catch (e) { console.error(e); }
  };

  const confirmarCancelamento = async () => {
    if (!cancelando) return;
    try {
      await atualizarReserva(cancelando.id, {
        status: 'cancelada',
        motivoCancelamento: motivoCancelamento.trim() || 'Não informado',
        canceladoEm: new Date(),
      });
    } catch (e) { console.error(e); }
    setCancelando(null);
    setMotivoCancelamento('');
  };

  const reservasFiltradas = useMemo(() => {
    return reservas.filter(r => {
      const nome = (r.nomeHospede || r.hospede?.nome || '').toLowerCase();
      const quarto = (r.numeroQuarto || r.quartoNumero || '').toString();
      const matchBusca = !busca || nome.includes(busca.toLowerCase()) || quarto.includes(busca);
      const matchStatus = filtroStatus === 'todos' || r.status === filtroStatus;
      return matchBusca && matchStatus;
    }).sort((a, b) => new Date(b.criadoEm || 0) - new Date(a.criadoEm || 0));
  }, [reservas, busca, filtroStatus]);

  // Todos os quartos disponíveis para nova reserva; na edição, inclui o quarto atual
  const quartosParaSelect = useMemo(() => {
    if (editId && editReserva) {
      return quartos.filter(q =>
        q.status === 'disponivel' ||
        q.status === 'reservado' ||
        q.id === editReserva.quartoId
      );
    }
    return quartos.filter(q => q.status === 'disponivel' || q.status === 'reservado');
  }, [quartos, editId, editReserva]);

  // Filtros de status para os botões
  const statusFiltros = [
    { key: 'todos', label: 'Todos' },
    { key: 'confirmada', label: 'Confirmada' },
    { key: 'check-in', label: 'Check-in' },
    { key: 'checkout', label: 'Check-out' },
    { key: 'cancelada', label: 'Cancelada' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reservas</h2>
          <p className="text-sm text-slate-500 mt-0.5">{reservas.length} reservas cadastradas</p>
        </div>
        <button
          onClick={abrirNovo}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm shadow-blue-600/20"
        >
          <Plus className="h-4 w-4" /> Nova Reserva
        </button>
      </div>

      {/* Filtros de status */}
      <div className="flex flex-wrap gap-2">
        {statusFiltros.map(({ key, label }) => {
          const count = key === 'todos'
            ? reservas.length
            : reservas.filter(r => r.status === key || (key === 'check-in' && r.status === 'checkin')).length;
          return (
            <button
              key={key}
              onClick={() => setFiltroStatus(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                filtroStatus === key
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Busca */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text" value={busca} onChange={e => setBusca(e.target.value)}
          placeholder="Buscar hóspede ou quarto..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      </div>

      {/* Tabela */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reservasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-100">
          <CalendarCheck className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Nenhuma reserva encontrada</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hóspede</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Quarto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Check-in</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Check-out</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Valor</th>
                  <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map(r => {
                  const ci = toDate(r.dataCheckIn);
                  const co = toDate(r.dataCheckOut);
                  const statusKey = r.status?.toLowerCase();
                  const cfg = STATUS_CFG[statusKey] || STATUS_CFG.confirmada;
                  return (
                    <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{r.nomeHospede || r.hospede?.nome || '—'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.telefone || r.hospede?.telefone || ''}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                            <BedDouble className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="font-medium text-slate-700">{r.numeroQuarto || r.quartoNumero || r.quartoId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                        {ci && !isNaN(ci) ? format(ci, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 hidden md:table-cell">
                        {co && !isNaN(co) ? format(co, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {fmt(r.valorTotal || r.valor)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* Editar */}
                          <button
                            onClick={() => abrirEditar(r)}
                            title="Editar reserva"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          {/* Pagamento */}
                          <button
                            onClick={() => abrirPagamento(r)}
                            title="Registrar pagamento"
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-violet-600 hover:bg-violet-50 transition"
                          >
                            <ShoppingCart className="h-4 w-4" />
                          </button>

                          {/* Check-in (só para confirmada) */}
                          {r.status === 'confirmada' && (
                            <button
                              onClick={() => atualizarStatus(r.id, 'check-in')}
                              title="Fazer Check-in"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                            >
                              <LogIn className="h-4 w-4" />
                            </button>
                          )}

                          {/* Check-out (só para check-in) */}
                          {(r.status === 'check-in' || r.status === 'checkin') && (
                            <button
                              onClick={() => atualizarStatus(r.id, 'checkout')}
                              title="Fazer Check-out"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-orange-500 hover:bg-orange-50 transition"
                            >
                              <LogOut className="h-4 w-4" />
                            </button>
                          )}

                          {/* Cancelar (confirmada ou check-in) */}
                          {(r.status === 'confirmada' || r.status === 'check-in' || r.status === 'checkin') && (
                            <button
                              onClick={() => atualizarStatus(r.id, 'cancelada')}
                              title="Cancelar reserva"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Modal: Formulário de Reserva ─────────────────────────────────── */}
      {modal === 'form' && (
        <Modal title={editId ? 'Editar Reserva' : 'Nova Reserva'} onClose={() => setModal(null)}>
          <div className="space-y-5">
            {/* Hóspede */}
            <div>
              <SectionTitle>Dados do Hóspede</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nome com maiúsculas automáticas */}
                <Field label="Nome Completo">
                  <input
                    type="text"
                    value={form.nomeHospede}
                    onChange={setUpper('nomeHospede')}
                    placeholder="NOME DO HÓSPEDE"
                    className={inputCls}
                    style={{ textTransform: 'uppercase' }}
                  />
                </Field>

                {/* CPF ou CNPJ com toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {useCnpj ? 'CNPJ' : 'CPF'}
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={useCnpj}
                        onChange={e => { setUseCnpj(e.target.checked); setForm(p => ({ ...p, cpf: '' })); }}
                        className="w-3.5 h-3.5 accent-blue-600"
                      />
                      <span className="text-xs text-slate-500">Usar CNPJ</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={form.cpf}
                    onChange={setMasked('cpf', useCnpj ? maskCNPJ : maskCPF)}
                    placeholder={useCnpj ? '00.000.000/0001-00' : '000.000.000-00'}
                    className={inputCls}
                  />
                </div>

                {/* Email */}
                <Field label="Email">
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="email@exemplo.com"
                    className={inputCls}
                    style={{ textTransform: 'lowercase' }}
                  />
                </Field>

                {/* Celular com máscara automática */}
                <Field label="Celular">
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={setMasked('telefone', maskPhone)}
                    placeholder="(00) 00000-0000"
                    className={inputCls}
                  />
                </Field>
              </div>
            </div>

            {/* Quarto e datas */}
            <div>
              <SectionTitle>Quarto e Período</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Quarto">
                  <select
                    value={form.quartoId}
                    onChange={e => {
                      const qId = e.target.value;
                      setForm(p => ({ ...p, quartoId: qId }));
                      setTimeout(() => calcularValor(qId, null, null), 50);
                    }}
                    className={selectCls}
                  >
                    <option value="">Selecione um quarto</option>
                    {quartosParaSelect.map(q => (
                      <option key={q.id} value={q.id}>
                        Quarto {q.numero} — {q.tipo} (R$ {q.precoDiaria}/diária)
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select value={form.status} onChange={set('status')} className={selectCls}>
                    <option value="confirmada">Confirmada</option>
                    <option value="check-in">Check-in</option>
                    <option value="checkout">Check-out</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </Field>
                <Field label="Check-in">
                  <input
                    type="date"
                    value={form.dataCheckIn}
                    onChange={e => {
                      const v = e.target.value;
                      setForm(p => ({ ...p, dataCheckIn: v }));
                      setTimeout(() => calcularValor(null, v, null), 50);
                    }}
                    className={inputCls}
                  />
                </Field>
                <Field label="Check-out">
                  <input
                    type="date"
                    value={form.dataCheckOut}
                    onChange={e => {
                      const v = e.target.value;
                      setForm(p => ({ ...p, dataCheckOut: v }));
                      setTimeout(() => calcularValor(null, null, v), 50);
                    }}
                    className={inputCls}
                  />
                </Field>
                <Field label="Adultos">
                  <input type="number" min="1" value={form.adultos} onChange={set('adultos')} className={inputCls} />
                </Field>
                <Field label="Crianças">
                  <input type="number" min="0" value={form.criancas} onChange={set('criancas')} className={inputCls} />
                </Field>
              </div>
            </div>

            {/* Pagamento */}
            <div>
              <SectionTitle>Pagamento</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Valor Total (R$)">
                  <input type="number" min="0" step="0.01" value={form.valorTotal} onChange={set('valorTotal')} placeholder="0,00" className={inputCls} />
                </Field>
                <Field label="Forma de Pagamento">
                  <select value={form.formaPagamento} onChange={set('formaPagamento')} className={selectCls}>
                    {FORMAS_PAGAMENTO.map(fp => (
                      <option key={fp.value} value={fp.value}>{fp.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Campos extras para Faturado */}
              {form.formaPagamento === 'faturado' && (
                <div className="mt-4 p-4 bg-violet-50 border border-violet-200 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-violet-600" />
                    <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Dados da Empresa Faturada</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="CNPJ">
                      <input type="text" value={form.faturadoCnpj} onChange={set('faturadoCnpj')} placeholder="00.000.000/0001-00" className={inputCls} />
                    </Field>
                    <Field label="Nome da Empresa">
                      <input type="text" value={form.faturadoEmpresa} onChange={set('faturadoEmpresa')} placeholder="Razão Social" className={inputCls} />
                    </Field>
                    <Field label="Contato">
                      <input type="text" value={form.faturadoContato} onChange={set('faturadoContato')} placeholder="Nome / Telefone" className={inputCls} />
                    </Field>
                    <Field label="Endereço">
                      <input type="text" value={form.faturadoEndereco} onChange={set('faturadoEndereco')} placeholder="Rua, nº, Cidade - UF" className={inputCls} />
                    </Field>
                  </div>
                </div>
              )}
            </div>

            <Field label="Observações">
              <textarea value={form.observacoes} onChange={set('observacoes')} rows={3} placeholder="Pedidos especiais, informações adicionais..." className={inputCls + ' resize-none'} />
            </Field>

            <div className="flex gap-3 pt-2 pb-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={salvar} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {saving ? 'Salvando...' : editId ? 'Salvar Alterações' : 'Confirmar Reserva'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Modal: Pagamento ─────────────────────────────────────────────── */}
      {modal === 'pagamento' && (
        <Modal title="Registrar Pagamento" onClose={() => setModal(null)}>
          <div className="space-y-5">
            {/* Resumo da reserva */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Resumo da Reserva</p>
              <p className="font-semibold text-slate-900">{editReserva?.nomeHospede || editReserva?.hospede?.nome || '—'}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                Quarto {editReserva?.numeroQuarto || editReserva?.quartoNumero || '—'}
                {editReserva?.dataCheckIn && ` · ${format(toDate(editReserva.dataCheckIn), 'dd/MM/yyyy', { locale: ptBR })}`}
                {editReserva?.dataCheckOut && ` → ${format(toDate(editReserva.dataCheckOut), 'dd/MM/yyyy', { locale: ptBR })}`}
              </p>
            </div>

            {/* Valor e forma de pagamento */}
            <div>
              <SectionTitle>Dados do Pagamento</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Data de Pagamento">
                  <input
                    type="date"
                    value={form.dataPagamento}
                    onChange={set('dataPagamento')}
                    className={inputCls}
                  />
                </Field>
                <Field label="Forma de Pagamento">
                  <select value={form.formaPagamento} onChange={set('formaPagamento')} className={selectCls}>
                    {FORMAS_PAGAMENTO.map(fp => (
                      <option key={fp.value} value={fp.value}>{fp.label}</option>
                    ))}
                  </select>
                </Field>
                {/* Banco — aparece para transferência, PIX, cheque */}
                {['transferencia','pix','cheque','cartao_credito','cartao_debito'].includes(form.formaPagamento) && (
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Banco</label>
                      <button
                        type="button"
                        onClick={() => { setEditBancoId(null); setBancoForm({ nome: '', agencia: '', conta: '' }); setModalBanco(true); }}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >+ Cadastrar banco</button>
                    </div>
                    <select
                      value={form.bancoId}
                      onChange={set('bancoId')}
                      className={selectCls}
                    >
                      <option value="">Selecione um banco</option>
                      {(bancos || []).map(b => (
                        <option key={b.id} value={b.id}>{b.nome}</option>
                      ))}
                    </select>
                    {/* Exibe agência e conta do banco selecionado */}
                    {form.bancoId && (() => {
                      const b = (bancos || []).find(x => x.id === form.bancoId);
                      return b && (b.agencia || b.conta) ? (
                        <div className="mt-2 flex gap-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                          {b.agencia && <span>Agência: <strong className="text-slate-700">{b.agencia}</strong></span>}
                          {b.conta && <span>Conta: <strong className="text-slate-700">{b.conta}</strong></span>}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
                <Field label="Valor da Diária (R$)">
                  <input
                    type="number" min="0" step="0.01"
                    value={form.valorTotal}
                    onChange={set('valorTotal')}
                    placeholder="0,00"
                    className={inputCls}
                  />
                </Field>
                <Field label="Valor Extra (R$)">
                  <input
                    type="number" min="0" step="0.01"
                    value={form.valorExtra}
                    onChange={set('valorExtra')}
                    placeholder="Ex: consumo, serviços adicionais"
                    className={inputCls}
                  />
                </Field>
                <Field label="Desconto (R$)">
                  <input
                    type="number" min="0" step="0.01"
                    value={form.desconto}
                    onChange={set('desconto')}
                    placeholder="0,00"
                    className={inputCls}
                  />
                </Field>
                {isCartao(form.formaPagamento) && (
                  <Field label="Parcelamento">
                    <select value={form.parcelas} onChange={set('parcelas')} className={selectCls}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <option key={n} value={n}>{n === 1 ? 'À vista' : `${n}x`}</option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>

              {/* Resumo do valor final */}
              {(parseFloat(form.valorExtra) > 0 || parseFloat(form.desconto) > 0) && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Valor da diária</span>
                    <span>{fmt(parseFloat(form.valorTotal) || 0)}</span>
                  </div>
                  {parseFloat(form.valorExtra) > 0 && (
                    <div className="flex justify-between text-sm text-emerald-600">
                      <span>+ Valor extra</span>
                      <span>+ {fmt(parseFloat(form.valorExtra))}</span>
                    </div>
                  )}
                  {parseFloat(form.desconto) > 0 && (
                    <div className="flex justify-between text-sm text-red-500">
                      <span>- Desconto</span>
                      <span>- {fmt(parseFloat(form.desconto))}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 mt-2 pt-2">
                    <span>Total a cobrar</span>
                    <span>{fmt(calcularValorFinal())}</span>
                  </div>
                  {isCartao(form.formaPagamento) && parseInt(form.parcelas) > 1 && (
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                      <span>{form.parcelas}x de</span>
                      <span>{fmt(calcularValorFinal() / parseInt(form.parcelas))}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Resumo quando só tem valor base + parcelamento */}
              {!(parseFloat(form.valorExtra) > 0 || parseFloat(form.desconto) > 0) && isCartao(form.formaPagamento) && parseInt(form.parcelas) > 1 && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex justify-between text-sm font-bold text-slate-900">
                    <span>Total: {fmt(parseFloat(form.valorTotal) || 0)}</span>
                    <span>{form.parcelas}x de {fmt((parseFloat(form.valorTotal) || 0) / parseInt(form.parcelas))}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Campos extras para Faturado */}
            {form.formaPagamento === 'faturado' && (
              <div className="p-4 bg-violet-50 border border-violet-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-violet-600" />
                  <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">Dados da Empresa Faturada</p>
                </div>
                <p className="text-xs text-violet-600 mb-3">Esta reserva será registrada em <strong>Vendas por Fatura</strong>.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="CNPJ">
                    <input type="text" value={form.faturadoCnpj} onChange={set('faturadoCnpj')} placeholder="00.000.000/0001-00" className={inputCls} />
                  </Field>
                  <Field label="Nome da Empresa">
                    <input type="text" value={form.faturadoEmpresa} onChange={set('faturadoEmpresa')} placeholder="Razão Social" className={inputCls} />
                  </Field>
                  <Field label="Contato">
                    <input type="text" value={form.faturadoContato} onChange={set('faturadoContato')} placeholder="Nome / Telefone" className={inputCls} />
                  </Field>
                  <Field label="Endereço">
                    <input type="text" value={form.faturadoEndereco} onChange={set('faturadoEndereco')} placeholder="Rua, nº, Cidade - UF" className={inputCls} />
                  </Field>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2 pb-1">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={salvarPagamento} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Confirmar Pagamento'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Modal: Cancelamento ──────────────────────────────────────────── */}
      {cancelando && (
        <Modal title="Cancelar Reserva" onClose={() => setCancelando(null)}>
          <div className="space-y-5">
            {/* Aviso */}
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Ban className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800 text-sm">Confirmar cancelamento</p>
                <p className="text-xs text-red-600 mt-0.5">Esta ação irá cancelar a reserva. Informe o motivo abaixo.</p>
              </div>
            </div>

            {/* Motivo */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Motivo do Cancelamento</label>
              <textarea
                value={motivoCancelamento}
                onChange={e => setMotivoCancelamento(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo do cancelamento..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-1 pb-1">
              <button
                onClick={() => setCancelando(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Voltar
              </button>
              <button
                onClick={confirmarCancelamento}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ─── Modal: Recibo de Pagamento ───────────────────────────────────── */}
      {modal === 'recibo' && reciboData && (
        <div style={{ position:'fixed',top:0,left:0,width:'100vw',height:'100vh',zIndex:9999,backgroundColor:'rgba(15,23,42,0.6)',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',boxSizing:'border-box' }}>
          <div style={{ backgroundColor:'#fff',borderRadius:'1rem',boxShadow:'0 25px 60px -12px rgba(0,0,0,0.35)',width:'100%',maxWidth:'38rem',maxHeight:'calc(100vh - 2rem)',display:'flex',flexDirection:'column',overflow:'hidden' }}>
            {/* Header */}
            <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.5rem',borderBottom:'1px solid #f1f5f9',flexShrink:0 }}>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h2 style={{ fontSize:'0.9375rem',fontWeight:700,color:'#0f172a',margin:0 }}>Pagamento Confirmado</h2>
              </div>
              <button onClick={() => { setModal(null); setReciboData(null); }} style={{ color:'#94a3b8',background:'none',border:'none',cursor:'pointer',padding:'0.375rem',borderRadius:'0.5rem',display:'flex' }}>
                <X style={{ width:'1.25rem',height:'1.25rem' }} />
              </button>
            </div>
            <div style={{ overflowY:'auto',flex:1,padding:'1.5rem' }}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-7 w-7 text-green-500" />
                </div>
                <p className="text-slate-700 font-semibold">Pagamento registrado com sucesso!</p>
                <p className="text-slate-500 text-sm mt-1">Deseja imprimir o recibo para o hóspede?</p>
              </div>
              {/* Prévia do recibo */}
              <div id="recibo-print" className="border border-slate-200 rounded-xl p-5 bg-white text-sm space-y-3">
                {/* Cabeçalho */}
                <div className="flex items-start justify-between pb-3" style={{ borderBottom:'2px solid #e2e8f0' }}>
                  <div className="flex items-center gap-3">
                    {empresaAtual?.logoUrl && <img src={empresaAtual.logoUrl} alt="Logo" style={{ width:56,height:56,objectFit:'contain' }} />}
                    <div>
                      <p className="font-bold text-slate-900">{empresaAtual?.nome || 'Hotel'}</p>
                      {empresaAtual?.cnpj && <p className="text-slate-500 text-xs">CNPJ: {empresaAtual.cnpj}</p>}
                      {empresaAtual?.endereco && <p className="text-slate-500 text-xs">{empresaAtual.endereco}{empresaAtual?.cidade ? `, ${empresaAtual.cidade}` : ''}{empresaAtual?.estado ? ` - ${empresaAtual.estado}` : ''}</p>}
                      {empresaAtual?.telefone && <p className="text-slate-500 text-xs">Tel: {empresaAtual.telefone}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-700 text-xs uppercase">Recibo de Hospedagem</p>
                    <p className="text-slate-400 text-xs">Nº {reciboData.reservaId?.slice(-6).toUpperCase()}</p>
                    <p className="text-slate-400 text-xs">{reciboData.dataPagamento ? new Date(reciboData.dataPagamento+'T12:00:00').toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {/* Hóspede */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Hóspede</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                    <div><span className="text-slate-500">Nome: </span><span className="font-medium">{reciboData.nomeHospede}</span></div>
                    {reciboData.cpf && <div><span className="text-slate-500">CPF: </span><span className="font-medium">{reciboData.cpf}</span></div>}
                    {reciboData.telefone && <div><span className="text-slate-500">Tel: </span><span className="font-medium">{reciboData.telefone}</span></div>}
                    {reciboData.email && <div><span className="text-slate-500">E-mail: </span><span className="font-medium">{reciboData.email}</span></div>}
                  </div>
                </div>
                {/* Estadia */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Estadia</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
                    <div><span className="text-slate-500">Quarto: </span><span className="font-medium">{reciboData.numeroQuarto}</span></div>
                    <div><span className="text-slate-500">Hóspedes: </span><span className="font-medium">{reciboData.adultos} adulto(s){reciboData.criancas > 0 ? `, ${reciboData.criancas} criança(s)` : ''}</span></div>
                    <div><span className="text-slate-500">Check-in: </span><span className="font-medium">{toDate(reciboData.dataCheckIn) ? format(toDate(reciboData.dataCheckIn),'dd/MM/yyyy',{locale:ptBR}) : '-'}</span></div>
                    <div><span className="text-slate-500">Check-out: </span><span className="font-medium">{toDate(reciboData.dataCheckOut) ? format(toDate(reciboData.dataCheckOut),'dd/MM/yyyy',{locale:ptBR}) : '-'}</span></div>
                  </div>
                </div>
                {/* Valores */}
                <div style={{ borderTop:'1px solid #e2e8f0',paddingTop:'0.75rem' }}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Valores</p>
                  <div className="space-y-0.5 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Diárias:</span><span className="font-medium">{fmt(reciboData.valorBase)}</span></div>
                    {reciboData.valorExtra > 0 && <div className="flex justify-between"><span className="text-slate-500">Valor extra:</span><span className="font-medium text-amber-600">+ {fmt(reciboData.valorExtra)}</span></div>}
                    {reciboData.desconto > 0 && <div className="flex justify-between"><span className="text-slate-500">Desconto:</span><span className="font-medium text-green-600">- {fmt(reciboData.desconto)}</span></div>}
                    <div className="flex justify-between font-bold text-slate-900" style={{ borderTop:'1px solid #e2e8f0',paddingTop:'0.375rem',marginTop:'0.25rem' }}>
                      <span>Total Pago:</span><span className="text-green-600">{fmt(reciboData.valorFinal)}</span>
                    </div>
                  </div>
                </div>
                {/* Pagamento */}
                <div className="text-xs">
                  <span className="text-slate-500">Forma de pagamento: </span>
                  <span className="font-medium">{FORMAS_PAGAMENTO.find(f=>f.value===reciboData.formaPagamento)?.label || reciboData.formaPagamento}</span>
                  {reciboData.parcelas > 1 && <span className="text-slate-500"> — {reciboData.parcelas}x de {fmt(reciboData.valorFinal/reciboData.parcelas)}</span>}
                </div>
                {reciboData.observacoes && <div className="text-xs"><span className="text-slate-500">Obs: </span><span>{reciboData.observacoes}</span></div>}
                {/* Rodapé */}
                <div className="text-center pt-3" style={{ borderTop:'1px dashed #cbd5e1' }}>
                  <p className="text-xs text-slate-400">Obrigado pela preferência!</p>
                  {empresaAtual?.site && <p className="text-xs text-slate-400">{empresaAtual.site}</p>}
                </div>
              </div>
              {/* Botões */}
              <div className="flex gap-3 mt-5">
                <button onClick={() => { setModal(null); setReciboData(null); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Fechar sem imprimir</button>
                <button
                  onClick={() => {
                    const conteudo = document.getElementById('recibo-print').innerHTML;
                    const janela = window.open('','_blank');
                    janela.document.write(`<!DOCTYPE html><html><head><title>Recibo de Hospedagem</title><meta charset="UTF-8"><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Arial,sans-serif;padding:24px;max-width:600px;margin:0 auto;font-size:13px;color:#1e293b}.flex{display:flex}.items-start{align-items:flex-start}.items-center{align-items:center}.justify-between{justify-content:space-between}.text-right{text-align:right}.text-center{text-align:center}.font-bold{font-weight:700}.font-medium{font-weight:500}.text-slate-900{color:#0f172a}.text-slate-700{color:#334155}.text-slate-500{color:#64748b}.text-slate-400{color:#94a3b8}.text-green-600{color:#16a34a}.text-amber-600{color:#d97706}.text-xs{font-size:11px}.text-sm{font-size:12px}.uppercase{text-transform:uppercase}.tracking-wide{letter-spacing:0.05em}.grid{display:grid}.grid-cols-2{grid-template-columns:1fr 1fr}.gap-x-4{column-gap:16px}.gap-y-0\.5{row-gap:2px}.gap-3{gap:12px}.mb-1{margin-bottom:4px}.pb-3{padding-bottom:12px}.pt-3{padding-top:12px}.space-y-0\.5>*+*{margin-top:2px}.space-y-3>*+*{margin-top:12px}@media print{body{padding:10px}}</style></head><body>${conteudo}</body></html>`);
                    janela.document.close();
                    janela.focus();
                    setTimeout(()=>janela.print(),500);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Imprimir Recibo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Cadastro de Banco ─────────────────────────────────────── */}
      {modalBanco && (
        <Modal title={editBancoId ? 'Editar Banco' : 'Cadastrar Banco'} onClose={() => setModalBanco(false)}>
          <div className="space-y-4">
            <Field label="Nome do Banco">
              <input
                type="text"
                value={bancoForm.nome}
                onChange={e => setBancoForm(p => ({ ...p, nome: e.target.value.toUpperCase() }))}
                placeholder="Ex: BRADESCO, ITAÚ, NUBANK..."
                className={inputCls}
                style={{ textTransform: 'uppercase' }}
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Agência">
                <input
                  type="text"
                  value={bancoForm.agencia}
                  onChange={e => setBancoForm(p => ({ ...p, agencia: e.target.value }))}
                  placeholder="0000-0"
                  className={inputCls}
                />
              </Field>
              <Field label="Conta">
                <input
                  type="text"
                  value={bancoForm.conta}
                  onChange={e => setBancoForm(p => ({ ...p, conta: e.target.value }))}
                  placeholder="00000-0"
                  className={inputCls}
                />
              </Field>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModalBanco(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">Cancelar</button>
              <button
                disabled={salvandoBanco || !bancoForm.nome.trim()}
                onClick={async () => {
                  setSalvandoBanco(true);
                  try {
                    if (editBancoId) {
                      await atualizarBanco(editBancoId, bancoForm);
                    } else {
                      const novo = await adicionarBanco(bancoForm);
                      if (novo?.id) setForm(p => ({ ...p, bancoId: novo.id }));
                    }
                    setModalBanco(false);
                  } catch(e) { alert('Erro ao salvar banco: ' + e.message); }
                  finally { setSalvandoBanco(false); }
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition disabled:opacity-50"
              >
                {salvandoBanco ? 'Salvando...' : 'Salvar Banco'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
