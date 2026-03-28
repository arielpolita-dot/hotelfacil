import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { useAuth } from '../context/AuthContext';
import {
  Plus, Search, Edit3, Trash2, User, Phone, Calendar,
  CheckCircle, XCircle, AlertCircle, Users
} from 'lucide-react';
import { roles, statusOptions, permissoesDisponiveis, getPermissoesPorRole } from './usuarios/permissions';
import { UsuarioFormModal } from './usuarios/UsuarioFormModal';

function Usuarios() {
  const { usuarios = [], adicionarUsuario, atualizarUsuario, removerUsuario } = useHotel();
  const { currentUser, empresaAtual } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', senha: '', confirmarSenha: '',
    role: 'Recepcionista', status: 'Ativo',
    permissoes: getPermissoesPorRole('Recepcionista'), observacoes: '',
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('permissoes.')) {
      const permissao = name.split('.')[1];
      setFormData(prev => ({ ...prev, permissoes: { ...prev.permissoes, [permissao]: checked } }));
    } else if (name === 'role') {
      setFormData(prev => ({ ...prev, [name]: value, permissoes: getPermissoesPorRole(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleSave = async () => {
    if (formData.senha !== formData.confirmarSenha) { alert('As senhas nao coincidem'); return; }
    if (!editingUsuario && formData.senha.length < 6) { alert('A senha deve ter pelo menos 6 caracteres'); return; }
    try {
      const usuarioData = {
        ...formData, id: editingUsuario?.id || Date.now().toString(),
        empresaId: empresaAtual?.id,
        dataCriacao: editingUsuario?.dataCriacao || new Date().toISOString(),
        ultimoLogin: editingUsuario?.ultimoLogin || null,
        criadoPor: currentUser?.id,
      };
      delete usuarioData.confirmarSenha;
      if (editingUsuario) {
        if (!formData.senha) delete usuarioData.senha;
        await atualizarUsuario(editingUsuario.id, usuarioData);
      } else {
        await adicionarUsuario(usuarioData);
      }
      resetForm(); setShowModal(false);
    } catch (error) { console.error('Erro ao salvar usuario:', error); alert('Erro ao salvar usuario'); }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nome: usuario.nome, email: usuario.email, telefone: usuario.telefone || '',
      senha: '', confirmarSenha: '', role: usuario.role, status: usuario.status,
      permissoes: usuario.permissoes || getPermissoesPorRole(usuario.role),
      observacoes: usuario.observacoes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (usuarioId) => {
    if (usuarioId === currentUser?.id) { alert('Voce nao pode excluir seu proprio usuario'); return; }
    if (window.confirm('Tem certeza que deseja excluir este usuario?')) {
      try { await removerUsuario(usuarioId); } catch (error) { console.error('Erro ao excluir usuario:', error); alert('Erro ao excluir usuario'); }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '', email: '', telefone: '', senha: '', confirmarSenha: '',
      role: 'Recepcionista', status: 'Ativo',
      permissoes: getPermissoesPorRole('Recepcionista'), observacoes: '',
    });
    setEditingUsuario(null);
  };

  const closeModal = () => { setShowModal(false); resetForm(); };

  const filteredUsuarios = usuarios.filter(usuario => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (!filterRole || usuario.role === filterRole) && (!filterStatus || usuario.status === filterStatus);
  });

  const getStatusColor = (status) => ({
    'Ativo': 'bg-green-100 text-green-800', 'Inativo': 'bg-gray-100 text-gray-800', 'Suspenso': 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

  const getStatusIcon = (status) => ({
    'Ativo': CheckCircle, 'Inativo': XCircle, 'Suspenso': AlertCircle,
  }[status] || AlertCircle);

  const getRoleInfo = (role) => roles.find(r => r.value === role) || roles[2];

  const estatisticas = {
    totalUsuarios: filteredUsuarios.length,
    usuariosAtivos: filteredUsuarios.filter(u => u.status === 'Ativo').length,
    usuariosInativos: filteredUsuarios.filter(u => u.status === 'Inativo').length,
    usuariosSuspensos: filteredUsuarios.filter(u => u.status === 'Suspenso').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestao de Usuarios</h1>
          <p className="text-gray-600">Gerencie usuarios e permissoes do sistema</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          <Plus className="h-5 w-5" /> Novo Usuario
        </button>
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Total de Usuarios', value: estatisticas.totalUsuarios, icon: Users, color: 'text-blue-600' },
          { label: 'Usuarios Ativos', value: estatisticas.usuariosAtivos, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Usuarios Inativos', value: estatisticas.usuariosInativos, icon: XCircle, color: 'text-gray-600' },
          { label: 'Usuarios Suspensos', value: estatisticas.usuariosSuspensos, icon: AlertCircle, color: 'text-red-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Buscar por nome ou email..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todas as Funcoes</option>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">Todos os Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Lista de Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsuarios.map((usuario) => {
          const StatusIcon = getStatusIcon(usuario.status);
          const roleInfo = getRoleInfo(usuario.role);
          const RoleIcon = roleInfo.icon;
          return (
            <div key={usuario.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
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
                  <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} bg-opacity-10`}>
                    <RoleIcon className="h-3 w-3" /> {roleInfo.label}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(usuario.status)}`}>
                    <StatusIcon className="h-3 w-3" /> {usuario.status}
                  </span>
                  {usuario.id === currentUser?.id && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Voce</span>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  {usuario.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" /><span>{usuario.telefone}</span></div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em: {usuario.dataCriacao ? new Date(usuario.dataCriacao).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  {usuario.ultimoLogin && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Ultimo login: {new Date(usuario.ultimoLogin).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Permissoes:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(usuario.permissoes || {}).map(([key, value]) => {
                      if (!value) return null;
                      const permissao = permissoesDisponiveis.find(p => p.key === key);
                      if (!permissao) return null;
                      return <span key={key} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{permissao.label}</span>;
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(usuario)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <Edit3 className="h-4 w-4" /> Editar
                  </button>
                  {usuario.id !== currentUser?.id && (
                    <button onClick={() => handleDelete(usuario.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                      <Trash2 className="h-4 w-4" /> Excluir
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuario encontrado</h3>
          <p className="text-gray-500 mb-4">Comece cadastrando o primeiro usuario do sistema</p>
          <button onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2">
            <Plus className="h-5 w-5" /> Cadastrar Primeiro Usuario
          </button>
        </div>
      )}

      <UsuarioFormModal
        open={showModal} onClose={closeModal} onSave={handleSave}
        editingUsuario={editingUsuario} formData={formData}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}

export default Usuarios;
