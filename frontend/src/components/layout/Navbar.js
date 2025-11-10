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
  FaDollarSign,
  FaComments,
  FaBox,
  FaCalendar,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoon,
  FaSun
} from 'react-icons/fa';

const Navbar = ({ setIsAuthenticated }) => {
  const [gerente, setGerente] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
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

  const menuItems = [
    { to: '/dashboard', icon: FaHome, label: 'Dashboard' },
    { to: '/funcionarios', icon: FaUsers, label: 'Funcionários' },
    { to: '/metas', icon: FaBullseye, label: 'Metas' },
    { to: '/vendas-comerciais', icon: FaDollarSign, label: 'Vendas Comerciais' },
    { to: '/feedback', icon: FaComments, label: 'Feedback' },
    { to: '/estoque', icon: FaBox, label: 'Estoque' },
    { to: '/agenda', icon: FaCalendar, label: 'Agenda' },
  ];

  return (
    <>
      {/* Navbar Principal - Compacta */}
      <nav className={`fixed top-0 left-0 right-0 z-50 text-white shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-900' : ''}`} style={{ backgroundColor: darkMode ? '#1f2937' : '#169486' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <FaChartLine className="text-2xl" />
                <span className="font-bold text-xl">
                  {gerente?.nomeLoja || 'FlowGest'}
                </span>
              </Link>
            </div>

            {/* Botão do Menu e Informações do Usuário */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-3">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg transition-all hover:scale-110"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                  title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
                >
                  {darkMode ? <FaSun className="text-lg" /> : <FaMoon className="text-lg" />}
                </button>
                <span className="text-sm font-medium">Olá, {gerente?.nome || 'Gerente'}</span>
              </div>
              
              {/* Botão do Menu */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 rounded-lg transition-all hover:scale-110 relative"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                aria-label="Abrir menu"
              >
                {menuOpen ? (
                  <FaTimes className="text-xl" />
                ) : (
                  <FaBars className="text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay Escuro */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Menu Lateral */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        } ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho do Menu */}
          <div className={`p-6 border-b ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Menu
              </h2>
              <button
                onClick={() => setMenuOpen(false)}
                className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
              >
                <FaTimes className="text-lg" />
              </button>
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <p className="font-semibold">{gerente?.nome || 'Gerente'}</p>
              <p>{gerente?.nomeLoja || 'FlowGest'}</p>
            </div>
          </div>

          {/* Lista de Itens do Menu */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-4">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      darkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`text-xl transition-transform group-hover:scale-110 ${
                      darkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900'
                    }`} />
                    <span className="font-medium text-base">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Rodapé do Menu */}
          <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
            <div className="space-y-2">
              <button
                onClick={() => {
                  toggleDarkMode();
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                  darkMode
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
                {darkMode ? 'Modo Claro' : 'Modo Escuro'}
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium ${
                  darkMode
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                <FaSignOutAlt />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Espaçamento para o conteúdo não ficar escondido atrás da navbar fixa */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;

