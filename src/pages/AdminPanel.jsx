import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Calendar,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Users
} from 'lucide-react';

export default function AdminPanel() {
  const { isAdmin, listarTodasEmpresas, ativarEmpresa } = useAuth();
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'trial', 'expired', 'paid'
  const [ativando, setAtivando] = useState(null);

  useEffect(() => {
    carregarEmpresas();
  }, []);

  async function carregarEmpresas() {
    try {
      setLoading(true);
      const lista = await listarTodasEmpresas();
      setEmpresas(lista);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAtivarEmpresa(empresaId) {
    if (!confirm('Confirma a ativação desta empresa?')) {
      return;
    }

    try {
      setAtivando(empresaId);
      await ativarEmpresa(empresaId);
      await carregarEmpresas(); // Recarregar lista
      alert('Empresa ativada com sucesso!');
    } catch (error) {
      console.error('Erro ao ativar empresa:', error);
      alert('Erro ao ativar empresa. Tente novamente.');
    } finally {
      setAtivando(null);
    }
  }

  function getStatusBadge(status) {
    const badges = {
      active: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: Clock,
        label: 'Trial Ativo'
      },
      expired: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        icon: XCircle,
        label: 'Trial Expirado'
      },
      paid: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Pago'
      }
    };

    const badge = badges[status] || badges.expired;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  }

  function formatarData(timestamp) {
    if (!timestamp || !timestamp.toDate) return 'Data não disponível';
    
    const data = timestamp.toDate();
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  }

  const empresasFiltradas = empresas.filter(empresa => {
    if (filter === 'all') return true;
    return empresa.trialStatus?.status === filter || 
           (filter === 'trial' && empresa.trialStatus?.status === 'active');
  });

  const stats = {
    total: empresas.length,
    trial: empresas.filter(e => e.trialStatus?.status === 'active').length,
    expired: empresas.filter(e => e.trialStatus?.status === 'expired').length,
    paid: empresas.filter(e => e.trialStatus?.status === 'paid').length
  };

  if (!isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie todas as empresas cadastradas no sistema</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trial Ativo</p>
                <p className="text-2xl font-bold text-blue-600">{stats.trial}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expirados</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagos</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({stats.total})
            </button>
            <button
              onClick={() => setFilter('trial')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'trial'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trial ({stats.trial})
            </button>
            <button
              onClick={() => setFilter('expired')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'expired'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Expirados ({stats.expired})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'paid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pagos ({stats.paid})
            </button>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="space-y-4">
          {empresasFiltradas.map(empresa => (
            <div key={empresa.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{empresa.nome}</h3>
                    {getStatusBadge(empresa.trialStatus?.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    {empresa.cnpj && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span>CNPJ: {empresa.cnpj}</span>
                      </div>
                    )}
                    {empresa.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{empresa.telefone}</span>
                      </div>
                    )}
                    {empresa.endereco && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{empresa.endereco}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Criado em: {formatarData(empresa.criadoEm)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{empresa.usuarios?.length || 0} usuário(s)</span>
                    </div>
                  </div>
                </div>

                {empresa.trialStatus?.status !== 'paid' && (
                  <button
                    onClick={() => handleAtivarEmpresa(empresa.id)}
                    disabled={ativando === empresa.id}
                    className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {ativando === empresa.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Ativando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Ativar
                      </>
                    )}
                  </button>
                )}
              </div>

              {empresa.trialStatus?.status === 'active' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>{empresa.trialStatus.diasRestantes}</strong> dia(s) restante(s) de trial
                  </p>
                </div>
              )}

              {empresa.trialStatus?.status === 'expired' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    Trial expirado. Aguardando pagamento.
                  </p>
                </div>
              )}

              {empresa.trialStatus?.status === 'paid' && empresa.dataPagamento && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    Pagamento confirmado em: {formatarData(empresa.dataPagamento)}
                  </p>
                </div>
              )}
            </div>
          ))}

          {empresasFiltradas.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma empresa encontrada com este filtro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

