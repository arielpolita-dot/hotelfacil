import { useAuth } from '../context/AuthContext';
import Login from "./ui/Login";
import EmpresaSelector from './EmpresaSelector';

function ProtectedRoute({ children }) {
  const { currentUser, empresaAtual, loading } = useAuth();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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

  // Se está logado mas não selecionou empresa, mostrar seletor
  if (!empresaAtual) {
    return <EmpresaSelector />;
  }

  // Se está logado e tem empresa selecionada, mostrar conteúdo protegido
  return children;
}

export default ProtectedRoute;
