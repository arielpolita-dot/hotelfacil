import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHotel } from '../context/HotelContext';
import { Menu, Building2 } from 'lucide-react';
import { NotificationBell } from './layout/NotificationBell';
import { SidebarNav, NAV_ITEMS } from './layout/SidebarNav';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, empresaAtual, logout } = useAuth();
  const { despesas } = useHotel();
  const location = useLocation();

  const pageTitle = NAV_ITEMS.find(i => i.to === location.pathname)?.label || 'Hotel Fácil';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <SidebarNav
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentUser={currentUser}
        empresaAtual={empresaAtual}
        logout={logout}
      />

      {/* Conteudo principal */}
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
            <NotificationBell despesas={despesas} />

            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
              <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm font-medium text-slate-700 max-w-[160px] truncate">
                {empresaAtual?.nome || 'Empresa'}
              </span>
            </div>
          </div>
        </header>

        {/* Pagina */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
