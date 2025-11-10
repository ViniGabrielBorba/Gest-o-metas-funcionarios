import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import api from '../../utils/api';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { 
  FaChartLine, 
  FaHome, 
  FaUsers, 
  FaBullseye,
  FaComments,
  FaBox,
  FaCalendar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun,
  FaDollarSign
} from 'react-icons/fa';

const Navbar = ({ setIsAuthenticated }) => {
  const [gerente, setGerente] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const fetchGerente = async () => {
      try {
        const response = await api.get('/auth/me');
        setGerente(response.data);
      } catch (error) {
        console.error('Erro ao buscar dados do gerente:', error);
      }
    };
    fetchGerente();
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    if (setIsAuthenticated) {
      setIsAuthenticated(false);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <nav className="text-white shadow-lg" style={{ backgroundColor: '#169486' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <FaChartLine className="text-2xl" />
              <span className="font-bold text-xl">
                {gerente?.nomeLoja || 'FlowGest'}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaHome /> Dashboard
            </Link>
            <Link
              to="/funcionarios"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaUsers /> Funcionários
            </Link>
            <Link
              to="/vendas-comerciais"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaDollarSign /> Vendas Comerciais
            </Link>
            <Link
              to="/metas"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaBullseye /> Metas
            </Link>
            <Link
              to="/feedback"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaComments /> Feedback
            </Link>
            <Link
              to="/estoque"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaBox /> Estoque
            </Link>
            <Link
              to="/agenda"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <FaCalendar /> Agenda
            </Link>
            <div className="ml-4 flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className="px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              <span className="text-sm">Olá, {gerente?.nome || 'Gerente'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                <FaSignOutAlt /> Sair
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-opacity-80"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-80 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome /> Dashboard
            </Link>
            <Link
              to="/funcionarios"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-80 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUsers /> Funcionários
            </Link>
            <Link
              to="/vendas-comerciais"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-80 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaDollarSign /> Vendas Comerciais
            </Link>
            <Link
              to="/metas"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-80 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaBullseye /> Metas
            </Link>
            <Link
              to="/feedback"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-80 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaComments /> Feedback
            </Link>
            <Link
              to="/estoque"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-80 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaBox /> Estoque
            </Link>
            <Link
              to="/agenda"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-opacity-80 flex items-center gap-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaCalendar /> Agenda
            </Link>
            <div className="px-3 py-2 border-t border-white border-opacity-20 mt-2">
              <p className="text-sm mb-2">Olá, {gerente?.nome || 'Gerente'}</p>
              <button
                onClick={toggleDarkMode}
                className="w-full mb-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
              >
                {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Modo Claro' : 'Modo Escuro'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                <FaSignOutAlt /> Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

