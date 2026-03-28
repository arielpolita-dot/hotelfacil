import { BedDouble } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Painel esquerdo decorativo */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col items-center justify-center p-14 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <BedDouble className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-none">Hotel Facil</h1>
              <p className="text-blue-400 text-xs mt-0.5">Sistema de Gestao Hoteleira</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Gerencie seu hotel<br />com facilidade
          </h2>
          <p className="text-blue-300 text-sm mb-10 leading-relaxed">
            Controle reservas, quartos, financas e muito mais em um so lugar.
          </p>

          <div className="space-y-3">
            {[
              { icon: '\uD83D\uDCCA', title: 'Dashboard em tempo real', desc: 'Metricas e ocupacao atualizadas ao vivo' },
              { icon: '\uD83D\uDECF\uFE0F', title: 'Gestao de quartos', desc: 'Disponibilidade, reservas e check-in/out' },
              { icon: '\uD83D\uDCB0', title: 'Controle financeiro', desc: 'Despesas, faturas e fluxo de caixa' },
            ].map((item) => (
              <div key={item.title} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 backdrop-blur-sm">
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{item.title}</p>
                  <p className="text-blue-300 text-xs mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Painel direito */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <BedDouble className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Hotel Facil</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Bem-vindo!</h2>
            <p className="text-slate-500 text-sm mb-8">
              Entre com sua conta para acessar o sistema
            </p>

            <button
              onClick={login}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-150 shadow-md shadow-blue-500/20"
            >
              Entrar com Authify
            </button>
          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            &copy; {new Date().getFullYear()} Hotel Facil - Todos os direitos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
