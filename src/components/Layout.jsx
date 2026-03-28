import { useState, useMemo, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import {
  LayoutDashboard, BedDouble, CalendarCheck, ShoppingCart,
  Receipt, CreditCard, TrendingUp, Users, Menu, X,
  LogOut, ChevronRight, Bell, Building2, BarChart2, Settings,
  AlertTriangle, AlertCircle
} from 'lucide-react';
import { format, isToday, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../utils/formatters';
import { toDate } from '../utils/dateUtils';

const NAV_ITEMS = [
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

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const { currentUser, empresaAtual, logout } = useAuth();
  const { despesas } = useHotel();
  const location = useLocation();
  const bellRef = useRef(null);

  const pageTitle = NAV_ITEMS.find(i => i.to === location.pathname)?.label || 'Hotel Fácil';

  // Calcular contas vencidas e do dia
  const alertas = useMemo(() => {
    const hojeStart = startOfDay(new Date());
    const vencidas = despesas.filter(d => {
      if (d.status !== 'pendente') return false;
      const dt = toDate(d.data);
      if (!dt) return false;
      return isBefore(startOfDay(dt), hojeStart);
    });
    const hoje = despesas.filter(d => {
      if (d.status !== 'pendente') return false;
      const dt = toDate(d.data);
      return dt && isToday(dt);
    });
    return { vencidas, hoje, total: vencidas.length + hoje.length };
  }, [despesas]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handler = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
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

        {/* Navegação */}
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

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 lg:px-6 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-slate-900 transition p-1.5 rounded-xl hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-slate-900 truncate">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Sininho de alertas */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen(v => !v)}
                className={`relative p-2 rounded-xl transition ${
                  alertas.total > 0
                    ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Alertas financeiros"
              >
                <Bell className="h-5 w-5" />
                {alertas.total > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {alertas.total > 9 ? '9+' : alertas.total}
                  </span>
                )}
              </button>

              {/* Dropdown de alertas */}
              {bellOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-900">Alertas Financeiros</h3>
                    <button onClick={() => setBellOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {alertas.total === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <Bell className="h-8 w-8 mb-2 opacity-30" />
                      <p className="text-sm">Nenhum alerta no momento</p>
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {/* Vencidas */}
                      {alertas.vencidas.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                            <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                              {alertas.vencidas.length} Conta{alertas.vencidas.length !== 1 ? 's' : ''} Vencida{alertas.vencidas.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          {alertas.vencidas.map(d => {
                            const dt = toDate(d.data);
                            return (
                              <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 hover:bg-red-50 transition">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-semibold text-slate-900 truncate">{d.descricao}</p>
                                  <p className="text-xs text-red-500">
                                    Venceu em {dt ? format(dt, 'dd/MM/yyyy', { locale: ptBR }) : '—'}
                                  </p>
                                </div>
                                <span className="text-sm font-bold text-red-600 ml-3 flex-shrink-0">{formatCurrency(d.valor)}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Hoje */}
                      {alertas.hoje.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
                            <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                              {alertas.hoje.length} Conta{alertas.hoje.length !== 1 ? 's' : ''} Vence{alertas.hoje.length !== 1 ? 'm' : ''} Hoje
                            </span>
                          </div>
                          {alertas.hoje.map(d => (
                            <div key={d.id} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-50 hover:bg-amber-50 transition">
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-slate-900 truncate">{d.descricao}</p>
                                <p className="text-xs text-amber-600">{d.categoria}</p>
                              </div>
                              <span className="text-sm font-bold text-amber-700 ml-3 flex-shrink-0">{formatCurrency(d.valor)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {alertas.total > 0 && (
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Total em aberto:</span>
                      <span className="text-sm font-bold text-rose-600">
                        {formatCurrency([...alertas.vencidas, ...alertas.hoje].reduce((s, d) => s + (d.valor || 0), 0))}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
              <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">
                {empresaAtual?.nome || 'Empresa'}
              </span>
            </div>
          </div>
        </header>

        {/* Página */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
