import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  ShoppingCart, 
  Receipt, 
  TrendingUp,
  Hotel,
  FileText,
  User
} from 'lucide-react';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Visão geral'
    },
    {
      path: '/disponibilidade',
      icon: Calendar,
      label: 'Disponibilidade',
      description: 'Quartos disponíveis'
    },
    {
      path: '/quartos',
      icon: Hotel,
      label: 'Quartos',
      description: 'Cadastro de quartos'
    },
    {
      path: '/vendas',
      icon: ShoppingCart,
      label: 'Vendas',
      description: 'Reservas e vendas'
    },
    {
      path: '/faturas',
      icon: FileText,
      label: 'Faturas',
      description: 'Contratos corporativos'
    },
    {
      path: '/despesas',
      icon: Receipt,
      label: 'Despesas',
      description: 'Gestão de gastos'
    },
    {
      path: '/fluxo-caixa',
      icon: TrendingUp,
      label: 'Fluxo de Caixa',
      description: 'Controle financeiro'
    },
    {
      path: '/usuarios',
      icon: User,
      label: 'Usuários',
      description: 'Gestão de usuários'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-gray-800 shadow-xl z-10 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2.5 rounded-lg">
              <Hotel className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Hotel Fácil</h1>
              <p className="text-sm text-gray-400">Gestão Hoteleira</p>
            </div>
          </div>
        </div>

        {/* Menu de navegação */}
        <nav className="py-4 px-3 h-[calc(100%-120px)] overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                    active 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs opacity-70 truncate">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}

export default Sidebar;

