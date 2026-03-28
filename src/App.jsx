import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HotelProvider } from './context/HotelContext';
import Login from './components/ui/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Disponibilidade from './pages/Disponibilidade';
import Quartos from './pages/Quartos';
import Vendas from './pages/Vendas';
import Faturas from './pages/Faturas';
import Despesas from './pages/Despesas';
import Usuarios from './pages/Usuarios';
import FluxoCaixa from './pages/FluxoCaixa';
import DRE from './pages/DRE';
import Configuracoes from './pages/Configuracoes';
import Fornecedores from './pages/Fornecedores';
import { Component } from 'react';

// Error Boundary para capturar erros silenciosos do React
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('React Error Boundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-md w-full text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Algo deu errado</h2>
            <p className="text-sm text-slate-500 mb-4">{this.state.error?.message || 'Erro desconhecido'}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition"
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#2563EB]">
        <div className="flex flex-col items-center gap-6">
          <img
            src="/icon-512.png"
            alt="Hotel Fácil"
            className="w-32 h-32 rounded-3xl shadow-2xl"
          />
          <p className="text-white font-semibold text-lg tracking-wide">Hotel Fácil</p>
          <div className="w-8 h-8 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <HotelProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disponibilidade" element={<Disponibilidade />} />
            <Route path="/quartos" element={<Quartos />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/faturas" element={<Faturas />} />
            <Route path="/despesas" element={<Despesas />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/fluxo-caixa" element={<FluxoCaixa />} />
            <Route path="/dre" element={<DRE />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/fornecedores" element={<Fornecedores />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </HotelProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
