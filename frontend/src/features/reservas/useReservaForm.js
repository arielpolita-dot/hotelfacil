import { useState } from 'react';
import { toDate } from '../../utils/dateUtils';
import { format } from 'date-fns';
import { EMPTY_FORM } from './constants';

export function useReservaForm({ quartos, adicionarReserva, atualizarReserva, adicionarFatura }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [editReserva, setEditReserva] = useState(null);
  const [saving, setSaving] = useState(false);
  const [useCnpj, setUseCnpj] = useState(false);

  const set = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }));
  const setVal = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const setUpper = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value.toUpperCase() }));
  const setMasked = (f, maskFn) => (e) => setForm(p => ({ ...p, [f]: maskFn(e.target.value) }));

  const abrirNovo = (setModal) => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setEditReserva(null);
    setModal('form');
  };

  const abrirEditar = (r, setModal) => {
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

  const abrirPagamento = (r, setModal) => {
    setForm({
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
      dataPagamento: r.dataPagamento
        ? (toDate(r.dataPagamento) ? format(toDate(r.dataPagamento), 'yyyy-MM-dd') : r.dataPagamento)
        : (toDate(r.dataCheckOut) ? format(toDate(r.dataCheckOut), 'yyyy-MM-dd') : ''),
      bancoId: r.bancoId || '',
    });
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

  const salvar = async (setModal) => {
    setSaving(true);
    try {
      const dados = { ...form };
      dados.valorTotal = parseFloat(form.valorTotal) || 0;
      dados.adultos = parseInt(form.adultos) || 1;
      dados.criancas = parseInt(form.criancas) || 0;
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

  const salvarPagamento = async (setModal, setReciboData) => {
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
      if (form.formaPagamento === 'faturado') {
        dados.faturadoCnpj = form.faturadoCnpj;
        dados.faturadoEmpresa = form.faturadoEmpresa;
        dados.faturadoContato = form.faturadoContato;
        dados.faturadoEndereco = form.faturadoEndereco;
        dados.isFaturado = true;
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

  return {
    form, setForm, editId, editReserva, saving, useCnpj, setUseCnpj,
    set, setVal, setUpper, setMasked,
    abrirNovo, abrirEditar, abrirPagamento,
    calcularValor, salvar, salvarPagamento,
    isCartao, calcularValorFinal,
  };
}
