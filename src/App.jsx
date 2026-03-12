import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HybridHotelProvider } from './context/HybridHotelContext';
import Login from './components/ui/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Disponibilidade from './pages/Disponibilidade';
import Quartos from './pages/Quartos';
import Vendas from './pages/Vendas';
import Faturas from './pages/Faturas';
import Despesas from './pages/Despesas';
import Usuarios from './pages/Usuarios';
import FluxoCaixa from './pages/FluxoCaixa';
import TrialExpired from './components/TrialExpired';
import AdminPanel from './pages/AdminPanel';
import { useState } from 'react';
import TrialBanner from './components/TrialBanner';

console.log('App renderizado');

// Componente wrapper para verificar trial
function AppContent() {
  const { currentUser, empresaAtual, trialStatus, loading, logout, isAdmin } = useAuth();
  const [showTrialBanner, setShowTrialBanner] = useState(true);

  // Se ainda está carregando, mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não está logado, mostrar tela de login
  if (!currentUser) {
    return <Login />;
  }

  // Se é admin, permitir acesso ao painel administrativo
  if (isAdmin()) {
    return (
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/*" element={
            <HybridHotelProvider>
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/disponibilidade" element={<ProtectedRoute><Disponibilidade /></ProtectedRoute>} />
                  <Route path="/quartos" element={<ProtectedRoute><Quartos /></ProtectedRoute>} />
                  <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
                  <Route path="/faturas" element={<ProtectedRoute><Faturas /></ProtectedRoute>} />
                  <Route path="/despesas" element={<ProtectedRoute><Despesas /></ProtectedRoute>} />
                  <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
                  <Route path="/fluxo-caixa" element={<ProtectedRoute><FluxoCaixa /></ProtectedRoute>} />
                </Routes>
              </Layout>
            </HybridHotelProvider>
          } />
        </Routes>
      </Router>
    );
  }

  // Verificar status do trial para usuários normais
  if (trialStatus?.status === 'expired') {
    return <TrialExpired empresaNome={empresaAtual?.nome} onLogout={logout} />;
  }

  // Se está em trial ativo, mostrar banner
  const mostrarBanner = trialStatus?.status === 'active' && showTrialBanner;

  return (
    <Router>
      <HybridHotelProvider>
        {mostrarBanner && (
          <TrialBanner 
            diasRestantes={trialStatus.diasRestantes} 
            onClose={() => setShowTrialBanner(false)} 
          />
        )}
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/disponibilidade" element={<ProtectedRoute><Disponibilidade /></ProtectedRoute>} />
            <Route path="/quartos" element={<ProtectedRoute><Quartos /></ProtectedRoute>} />
            <Route path="/vendas" element={<ProtectedRoute><Vendas /></ProtectedRoute>} />
            <Route path="/faturas" element={<ProtectedRoute><Faturas /></ProtectedRoute>} />
            <Route path="/despesas" element={<ProtectedRoute><Despesas /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
            <Route path="/fluxo-caixa" element={<ProtectedRoute><FluxoCaixa /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </HybridHotelProvider>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;