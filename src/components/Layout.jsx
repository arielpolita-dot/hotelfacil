import React, { useState } from 'react';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import './Layout.css';

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* TopBar */}
      <TopBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Layout principal */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Conteúdo principal */}
        <main className="flex-1 lg:ml-64 p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;

