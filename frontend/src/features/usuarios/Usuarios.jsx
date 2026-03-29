import React, { useState } from 'react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { useEmpresa } from '../../context/EmpresaContext';
import {
  Plus, Edit3, Trash2, User, Phone, Calendar,
  CheckCircle, XCircle, AlertCircle, Users
} from 'lucide-react';
import { roles, statusOptions, permissoesDisponiveis, getPermissoesPorRole } from './permissions';
import { UsuarioFormModal } from './UsuarioFormModal';
import {
  Button, Badge, SearchInput, StatCard, Card, CardBody,
  Select, PageHeader, EmptyState, DeleteDialog,
} from '../../components/ds';

function Usuarios() {
  const { usuarios = [], adicionarUsuario, atualizarUsuario, removerUsuario } = useHotel();
  const { currentUser } = useAuth();
  const { empresaAtual } = useEmpresa();
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

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

  const confirmDelete = (usuarioId) => {
    if (usuarioId === currentUser?.id) { alert('Voce nao pode excluir seu proprio usuario'); return; }
    setDeletingId(usuarioId);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    try {
      await removerUsuario(deletingId);
    } catch (error) {
      console.error('Erro ao excluir usuario:', error);
      alert('Erro ao excluir usuario');
    } finally {
      setDeleteOpen(false);
      setDeletingId(null);
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

  const statusBadgeVariant = (status) => ({
    'Ativo': 'success', 'Inativo': 'default', 'Suspenso': 'danger',
  }[status] || 'default');

  const getRoleInfo = (role) => roles.find(r => r.value === role) || roles[2];

  const estatisticas = {
    totalUsuarios: filteredUsuarios.length,
    usuariosAtivos: filteredUsuarios.filter(u => u.status === 'Ativo').length,
    usuariosInativos: filteredUsuarios.filter(u => u.status === 'Inativo').length,
    usuariosSuspensos: filteredUsuarios.filter(u => u.status === 'Suspenso').length,
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Gestao de Usuarios"
        subtitle="Gerencie usuarios e permissoes do sistema"
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>
            Novo Usuario
          </Button>
        }
      />

      {/* Estatisticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 mb-6">
        <StatCard title="Total de Usuarios" value={estatisticas.totalUsuarios} icon={Users} color="brand" />
        <StatCard title="Usuarios Ativos" value={estatisticas.usuariosAtivos} icon={CheckCircle} color="success" />
        <StatCard title="Usuarios Inativos" value={estatisticas.usuariosInativos} icon={XCircle} color="info" />
        <StatCard title="Usuarios Suspensos" value={estatisticas.usuariosSuspensos} icon={AlertCircle} color="danger" />
      </div>

      {/* Filtros */}
      <Card padding="md" className="mb-6">
        <div className="flex flex-wrap gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nome ou email..."
            className="flex-1 min-w-64"
          />
          <Select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="w-auto">
            <option value="">Todas as Funcoes</option>
            {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
          <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-auto">
            <option value="">Todos os Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </Card>

      {/* Lista de Usuarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUsuarios.map((usuario) => {
          const roleInfo = getRoleInfo(usuario.role);
          const RoleIcon = roleInfo.icon;
          return (
            <Card key={usuario.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-slate-50 p-4 border-b">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{usuario.nome}</h3>
                      <p className="text-sm text-slate-600">{usuario.email}</p>
                    </div>
                  </div>
                  <Badge variant="brand">
                    <RoleIcon className="h-3 w-3" /> {roleInfo.label}
                  </Badge>
                </div>
              </div>
              <CardBody>
                <div className="flex justify-between items-center mb-3">
                  <Badge variant={statusBadgeVariant(usuario.status)} dot>
                    {usuario.status}
                  </Badge>
                  {usuario.id === currentUser?.id && (
                    <Badge variant="warning">Voce</Badge>
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  {usuario.telefone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600"><Phone className="h-4 w-4" /><span>{usuario.telefone}</span></div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Criado em: {usuario.dataCriacao ? new Date(usuario.dataCriacao).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  {usuario.ultimoLogin && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Ultimo login: {new Date(usuario.ultimoLogin).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Permissoes:</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(usuario.permissoes || {}).map(([key, value]) => {
                      if (!value) return null;
                      const permissao = permissoesDisponiveis.find(p => p.key === key);
                      if (!permissao) return null;
                      return <Badge key={key} variant="brand" size="sm">{permissao.label}</Badge>;
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={Edit3} onClick={() => handleEdit(usuario)} className="flex-1">
                    Editar
                  </Button>
                  {usuario.id !== currentUser?.id && (
                    <Button variant="danger" size="sm" icon={Trash2} onClick={() => confirmDelete(usuario.id)}>
                      Excluir
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {filteredUsuarios.length === 0 && (
        <EmptyState
          icon={Users}
          message="Nenhum usuario encontrado"
          subMessage="Comece cadastrando o primeiro usuario do sistema"
          action={{ label: 'Cadastrar Primeiro Usuario', onClick: () => setShowModal(true) }}
        />
      )}

      <DeleteDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingId(null); }}
        onConfirm={handleDelete}
        entityName="usuario"
      />

      <UsuarioFormModal
        open={showModal} onClose={closeModal} onSave={handleSave}
        editingUsuario={editingUsuario} formData={formData}
        handleInputChange={handleInputChange}
      />
    </div>
  );
}

export default Usuarios;
