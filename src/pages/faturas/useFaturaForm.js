import { useState, useMemo, useCallback } from 'react';

const INITIAL_FORM = {
  empresaCliente: '',
  cnpj: '',
  contato: '',
  email: '',
  telefone: '',
  endereco: '',
  tipoContrato: 'Mensal',
  dataInicio: '',
  dataFim: '',
  periodicidadeFatura: 'Mensal',
  valorMensal: '',
  quartosInclusos: [],
  observacoes: '',
  status: 'Ativo',
};

export const tiposContrato = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];
export const periodicidades = ['Quinzenal', 'Mensal', 'Bimestral', 'Trimestral'];
export const statusOptions = ['Ativo', 'Suspenso', 'Cancelado', 'Vencido'];

function calcularValorTotal(valorMensal, tipoContrato) {
  const v = parseFloat(valorMensal) || 0;
  const meses = tipoContrato === 'Mensal' ? 1 :
                tipoContrato === 'Trimestral' ? 3 :
                tipoContrato === 'Semestral' ? 6 : 12;
  return v * meses;
}

function calcularProximaFatura(dataInicio, periodicidadeFatura) {
  if (!dataInicio) return '';
  const inicio = new Date(dataInicio);
  const dias = periodicidadeFatura === 'Quinzenal' ? 15 :
               periodicidadeFatura === 'Mensal' ? 30 :
               periodicidadeFatura === 'Bimestral' ? 60 : 90;
  const proxima = new Date(inicio);
  proxima.setDate(proxima.getDate() + dias);
  return proxima.toISOString().split('T')[0];
}

export function useFaturaForm() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingFatura, setEditingFatura] = useState(null);

  const valorTotal = useMemo(
    () => calcularValorTotal(formData.valorMensal, formData.tipoContrato),
    [formData.valorMensal, formData.tipoContrato]
  );

  const proximaFatura = useMemo(
    () => calcularProximaFatura(formData.dataInicio, formData.periodicidadeFatura),
    [formData.dataInicio, formData.periodicidadeFatura]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'quartosInclusos') {
      const quartoId = parseInt(value);
      setFormData(prev => ({
        ...prev,
        quartosInclusos: checked
          ? [...prev.quartosInclusos, quartoId]
          : prev.quartosInclusos.filter(id => id !== quartoId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  }, []);

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM);
    setEditingFatura(null);
  }, []);

  const handleEdit = useCallback((fatura) => {
    setEditingFatura(fatura);
    setFormData({
      empresaCliente: fatura.empresaCliente,
      cnpj: fatura.cnpj,
      contato: fatura.contato,
      email: fatura.email,
      telefone: fatura.telefone,
      endereco: fatura.endereco,
      tipoContrato: fatura.tipoContrato,
      dataInicio: fatura.dataInicio,
      dataFim: fatura.dataFim,
      periodicidadeFatura: fatura.periodicidadeFatura,
      valorMensal: fatura.valorMensal.toString(),
      quartosInclusos: fatura.quartosInclusos || [],
      observacoes: fatura.observacoes || '',
      status: fatura.status,
    });
  }, []);

  const buildFaturaData = useCallback(() => ({
    ...formData,
    valorMensal: parseFloat(formData.valorMensal),
    valorTotal,
    proximaFatura,
    faturasPendentes: editingFatura?.faturasPendentes || 0,
    id: editingFatura?.id || Date.now().toString(),
    dataCriacao: editingFatura?.dataCriacao || new Date().toISOString(),
  }), [formData, valorTotal, proximaFatura, editingFatura]);

  return {
    formData,
    editingFatura,
    valorTotal,
    proximaFatura,
    handleInputChange,
    resetForm,
    handleEdit,
    buildFaturaData,
  };
}
