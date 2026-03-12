import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Settings, 
  LogOut, 
  User, 
  Building2,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

function TopBar({ sidebarOpen, setSidebarOpen }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { currentUser, empresaAtual, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 shadow-sm z-40 flex items-center justify-between px-4 lg:px-6">
      {/* Lado esquerdo - Botão do menu mobile */}
      <div className="flex items-center space-x-4">
        {/* Botão do menu mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Lado direito - Informações da empresa e menu do usuário */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Informações da empresa (desktop) */}
        <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
          <Building2 className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-800">
            {empresaAtual?.nome || 'Hotel Teste'}
          </span>
        </div>

        {/* Menu do usuário */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold text-gray-900">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Ariel Polita'}
              </div>
              <div className="text-xs text-gray-500">Administrador</div>
            </div>
            <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown do menu do usuário */}
          {userMenuOpen && (
            <>
              {/* Overlay para fechar o menu */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setUserMenuOpen(false)}
              />
              
              {/* Menu dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-20">
                {/* Informações do usuário */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Ariel Polita'}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {currentUser?.email || 'arielpolita@gmail.com.br'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Informações da empresa (mobile) */}
                <div className="md:hidden px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {empresaAtual?.nome || 'Hotel Teste'}
                      </div>
                      <div className="text-sm text-gray-500">Empresa atual</div>
                    </div>
                  </div>
                </div>

                {/* Opções do menu */}
                <div className="py-1">
                  <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="h-4 w-4 mr-3" />
                    Configurações
                  </button>
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sair do sistema
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopBar;

