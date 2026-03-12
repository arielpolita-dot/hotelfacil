import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HotelProvider } from '../context/HotelContext';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import Dashboard from '../pages/Dashboard';
import Disponibilidade from '../pages/Disponibilidade';
import Quartos from '../pages/Quartos';
import Vendas from '../pages/Vendas';
import Faturas from '../pages/Faturas';
import Despesas from '../pages/Despesas';
import Usuarios from '../pages/Usuarios';
import FluxoCaixa from '../pages/FluxoCaixa';
import './Layout.css';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HotelProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {/* TopBar */}
          <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          
          {/* Layout principal */}
          <div className="flex pt-16">
            {/* Sidebar */}
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            
            {/* Conteúdo principal - Ajustado para nova largura do sidebar */}
            <main className="flex-1 lg:ml-56 p-3 sm:p-4 lg:p-6 transition-all duration-300">
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
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </HotelProvider>
  );
}

export default Layout;
