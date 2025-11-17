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
import Limpeza from './components/limpeza/Limpeza';
import DadosFuncionarios from './components/dados-funcionarios/DadosFuncionarios';
import { getAuthToken } from './utils/auth';
import { requestNotificationPermission } from './utils/notifications';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('gerente');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
    const token = getAuthToken();
    const storedUserType = localStorage.getItem('userType') || 'gerente';
      
      if (!token) {
        // Sem token, não está autenticado
        setIsAuthenticated(false);
        setUserType('gerente');
        setIsCheckingAuth(false);
        return;
      }

      // Verificar se o token é válido fazendo uma requisição ao backend
      try {
        const api = (await import('./utils/api')).default;
        const response = await api.get('/auth/me');
        
        if (response.data) {
          // Token válido - verificar tipo do usuário do token
          const tokenType = response.data.tipo || storedUserType;
          setIsAuthenticated(true);
          setUserType(tokenType);
          localStorage.setItem('userType', tokenType);
      requestNotificationPermission();
        } else {
          // Token inválido
          setIsAuthenticated(false);
          setUserType('gerente');
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
        }
      } catch (error) {
        // Token inválido ou erro na verificação
        // Se for 401 (não autorizado) ou 403 (proibido), limpar token
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('Token inválido ou expirado. Limpando autenticação.');
          setIsAuthenticated(false);
          setUserType('gerente');
          localStorage.removeItem('token');
          localStorage.removeItem('userType');
        } else {
          // Outro erro (rede, etc) - assumir que não está autenticado para forçar login
          console.log('Erro ao verificar token:', error.message);
          setIsAuthenticated(false);
          setUserType('gerente');
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // Mostrar loading enquanto verifica autenticação
  if (isCheckingAuth) {
    return (
      <DarkModeProvider>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticação...</p>
          </div>
        </div>
      </DarkModeProvider>
    );
  }

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
            element={!isAuthenticated || isDono ? <Login setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/cadastro" 
            element={!isAuthenticated || isDono ? <Cadastro setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} /> : <Navigate to="/dashboard" />} 
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
          <Route 
            path="/limpeza" 
            element={isAuthenticated && isGerente ? <Limpeza setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          <Route 
            path="/dados-funcionarios" 
            element={isAuthenticated && isGerente ? <DadosFuncionarios setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isDono ? "/dashboard-dono" : "/login"} />} 
          />
          
          {/* Rotas do Dono */}
          <Route 
            path="/login-dono" 
            element={!isAuthenticated || isGerente ? <LoginDono setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} /> : <Navigate to="/dashboard-dono" />} 
          />
          <Route 
            path="/cadastro-dono" 
            element={!isAuthenticated || isGerente ? <CadastroDono setIsAuthenticated={setIsAuthenticated} setUserType={setUserType} /> : <Navigate to="/dashboard-dono" />} 
          />
          <Route 
            path="/dashboard-dono" 
            element={isAuthenticated && isDono ? <DashboardDono setIsAuthenticated={setIsAuthenticated} /> : <Navigate to={isGerente ? "/dashboard" : "/login-dono"} />} 
          />
          
          <Route path="/" element={<Navigate to={isAuthenticated ? (isDono ? "/dashboard-dono" : "/dashboard") : (isDono ? "/login-dono" : "/login")} />} />
        </Routes>
        </Router>
      </ToastProvider>
    </DarkModeProvider>
  );
}

export default App;

