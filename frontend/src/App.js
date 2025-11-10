import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import Login from './components/auth/Login';
import Cadastro from './components/auth/Cadastro';
import LoginDono from './components/auth/LoginDono';
import CadastroDono from './components/auth/CadastroDono';
import Dashboard from './components/dashboard/Dashboard';
import DashboardDono from './components/dashboard/DashboardDono';
import Funcionarios from './components/funcionarios/Funcionarios';
import Metas from './components/metas/Metas';
import VendasComerciais from './components/vendasComerciais/VendasComerciais';
import Feedback from './components/feedback/Feedback';
import Estoque from './components/estoque/Estoque';
import Agenda from './components/agenda/Agenda';
import { getAuthToken } from './utils/auth';
import { requestNotificationPermission } from './utils/notifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'gerente');

  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    const storedUserType = localStorage.getItem('userType') || 'gerente';
    setUserType(storedUserType);
    
    // Solicitar permissão para notificações quando o app carregar
    if (token) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);

  const isDono = userType === 'dono';
  const isGerente = userType === 'gerente';

  return (
    <DarkModeProvider>
      <ToastProvider>
        <Router>
        <Routes>
          {/* Rotas do Gerente */}
          <Route 
            path="/login" 
            element={!isAuthenticated || isDono ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/cadastro" 
            element={!isAuthenticated || isDono ? <Cadastro setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated && isGerente ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          <Route 
            path="/funcionarios" 
            element={isAuthenticated && isGerente ? <Funcionarios setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          <Route 
            path="/metas" 
            element={isAuthenticated && isGerente ? <Metas setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          <Route 
            path="/vendas-comerciais" 
            element={isAuthenticated && isGerente ? <VendasComerciais setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          <Route 
            path="/feedback" 
            element={isAuthenticated && isGerente ? <Feedback setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          <Route 
            path="/estoque" 
            element={isAuthenticated && isGerente ? <Estoque setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          <Route 
            path="/agenda" 
            element={isAuthenticated && isGerente ? <Agenda setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          
          {/* Rotas do Dono */}
          <Route 
            path="/login-dono" 
            element={!isAuthenticated || isGerente ? <LoginDono setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard-dono" />} 
          />
          <Route 
            path="/cadastro-dono" 
            element={!isAuthenticated || isGerente ? <CadastroDono setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard-dono" />} 
          />
          <Route 
            path="/dashboard-dono" 
            element={isAuthenticated && isDono ? <DashboardDono setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isGerente ? "/dashboard" : "/login-dono"} />} 
          />
          
          <Route path="/" element={<Navigate to={isDono ? "/dashboard-dono" : "/dashboard"} />} />
        </Routes>
        </Router>
      </ToastProvider>
    </DarkModeProvider>
  );
}

export default App;

