import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HybridHotelContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Bed, 
  Wifi, 
  Car, 
  Coffee,
  Tv,
  Wind,
  Bath,
  Users,
  DollarSign,
  MapPin,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';

function Quartos() {
  const { quartos, adicionarQuarto, atualizarQuarto, removerQuarto } = useHotel();
  const [showModal, setShowModal] = useState(false);
  const [editingQuarto, setEditingQuarto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const [formData, setFormData] = useState({
    numero: '',
    tipo: 'Standard',
    andar: '',
    capacidade: 2,
    preco: '',
    status: 'Disponível',
    descricao: '',
    caracteristicas: {
      wifi: true,
      arCondicionado: true,
      tv: true,
      frigobar: false,
      banheira: false,
      varanda: false,
      estacionamento: false,
      cafe: false
    },
    imagens: []
  });

  const tiposQuarto = ['Standard', 'Deluxe', 'Suíte', 'Presidencial', 'Triplo', 'Família'];
  const statusOptions = ['Disponível', 'Ocupado', 'Manutenção', 'Limpeza', 'Fora de Serviço'];

  const caracteristicasDisponiveis = [
    { key: 'wifi', label: 'Wi-Fi', icon: Wifi },
    { key: 'arCondicionado', label: 'Ar Condicionado', icon: Wind },
    { key: 'tv', label: 'TV', icon: Tv },
    { key: 'frigobar', label: 'Frigobar', icon: Coffee },
    { key: 'banheira', label: 'Banheira', icon: Bath },
    { key: 'varanda', label: 'Varanda', icon: MapPin },
    { key: 'estacionamento', label: 'Estacionamento', icon: Car },
    { key: 'cafe', label: 'Café da Manhã', icon: Coffee }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('caracteristicas.')) {
      const caracteristica = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        caracteristicas: {
          ...prev.caracteristicas,
          [caracteristica]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const quartoData = {
        ...formData,
        numero: parseInt(formData.numero),
        andar: parseInt(formData.andar),
        capacidade: parseInt(formData.capacidade),
        preco: parseFloat(formData.preco),
        id: editingQuarto?.id || Date.now().toString()
      };

      if (editingQuarto) {
        await atualizarQuarto(editingQuarto.id, quartoData);
      } else {
        await adicionarQuarto(quartoData);
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar quarto:', error);
    }
  };

  const handleEdit = (quarto) => {
    console.log('Editando quarto:', quarto);
    console.log('Abrindo modal...');
    
    try {
      setEditingQuarto(quarto);
      console.log('EditingQuarto definido');
      
      setFormData({
        numero: quarto.numero?.toString() || '',
        tipo: quarto.tipo || 'Standard',
        andar: quarto.andar?.toString() || '1',
        capacidade: quarto.capacidade || 2,
        preco: quarto.preco?.toString() || '0',
        status: quarto.status || 'Disponível',
        descricao: quarto.descricao || '',
        caracteristicas: quarto.caracteristicas || {
          wifi: true,
          arCondicionado: true,
          tv: true,
          frigobar: false,
          banheira: false,
          varanda: false,
          estacionamento: false,
          cafe: false
        },
        imagens: quarto.imagens || []
      });
      console.log('FormData definido');
      
      setShowModal(true);
      console.log('Modal deve estar aberto agora');
    } catch (error) {
      console.error('Erro ao editar quarto:', error);
    }
  };

  const handleDelete = async (quartoId) => {
    if (window.confirm('Tem certeza que deseja excluir este quarto?')) {
      try {
        await removerQuarto(quartoId);
      } catch (error) {
        console.error('Erro ao excluir quarto:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      tipo: 'Standard',
      andar: '',
      capacidade: 2,
      preco: '',
      status: 'Disponível',
      descricao: '',
      caracteristicas: {
        wifi: true,
        arCondicionado: true,
        tv: true,
        frigobar: false,
        banheira: false,
        varanda: false,
        estacionamento: false,
        cafe: false
      },
      imagens: []
    });
    setEditingQuarto(null);
  };

  const filteredQuartos = quartos.filter(quarto => {
    const matchesSearch = quarto.numero.toString().includes(searchTerm) || 
                         quarto.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !filterTipo || quarto.tipo === filterTipo;
    const matchesStatus = !filterStatus || quarto.status === filterStatus;
    
    return matchesSearch && matchesTipo && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Disponível': 'bg-green-100 text-green-800',
      'Ocupado': 'bg-red-100 text-red-800',
      'Manutenção': 'bg-yellow-100 text-yellow-800',
      'Limpeza': 'bg-blue-100 text-blue-800',
      'Fora de Serviço': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'Standard': 'bg-blue-500',
      'Deluxe': 'bg-purple-500',
      'Suíte': 'bg-green-500',
      'Presidencial': 'bg-yellow-500',
      'Triplo': 'bg-indigo-500',
      'Família': 'bg-pink-500'
    };
    return colors[tipo] || 'bg-gray-500';
  };

  return (
    <div className="p-3 lg:p-6">
      {/* Header */}
      <div className="pt-12 lg:pt-0 mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">Gestão de Quartos</h1>
            <p className="text-gray-600 text-sm lg:text-base">Cadastre e gerencie os quartos do hotel</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm lg:text-base"
          >
            <Plus className="h-4 w-4 lg:h-5 lg:w-5" />
            Novo Quarto
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-4 lg:mb-6">
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Total de Quartos</p>
              <p className="text-xl lg:text-2xl font-bold text-gray-900">{quartos.length}</p>
            </div>
            <Bed className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Disponíveis</p>
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                {quartos.filter(q => q.status === 'Disponível').length}
              </p>
            </div>
            <div className="h-6 w-6 lg:h-8 lg:w-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 lg:h-4 lg:w-4 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Ocupados</p>
              <p className="text-xl lg:text-2xl font-bold text-red-600">
                {quartos.filter(q => q.status === 'Ocupado').length}
              </p>
            </div>
            <div className="h-6 w-6 lg:h-8 lg:w-8 bg-red-100 rounded-full flex items-center justify-center">
              <div className="h-3 w-3 lg:h-4 lg:w-4 bg-red-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 lg:p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs lg:text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-xl lg:text-2xl font-bold text-blue-600">
                R$ {quartos.length > 0 ? (quartos.reduce((acc, q) => acc + q.preco, 0) / quartos.length).toFixed(0) : '0'}
              </p>
            </div>
            <DollarSign className="h-6 w-6 lg:h-8 lg:w-8 text-blue-600" />
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
                placeholder="Buscar por número ou tipo..."
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
            {tiposQuarto.map(tipo => (
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

      {/* Lista de Quartos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuartos.map((quarto) => (
          <div key={quarto.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
            {/* Header do Card */}
            <div className={`${getTipoColor(quarto.tipo)} p-4 text-white`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Quarto {quarto.numero}</h3>
                  <p className="text-sm opacity-90">{quarto.tipo}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm opacity-90">Andar {quarto.andar}</p>
                  <p className="text-lg font-bold">R$ {quarto.preco}</p>
                </div>
              </div>
            </div>

            {/* Conteúdo do Card */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quarto.status)}`}>
                  {quarto.status}
                </span>
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">{quarto.capacidade} pessoas</span>
                </div>
              </div>

              {quarto.descricao && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{quarto.descricao}</p>
              )}

              {/* Características */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.entries(quarto.caracteristicas || {}).map(([key, value]) => {
                  if (!value) return null;
                  const caracteristica = caracteristicasDisponiveis.find(c => c.key === key);
                  if (!caracteristica) return null;
                  const Icon = caracteristica.icon;
                  
                  return (
                    <div key={key} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs">
                      <Icon className="h-3 w-3" />
                      <span>{caracteristica.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Ações */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(quarto)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(quarto.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredQuartos.length === 0 && (
        <div className="text-center py-12">
          <Bed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum quarto encontrado</h3>
          <p className="text-gray-500 mb-4">
            {quartos.length === 0 
              ? 'Comece cadastrando o primeiro quarto do hotel'
              : 'Tente ajustar os filtros de busca'
            }
          </p>
          {quartos.length === 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Cadastrar Primeiro Quarto
            </button>
          )}
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingQuarto ? 'Editar Quarto' : 'Novo Quarto'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número do Quarto *
                  </label>
                  <input
                    type="number"
                    name="numero"
                    value={formData.numero}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Quarto *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {tiposQuarto.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Andar *
                  </label>
                  <input
                    type="number"
                    name="andar"
                    value={formData.andar}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidade *
                  </label>
                  <input
                    type="number"
                    name="capacidade"
                    value={formData.capacidade}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço por Noite (R$) *
                  </label>
                  <input
                    type="number"
                    name="preco"
                    value={formData.preco}
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

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva as características especiais do quarto..."
                />
              </div>

              {/* Características */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Características e Comodidades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {caracteristicasDisponiveis.map((caracteristica) => {
                    const Icon = caracteristica.icon;
                    return (
                      <label key={caracteristica.key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name={`caracteristicas.${caracteristica.key}`}
                          checked={formData.caracteristicas[caracteristica.key]}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="text-sm text-gray-700">{caracteristica.label}</span>
                      </label>
                    );
                  })}
                </div>
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
                  {editingQuarto ? 'Atualizar' : 'Cadastrar'} Quarto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quartos;
