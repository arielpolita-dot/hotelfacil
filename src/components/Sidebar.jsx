import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  ShoppingCart, 
  Receipt, 
  TrendingUp,
  BedDouble,
  FileText,
  Users,
  LogOut,
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { useHotel } from '../context/HotelFirestoreContext';

const menuGroups = [
  {
    label: 'Operações',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Visão geral' },
      { path: '/disponibilidade', icon: Calendar, label: 'Disponibilidade', description: 'Calendário de quartos' },
      { path: '/quartos', icon: BedDouble, label: 'Quartos', description: 'Cadastro de quartos' },
      { path: '/vendas', icon: ShoppingCart, label: 'Vendas', description: 'Reservas e check-in' },
    ]
  },
  {
    label: 'Financeiro',
    items: [
      { path: '/faturas', icon: FileText, label: 'Faturas', description: 'Contratos corporativos' },
      { path: '/despesas', icon: Receipt, label: 'Despesas', description: 'Gestão de gastos' },
      { path: '/fluxo-caixa', icon: TrendingUp, label: 'Fluxo de Caixa', description: 'Controle financeiro' },
      { path: '/dre', icon: BarChart2, label: 'DRE', description: 'Demonstrativo de Resultado' },
    ]
  },
  {
    label: 'Configurações',
    items: [
      { path: '/usuarios', icon: Users, label: 'Usuários', description: 'Gestão de usuários' },
    ]
  }
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout } = useHotel();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 shadow-2xl z-30 flex flex-col transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>

        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <BedDouble className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Hotel Fácil</h1>
              <p className="text-xs text-slate-400">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-3">
          {menuGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} style={{width:'18px',height:'18px'}} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-none mb-0.5 ${active ? 'text-white' : ''}`}>{item.label}</p>
                        <p className={`text-[11px] truncate ${active ? 'text-blue-200' : 'text-slate-500 group-hover:text-slate-400'}`}>{item.description}</p>
                      </div>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-blue-300 flex-shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer / Logout */}
        <div className="px-3 py-4 border-t border-slate-700/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150 group"
          >
            <LogOut className="h-4 w-4 flex-shrink-0 group-hover:text-red-400" />
            <span className="text-sm font-medium">Sair do sistema</span>
          </button>
        </div>
      </aside>
    </>
  );
}
