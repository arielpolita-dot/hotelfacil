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
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-56 bg-gray-800 text-white shadow-lg z-30 transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 flex flex-col`}>
        
        {/* Logo/Header - Compacto */}
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-md">
              <Hotel className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold">Hotel Fácil</h1>
              <p className="text-xs text-gray-400">Gestão Hoteleira</p>
            </div>
          </div>
        </div>

        {/* Menu de navegação - Responsivo e compacto */}
        <nav className="flex-1 p-2 overflow-hidden">
          <div className="h-full flex flex-col justify-start space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)} // Fecha menu no mobile
                  className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 group text-sm ${
                    isActive(item.path) 
                      ? 'bg-blue-600 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm leading-tight">{item.label}</div>
                    <div className="text-xs opacity-75 truncate leading-tight">{item.description}</div>
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
