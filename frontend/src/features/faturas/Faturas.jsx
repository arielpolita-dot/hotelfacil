import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  Plus, Edit3, Trash2, Calendar, DollarSign, FileText,
  Clock, CheckCircle, AlertCircle, Send, Users, CreditCard, CalendarDays
} from 'lucide-react';
import { useFaturaForm, tiposContrato, statusOptions } from './useFaturaForm';
import { FaturaFormModal } from './FaturaFormModal';
import {
  Button, Badge, SearchInput, StatCard, Card, CardBody,
  Select, PageHeader, EmptyState, DeleteDialog,
} from '../../components/ds';

function Faturas() {
  const { faturas = [], adicionarFatura, atualizarFatura, removerFatura, quartos } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const confirmDelete = (faturaId) => {
    setDeletingId(faturaId);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      await removerFatura(deletingId);
    } catch (error) {
      console.error('Erro ao excluir fatura:', error);
    } finally {
      setDeleteOpen(false);
      setDeletingId(null);
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

  const getTipoColor = (tipo) => ({
    'Mensal': 'bg-blue-500', 'Trimestral': 'bg-green-500', 'Semestral': 'bg-purple-500', 'Anual': 'bg-orange-500',
  }[tipo] || 'bg-slate-500');

  const statusBadgeVariant = (status) => ({
    'Ativo': 'success', 'Suspenso': 'warning', 'Cancelado': 'danger', 'Vencido': 'danger',
  }[status] || 'default');

  const estatisticas = {
    totalContratos: filteredFaturas.length,
    contratosAtivos: filteredFaturas.filter(f => f.status === 'Ativo').length,
    receitaMensal: filteredFaturas.reduce((acc, f) => f.status === 'Ativo' ? acc + f.valorMensal : acc, 0),
    faturasPendentes: filteredFaturas.reduce((acc, f) => acc + (f.faturasPendentes || 0), 0),
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Vendas por Faturas"
        subtitle="Gerencie contratos corporativos e faturamento"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
            Novo Contrato
          </Button>
        }
      />

      {/* Estatisticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 mb-6">
        <StatCard title="Total de Contratos" value={estatisticas.totalContratos} icon={FileText} color="brand" />
        <StatCard title="Contratos Ativos" value={estatisticas.contratosAtivos} icon={CheckCircle} color="success" />
        <StatCard
          title="Receita Mensal"
          value={`R$ ${(estatisticas.receitaMensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign} color="brand"
        />
        <StatCard title="Faturas Pendentes" value={estatisticas.faturasPendentes} icon={Clock} color="warning" />
      </div>

      {/* Filtros */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-wrap gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por empresa ou CNPJ..."
            className="flex-1 min-w-64"
          />
          <Select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="w-auto">
            <option value="">Todos os Tipos</option>
            {tiposContrato.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-auto">
            <option value="">Todos os Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </Card>

      {/* Lista de Contratos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFaturas.map((fatura) => (
          <Card key={fatura.id} className="overflow-hidden hover:shadow-md transition-shadow">
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
            <CardBody>
              <div className="flex justify-between items-center mb-3">
                <Badge variant={statusBadgeVariant(fatura.status)} dot>
                  {fatura.status}
                </Badge>
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
                <Button variant="secondary" size="sm" icon={Edit3} onClick={() => openEdit(fatura)} className="flex-1">
                  Editar
                </Button>
                <Button variant="success" size="sm" icon={Send}>
                  Faturar
                </Button>
                <Button variant="danger" size="sm" icon={Trash2} onClick={() => confirmDelete(fatura.id)}>
                  Excluir
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {filteredFaturas.length === 0 && (
        <EmptyState
          icon={FileText}
          message="Nenhum contrato encontrado"
          subMessage="Comece criando o primeiro contrato corporativo"
          action={{ label: 'Criar Primeiro Contrato', onClick: () => setShowModal(true) }}
        />
      )}

      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingId(null); }}
        onConfirm={handleDelete}
        entityName="contrato"
      />

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
