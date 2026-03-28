import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  Plus, Search, Edit3, Trash2, Calendar, DollarSign, FileText,
  Clock, CheckCircle, AlertCircle, XCircle, Send, Users, CreditCard, CalendarDays
} from 'lucide-react';
import { useFaturaForm, tiposContrato, statusOptions } from './useFaturaForm';
import { FaturaFormModal } from './FaturaFormModal';

function Faturas() {
  const { faturas = [], adicionarFatura, atualizarFatura, removerFatura, quartos } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');

  const {
    formData, editingFatura, valorTotal, proximaFatura,
    handleInputChange, resetForm, handleEdit, buildFaturaData,
  } = useFaturaForm();

  const handleSave = async () => {
    try {
      const faturaData = buildFaturaData();
      if (editingFatura) {
        await atualizarFatura(editingFatura.id, faturaData);
      } else {
        await adicionarFatura(faturaData);
      }
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar fatura:', error);
    }
  };

  const openEdit = (fatura) => {
    handleEdit(fatura);
    setShowModal(true);
  };

  const handleDelete = async (faturaId) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try { await removerFatura(faturaId); } catch (error) { console.error('Erro ao excluir fatura:', error); }
    }
  };

  const closeModal = () => { setShowModal(false); resetForm(); };

  const filteredFaturas = faturas.filter(fatura => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      (fatura.empresaCliente || '').toLowerCase().includes(searchLower) ||
      (fatura.cnpj || '').includes(searchTerm) ||
      (fatura.descricao || '').toLowerCase().includes(searchLower);
    const matchesStatus = !filterStatus || fatura.status === filterStatus;
    const matchesTipo = !filterTipo || fatura.tipoContrato === filterTipo;
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusColor = (status) => ({
    'Ativo': 'bg-green-100 text-green-800', 'Suspenso': 'bg-yellow-100 text-yellow-800',
    'Cancelado': 'bg-red-100 text-red-800', 'Vencido': 'bg-red-100 text-red-800',
  }[status] || 'bg-slate-100 text-slate-800');

  const getStatusIcon = (status) => ({
    'Ativo': CheckCircle, 'Suspenso': AlertCircle, 'Cancelado': XCircle, 'Vencido': Clock,
  }[status] || AlertCircle);

  const getTipoColor = (tipo) => ({
    'Mensal': 'bg-blue-500', 'Trimestral': 'bg-green-500', 'Semestral': 'bg-purple-500', 'Anual': 'bg-orange-500',
  }[tipo] || 'bg-slate-500');

  const estatisticas = {
    totalContratos: filteredFaturas.length,
    contratosAtivos: filteredFaturas.filter(f => f.status === 'Ativo').length,
    receitaMensal: filteredFaturas.reduce((acc, f) => f.status === 'Ativo' ? acc + f.valorMensal : acc, 0),
    faturasPendentes: filteredFaturas.reduce((acc, f) => acc + (f.faturasPendentes || 0), 0),
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Vendas por Faturas</h1>
          <p className="text-slate-600">Gerencie contratos corporativos e faturamento</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-5 w-5" /> Novo Contrato
        </button>
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total de Contratos', value: estatisticas.totalContratos, icon: FileText, color: 'text-blue-600' },
          { label: 'Contratos Ativos', value: estatisticas.contratosAtivos, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Receita Mensal', value: `R$ ${(estatisticas.receitaMensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-blue-600' },
          { label: 'Faturas Pendentes', value: estatisticas.faturasPendentes, icon: Clock, color: 'text-orange-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input type="text" placeholder="Buscar por empresa ou CNPJ..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os Tipos</option>
            {tiposContrato.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFaturas.map((fatura) => {
          const StatusIcon = getStatusIcon(fatura.status);
          return (
            <div key={fatura.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              <div className={`${getTipoColor(fatura.tipoContrato)} p-4 text-white`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{fatura.empresaCliente}</h3>
                    <p className="text-sm opacity-90">CNPJ: {fatura.cnpj}</p>
                    <p className="text-sm opacity-90">Contato: {fatura.contato}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">{fatura.tipoContrato}</p>
                    <p className="text-lg font-bold">R$ {(fatura.valorMensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mes</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(fatura.status)}`}>
                    <StatusIcon className="h-3 w-3" /> {fatura.status}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Valor Total</p>
                    <p className="font-bold text-slate-900">R$ {(fatura.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Periodo: {fatura.dataInicio ? new Date(fatura.dataInicio).toLocaleDateString('pt-BR') : '-'} - {fatura.dataFim ? new Date(fatura.dataFim).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CreditCard className="h-4 w-4" /><span>Faturamento: {fatura.periodicidadeFatura}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4" />
                    <span>Proxima Fatura: {fatura.proximaFatura ? new Date(fatura.proximaFatura).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" /><span>Quartos: {fatura.quartosInclusos?.length || 0} inclusos</span>
                  </div>
                </div>
                {fatura.faturasPendentes > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">{fatura.faturasPendentes} fatura(s) pendente(s)</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => openEdit(fatura)} className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Edit3 className="h-4 w-4" /> Editar
                  </button>
                  <button className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Send className="h-4 w-4" /> Faturar
                  </button>
                  <button onClick={() => handleDelete(fatura.id)} className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Trash2 className="h-4 w-4" /> Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFaturas.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum contrato encontrado</h3>
          <p className="text-slate-500 mb-4">Comece criando o primeiro contrato corporativo</p>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <Plus className="h-5 w-5" /> Criar Primeiro Contrato
          </button>
        </div>
      )}

      <FaturaFormModal
        open={showModal} onClose={closeModal} onSave={handleSave}
        editingFatura={editingFatura} formData={formData}
        handleInputChange={handleInputChange} valorTotal={valorTotal}
        proximaFatura={proximaFatura} quartos={quartos}
      />
    </div>
  );
}

export default Faturas;
