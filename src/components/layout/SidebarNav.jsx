import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, BedDouble, CalendarCheck, ShoppingCart,
  Receipt, CreditCard, TrendingUp, Users,
  X, LogOut, ChevronRight, Building2, BarChart2, Settings,
} from 'lucide-react';

export const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/disponibilidade', icon: CalendarCheck, label: 'Disponibilidade' },
  { to: '/quartos', icon: BedDouble, label: 'Quartos' },
  { to: '/vendas', icon: ShoppingCart, label: 'Reservas' },
  { divider: true, label: 'Financeiro' },
  { to: '/faturas', icon: Receipt, label: 'Faturas' },
  { to: '/despesas', icon: CreditCard, label: 'Despesas' },
  { to: '/fluxo-caixa', icon: TrendingUp, label: 'Fluxo de Caixa' },
  { to: '/dre', icon: BarChart2, label: 'DRE' },
  { divider: true, label: 'Cadastros' },
  { to: '/fornecedores', icon: Building2, label: 'Fornecedores' },
  { divider: true, label: 'Configurações' },
  { to: '/usuarios', icon: Users, label: 'Usuários' },
  { to: '/configuracoes', icon: Settings, label: 'Hotel / Empresa' },
];

export function SidebarNav({ sidebarOpen, setSidebarOpen, currentUser, empresaAtual, logout }) {
  return (
    <aside
      className={`
        fixed top-0 left-0 h-full z-40 w-64 flex flex-col
        bg-slate-900 text-white
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex-shrink-0
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 flex-shrink-0">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
          <BedDouble className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white leading-none">Hotel Fácil</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">
            {empresaAtual?.nome || 'Sistema Hoteleiro'}
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-slate-400 hover:text-white transition p-1"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navegacao */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item, i) => {
          if (item.divider) {
            return (
              <div key={i} className="pt-5 pb-2 px-2">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  {item.label}
                </p>
              </div>
            );
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Perfil */}
      <div className="border-t border-white/10 p-3 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold text-white">
            {(currentUser?.displayName || currentUser?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate leading-none">
              {currentUser?.displayName || 'Usuário'}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">{currentUser?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Sair"
            className="text-slate-500 hover:text-red-400 transition p-1.5 rounded-lg hover:bg-slate-700"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
