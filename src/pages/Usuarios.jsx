import React, { useState, useEffect } from 'react';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  User, 
  Shield,
  ShieldCheck,
  ShieldAlert,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Key,
  Settings,
  Crown,
  UserCheck,
  Users
} from 'lucide-react';

function Usuarios() {
  const { usuarios = [], adicionarUsuario, atualizarUsuario, removerUsuario } = useHotel();
  const { currentUser, empresaAtual } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
    role: 'Recepcionista',
    status: 'Ativo',
    permissoes: {
      dashboard: true,
      disponibilidade: true,
      quartos: false,
      vendas: true,
      faturas: false,
      despesas: false,
      fluxoCaixa: false,
      usuarios: false,
      configuracoes: false
    },
    observacoes: ''
  });

  const roles = [
    { value: 'Admin', label: 'Administrador', icon: Crown, color: 'text-purple-600' },
    { value: 'Gerente', label: 'Gerente', icon: ShieldCheck, color: 'text-blue-600' },
    { value: 'Recepcionista', label: 'Recepcionista', icon: UserCheck, color: 'text-green-600' },
    { value: 'Financeiro', label: 'Financeiro', icon: Shield, color: 'text-orange-600' },
    { value: 'Manutencao', label: 'Manutenção', icon: Settings, color: 'text-gray-600' }
  ];

  const statusOptions = ['Ativo', 'Inativo', 'Suspenso'];

  const permissoesDisponiveis = [
    { key: 'dashboard', label: 'Dashboard', description: 'Visualizar painel principal' },
    { key: 'disponibilidade', label: 'Disponibilidade', description: 'Ver disponibilidade de quartos' },
    { key: 'quartos', label: 'Quartos', description: 'Cadastrar e gerenciar quartos' },
    { key: 'vendas', label: 'Vendas', description: 'Realizar reservas e vendas' },
    { key: 'faturas', label: 'Faturas', description: 'Gerenciar contratos corporativos' },
    { key: 'despesas', label: 'Despesas', description: 'Cadastrar e gerenciar despesas' },
    { key: 'fluxoCaixa', label: 'Fluxo de Caixa', description: 'Visualizar relatórios financeiros' },
    { key: 'usuarios', label: 'Usuários', description: 'Gerenciar usuários do sistema' },
    { key: 'configuracoes', label: 'Configurações', description: 'Alterar configurações do sistema' }
  ];

  const getPermissoesPorRole = (role) => {
    const permissoesPadrao = {
      'Admin': {
        dashboard: true,
        disponibilidade: true,
        quartos: true,
        vendas: true,
        faturas: true,
        despesas: true,
        fluxoCaixa: true,
        usuarios: true,
        configuracoes: true
      },
      'Gerente': {
        dashboard: true,
        disponibilidade: true,
        quartos: true,
        vendas: true,
        faturas: true,
        despesas: true,
        fluxoCaixa: true,
        usuarios: false,
        configuracoes: false
      },
      'Recepcionista': {
        dashboard: true,
        disponibilidade: true,
        quartos: false,
        vendas: true,
        faturas: false,
        despesas: false,
        fluxoCaixa: false,
        usuarios: false,
        configuracoes: false
      },
      'Financeiro': {
        dashboard: true,
        disponibilidade: false,
        quartos: false,
        vendas: false,
        faturas: true,
        despesas: true,
        fluxoCaixa: true,
        usuarios: false,
        configuracoes: false
      },
      'Manutencao': {
        dashboard: true,
        disponibilidade: true,
        quartos: true,
        vendas: false,
        faturas: false,
        despesas: true,
        fluxoCaixa: false,
        usuarios: false,
        configuracoes: false
      }
    };
    
    return permissoesPadrao[role] || permissoesPadrao['Recepcionista'];
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissoes.')) {
      const permissao = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissoes: {
          ...prev.permissoes,
          [permissao]: checked
        }
      }));
    } else if (name === 'role') {
      // Atualizar permissões automaticamente baseado no role
      const novasPermissoes = getPermissoesPorRole(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        permissoes: novasPermissoes
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
    
    // Validações
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }

    if (!editingUsuario && formData.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    try {
      const usuarioData = {
        ...formData,
        id: editingUsuario?.id || Date.now().toString(),
        empresaId: empresaAtual?.id,
        dataCriacao: editingUsuario?.dataCriacao || new Date().toISOString(),
        ultimoLogin: editingUsuario?.ultimoLogin || null,
        criadoPor: currentUser?.id
      };

      // Remover campos de confirmação
      delete usuarioData.confirmarSenha;

      if (editingUsuario) {
        // Se não alterou a senha, manter a atual
        if (!formData.senha) {
          delete usuarioData.senha;
        }
        await atualizarUsuario(editingUsuario.id, usuarioData);
      } else {
        await adicionarUsuario(usuarioData);
      }

      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário');
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || '',
      senha: '',
      confirmarSenha: '',
      role: usuario.role,
      status: usuario.status,
      permissoes: usuario.permissoes || getPermissoesPorRole(usuario.role),
      observacoes: usuario.observacoes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (usuarioId) => {
    if (usuarioId === currentUser?.id) {
      alert('Você não pode excluir seu próprio usuário');
      return;
    }

    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await removerUsuario(usuarioId);
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      confirmarSenha: '',
      role: 'Recepcionista',
      status: 'Ativo',
      permissoes: getPermissoesPorRole('Recepcionista'),
      observacoes: ''
    });
    setEditingUsuario(null);
    setShowPassword(false);
  };

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || usuario.role === filterRole;
    const matchesStatus = !filterStatus || usuario.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusColor = (status) => {
    const colors = {
      'Ativo': 'bg-green-100 text-green-800',
      'Inativo': 'bg-gray-100 text-gray-800',
      'Suspenso': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Ativo': CheckCircle,
      'Inativo': XCircle,
      'Suspenso': AlertCircle
    };
    return icons[status] || AlertCircle;
  };

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[2]; // Default para Recepcionista
  };

  const estatisticas = {
    totalUsuarios: filteredUsuarios.length,
    usuariosAtivos: filteredUsuarios.filter(u => u.status === 'Ativo').length,
    usuariosInativos: filteredUsuarios.filter(u => u.status === 'Inativo').length,
    usuariosSuspensos: filteredUsuarios.filter(u => u.status === 'Suspenso').length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h1>
          <p className="text-gray-600">Gerencie usuários e permissões do sistema</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Novo Usuário
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{estatisticas.totalUsuarios}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-2xl font-bold text-green-600">{estatisticas.usuariosAtivos}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Inativos</p>
              <p className="text-2xl font-bold text-gray-600">{estatisticas.usuariosInativos}</p>
            </div>
            <XCircle className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Suspensos</p>
              <p className="text-2xl font-bold text-red-600">{estatisticas.usuariosSuspensos}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
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
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as Funções</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
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

      {/* Lista de Usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsuarios.map((usuario) => {
          const StatusIcon = getStatusIcon(usuario.status);
          const roleInfo = getRoleInfo(usuario.role);
          const RoleIcon = roleInfo.icon;
          
          return (
            <div key={usuario.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
              {/* Header do Card */}
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{usuario.nome}</h3>
                      <p className="text-sm text-gray-600">{usuario.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} bg-opacity-10`}>
                      <RoleIcon className="h-3 w-3" />
                      {roleInfo.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Card */}
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(usuario.status)}`}>
                    <StatusIcon className="h-3 w-3" />
                    {usuario.status}
                  </span>
                  {usuario.id === currentUser?.id && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      Você
                    </span>
                  )}
                </div>

                {/* Informações do Usuário */}
                <div className="space-y-2 mb-4">
                  {usuario.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{usuario.telefone}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em: {usuario.dataCriacao ? new Date(usuario.dataCriacao).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  
                  {usuario.ultimoLogin && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Último login: {usuario.ultimoLogin ? new Date(usuario.ultimoLogin).toLocaleDateString('pt-BR') : '-'}</span>
                    </div>
                  )}
                </div>

                {/* Permissões */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Permissões:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(usuario.permissoes || {}).map(([key, value]) => {
                      if (!value) return null;
                      const permissao = permissoesDisponiveis.find(p => p.key === key);
                      if (!permissao) return null;
                      
                      return (
                        <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {permissao.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(usuario)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </button>
                  
                  {usuario.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDelete(usuario.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsuarios.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
          <p className="text-gray-500 mb-4">
            Comece cadastrando o primeiro usuário do sistema
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Cadastrar Primeiro Usuário
          </button>
        </div>
      )}

      {/* Modal de Cadastro/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingUsuario ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Dados Pessoais */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
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

              {/* Dados de Acesso */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Dados de Acesso</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {editingUsuario ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="senha"
                        value={formData.senha}
                        onChange={handleInputChange}
                        required={!editingUsuario}
                        minLength="6"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirmar Senha {!editingUsuario && '*'}
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      required={!editingUsuario}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Função e Permissões */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Função e Permissões</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Função *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissões do Sistema
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                    {permissoesDisponiveis.map((permissao) => (
                      <label key={permissao.key} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name={`permissoes.${permissao.key}`}
                          checked={formData.permissoes[permissao.key]}
                          onChange={handleInputChange}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-700">{permissao.label}</span>
                          <p className="text-xs text-gray-500">{permissao.description}</p>
                        </div>
                      </label>
                    ))}
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
                  placeholder="Informações adicionais sobre o usuário..."
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
                  {editingUsuario ? 'Atualizar' : 'Cadastrar'} Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default Usuarios;
