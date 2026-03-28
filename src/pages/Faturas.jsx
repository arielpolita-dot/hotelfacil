import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Building2, 
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download,
  Send,
  Users,
  CreditCard,
  CalendarDays
} from 'lucide-react';

function Faturas() {
  const { faturas = [], adicionarFatura, atualizarFatura, removerFatura, quartos } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [editingFatura, setEditingFatura] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  
  const [formData, setFormData] = useState({
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
    proximaFatura: '',
    faturasPendentes: 0,
    valorTotal: 0
  });

  const tiposContrato = ['Mensal', 'Trimestral', 'Semestral', 'Anual'];
  const periodicidades = ['Quinzenal', 'Mensal', 'Bimestral', 'Trimestral'];
  const statusOptions = ['Ativo', 'Suspenso', 'Cancelado', 'Vencido'];

  const handleInputChange = (e) => {
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
  };

  const calcularValorTotal = () => {
    const valorMensal = parseFloat(formData.valorMensal) || 0;
    const meses = formData.tipoContrato === 'Mensal' ? 1 :
                  formData.tipoContrato === 'Trimestral' ? 3 :
                  formData.tipoContrato === 'Semestral' ? 6 : 12;
    return valorMensal * meses;
  };

  const calcularProximaFatura = () => {
    if (!formData.dataInicio) return '';
    
    const inicio = new Date(formData.dataInicio);
    const diasPorPeriodo = formData.periodicidadeFatura === 'Quinzenal' ? 15 :
                          formData.periodicidadeFatura === 'Mensal' ? 30 :
                          formData.periodicidadeFatura === 'Bimestral' ? 60 : 90;
    
    const proximaData = new Date(inicio);
    proximaData.setDate(proximaData.getDate() + diasPorPeriodo);
    
    return proximaData.toISOString().split('T')[0];
  };

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      valorTotal: calcularValorTotal(),
      proximaFatura: calcularProximaFatura()
    }));
  }, [formData.valorMensal, formData.tipoContrato, formData.dataInicio, formData.periodicidadeFatura]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const faturaData = {
        ...formData,
        valorMensal: parseFloat(formData.valorMensal),
        valorTotal: calcularValorTotal(),
        proximaFatura: calcularProximaFatura(),
        id: editingFatura?.id || Date.now().toString(),
        dataCriacao: editingFatura?.dataCriacao || new Date().toISOString()
      };

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

  const handleEdit = (fatura) => {
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
      proximaFatura: fatura.proximaFatura,
      faturasPendentes: fatura.faturasPendentes || 0,
      valorTotal: fatura.valorTotal
    });
    setShowModal(true);
  };

  const handleDelete = async (faturaId) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        await removerFatura(faturaId);
      } catch (error) {
        console.error('Erro ao excluir fatura:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
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
      proximaFatura: '',
      faturasPendentes: 0,
      valorTotal: 0
    });
    setEditingFatura(null);
  };

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

  const getStatusColor = (status) => {
    const colors = {
      'Ativo': 'bg-green-100 text-green-800',
      'Suspenso': 'bg-yellow-100 text-yellow-800',
      'Cancelado': 'bg-red-100 text-red-800',
      'Vencido': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Ativo': CheckCircle,
      'Suspenso': AlertCircle,
      'Cancelado': XCircle,
      'Vencido': Clock
    };
    return icons[status] || AlertCircle;
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'Mensal': 'bg-blue-500',
      'Trimestral': 'bg-green-500',
      'Semestral': 'bg-purple-500',
      'Anual': 'bg-orange-500'
    };
    return colors[tipo] || 'bg-gray-500';
  };

  const estatisticas = {
    totalContratos: filteredFaturas.length,
    contratosAtivos: filteredFaturas.filter(f => f.status === 'Ativo').length,
    receitaMensal: filteredFaturas.reduce((acc, f) => f.status === 'Ativo' ? acc + f.valorMensal : acc, 0),
    faturasPendentes: filteredFaturas.reduce((acc, f) => acc + (f.faturasPendentes || 0), 0)
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Vendas por Faturas</h1>
          <p className="text-gray-600">Gerencie contratos corporativos e faturamento</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Contrato
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Contratos</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalContratos}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contratos Ativos</p>
              <p className="text-2xl font-bold text-green-600">{estatisticas.contratosAtivos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Receita Mensal</p>
              <p className="text-2xl font-bold text-blue-600">
                R$ {(estatisticas.receitaMensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Faturas Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{estatisticas.faturasPendentes}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por empresa ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os Tipos</option>
            {tiposContrato.map(tipo => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de Contratos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFaturas.map((fatura) => {
          const StatusIcon = getStatusIcon(fatura.status);
          
          return (
            <div key={fatura.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Header do Card */}
              <div className={`${getTipoColor(fatura.tipoContrato)} p-4 text-white`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{fatura.empresaCliente}</h3>
                    <p className="text-sm opacity-90">CNPJ: {fatura.cnpj}</p>
                    <p className="text-sm opacity-90">Contato: {fatura.contato}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm opacity-90">{fatura.tipoContrato}</p>
                    <p className="text-lg font-bold">R$ {(fatura.valorMensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</p>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(fatura.status)}`}>
                    <StatusIcon className="h-3 w-3" />
                    {fatura.status}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Valor Total</p>
                    <p className="font-bold text-gray-900">R$ {(fatura.valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Informações do Contrato */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Período: {fatura.dataInicio ? new Date(fatura.dataInicio).toLocaleDateString('pt-BR') : '-'} - {fatura.dataFim ? new Date(fatura.dataFim).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    <span>Faturamento: {fatura.periodicidadeFatura}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="h-4 w-4" />
                    <span>Próxima Fatura: {fatura.proximaFatura ? new Date(fatura.proximaFatura).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>Quartos: {fatura.quartosInclusos?.length || 0} inclusos</span>
                  </div>
                </div>

                {/* Alertas */}
                {fatura.faturasPendentes > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {fatura.faturasPendentes} fatura(s) pendente(s)
                      </span>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(fatura)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                  
                  <button className="bg-green-50 hover:bg-green-100 text-green-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Send className="h-4 w-4" />
                    Faturar
                  </button>
                  
                  <button
                    onClick={() => handleDelete(fatura.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFaturas.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato encontrado</h3>
          <p className="text-gray-500 mb-4">
            Comece criando o primeiro contrato corporativo
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Criar Primeiro Contrato
          </button>
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingFatura ? 'Editar Contrato' : 'Novo Contrato Corporativo'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados da Empresa */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Dados da Empresa Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Empresa *
                    </label>
                    <input
                      type="text"
                      name="empresaCliente"
                      value={formData.empresaCliente}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      required
                      placeholder="00.000.000/0000-00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pessoa de Contato *
                    </label>
                    <input
                      type="text"
                      name="contato"
                      value={formData.contato}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="tel"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      name="endereco"
                      value={formData.endereco}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Dados do Contrato */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Dados do Contrato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contrato *
                    </label>
                    <select
                      name="tipoContrato"
                      value={formData.tipoContrato}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {tiposContrato.map(tipo => (
                        <option key={tipo} value={tipo}>{tipo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Periodicidade da Fatura *
                    </label>
                    <select
                      name="periodicidadeFatura"
                      value={formData.periodicidadeFatura}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {periodicidades.map(periodo => (
                        <option key={periodo} value={periodo}>{periodo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Início *
                    </label>
                    <input
                      type="date"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data de Fim *
                    </label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Mensal (R$) *
                    </label>
                    <input
                      type="number"
                      name="valorMensal"
                      value={formData.valorMensal}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quartos Inclusos */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Quartos Inclusos no Contrato</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto border rounded-lg p-4">
                  {quartos.map((quarto) => (
                    <label key={quarto.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="quartosInclusos"
                        value={quarto.numero}
                        checked={formData.quartosInclusos.includes(quarto.numero)}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Quarto {quarto.numero}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Resumo Financeiro</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Valor Mensal</p>
                    <p className="text-lg font-bold text-blue-600">
                      R$ {parseFloat(formData.valorMensal || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor Total do Contrato</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {(calcularValorTotal() || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Próxima Fatura</p>
                    <p className="text-lg font-bold text-orange-600">
                      {formData.proximaFatura ? new Date(formData.proximaFatura).toLocaleDateString('pt-BR') : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais sobre o contrato..."
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingFatura ? 'Atualizar' : 'Criar'} Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Faturas;
