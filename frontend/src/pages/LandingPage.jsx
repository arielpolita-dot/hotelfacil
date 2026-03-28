import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="text-xl font-bold">OHospedeiro</span>
        </div>
        <button
          onClick={() => navigate('/app')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl transition"
        >
          Acessar Sistema
        </button>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
          Gerencie seu hotel<br />
          <span className="text-blue-400">com simplicidade</span>
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
          Controle reservas, quartos, financas e muito mais em um unico lugar.
          Sistema completo de gestao hoteleira na nuvem.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/app')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-blue-600/30"
          >
            Comece Agora — Gratis
          </button>
          <a
            href="#features"
            className="border border-slate-600 hover:border-slate-400 text-slate-300 font-semibold px-8 py-4 rounded-xl text-lg transition"
          >
            Saiba Mais
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Tudo que voce precisa</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Dashboard em Tempo Real', desc: 'Metricas de ocupacao, receita e despesas atualizadas ao vivo. Tome decisoes rapidas com dados precisos.', icon: '\u{1F4CA}' },
            { title: 'Gestao de Quartos', desc: 'Controle disponibilidade, check-in, check-out e manutencao. Calendario visual com status por quarto.', icon: '\u{1F6CF}\uFE0F' },
            { title: 'Controle Financeiro', desc: 'Despesas, faturas, fluxo de caixa e DRE. Visao completa das financas do seu hotel.', icon: '\u{1F4B0}' },
          ].map((f, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Simples e Acessivel</h2>
        <p className="text-slate-400 mb-10">Sem surpresas. Um plano completo.</p>
        <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-10 max-w-md mx-auto">
          <div className="text-5xl font-black text-blue-400 mb-2">R$ 99<span className="text-xl text-slate-400">/mes</span></div>
          <p className="text-slate-300 mb-6">Acesso completo a todas funcionalidades</p>
          <ul className="text-left text-slate-300 space-y-3 mb-8">
            {['Quartos ilimitados', 'Reservas ilimitadas', 'Dashboard em tempo real', 'Controle financeiro completo', 'Multiplos usuarios', 'Suporte por email'].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/app')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition"
          >
            Comecar Teste Gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2026 OHospedeiro — Sistema de Gestao Hoteleira</p>
      </footer>
    </div>
  );
}
