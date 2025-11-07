import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import Login from './components/auth/Login';
import Cadastro from './components/auth/Cadastro';
import Dashboard from './components/dashboard/Dashboard';
import Funcionarios from './components/funcionarios/Funcionarios';
import Metas from './components/metas/Metas';
import Feedback from './components/feedback/Feedback';
import Estoque from './components/estoque/Estoque';
import Agenda from './components/agenda/Agenda';
import { getAuthToken } from './utils/auth';
import { requestNotificationPermission } from './utils/notifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  useEffect(() => {
    setIsAuthenticated(!!getAuthToken());
    
    // Solicitar permissão para notificações quando o app carregar
    if (isAuthenticated) {
      requestNotificationPermission();
    }
  }, [isAuthenticated]);

  return (
    <ToastProvider>
      <Router>
        <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/cadastro" 
          element={!isAuthenticated ? <Cadastro setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/funcionarios" 
          element={isAuthenticated ? <Funcionarios setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/metas" 
          element={isAuthenticated ? <Metas setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/feedback" 
          element={isAuthenticated ? <Feedback setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/estoque" 
          element={isAuthenticated ? <Estoque setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/agenda" 
          element={isAuthenticated ? <Agenda setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

