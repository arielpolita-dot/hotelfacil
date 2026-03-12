import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, ChevronRight, Users, Calendar, LogOut } from 'lucide-react';

function EmpresaSelector() {
  const { currentUser, empresasUsuario, selecionarEmpresa, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSelecionarEmpresa = async (empresaId) => {
    setLoading(true);
    try {
      await selecionarEmpresa(empresaId);
    } catch (error) {
      console.error('Erro ao selecionar empresa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Bem-vindo, {currentUser?.displayName || currentUser?.email}!
          </h1>
          <p className="text-gray-600">
            Selecione uma empresa para continuar
          </p>
        </div>

        {/* Lista de Empresas */}
        <div className="space-y-4 mb-8">
          {empresasUsuario.map((empresa) => (
            <button
              key={empresa.id}
              onClick={() => handleSelecionarEmpresa(empresa.id)}
              disabled={loading}
              className="w-full p-6 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {empresa.nome}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                      {empresa.cnpj && (
                        <span>CNPJ: {empresa.cnpj}</span>
                      )}
                      {empresa.telefone && (
                        <span>Tel: {empresa.telefone}</span>
                      )}
                    </div>
                    {empresa.endereco && (
                      <p className="text-sm text-gray-500 mt-1">
                        {empresa.endereco}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Multi-usuário</p>
            <p className="text-xs text-blue-700">Colaboração em equipe</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">Tempo real</p>
            <p className="text-xs text-green-700">Sincronização automática</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Building2 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">Multi-empresa</p>
            <p className="text-xs text-purple-700">Gestão centralizada</p>
          </div>
        </div>

        {/* Ações */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
          
          <div className="text-sm text-gray-500">
            {empresasUsuario.length} empresa{empresasUsuario.length !== 1 ? 's' : ''} disponível{empresasUsuario.length !== 1 ? 'is' : ''}
          </div>
        </div>

        {/* Caso não tenha empresas */}
        {empresasUsuario.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma empresa encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não tem acesso a nenhuma empresa. Entre em contato com o administrador.
            </p>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmpresaSelector;
