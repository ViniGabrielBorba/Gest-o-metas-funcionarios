import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import api from '../../utils/api';
import { 
  FaStore, 
  FaHome, 
  FaUsers, 
  FaBullseye, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const Navbar = ({ setIsAuthenticated }) => {
  const [gerente, setGerente] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <nav className="bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <FaStore className="text-2xl" />
              <span className="font-bold text-xl">
                {gerente?.nomeLoja || 'FlowGest'}
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/dashboard"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <FaHome /> Dashboard
            </Link>
            <Link
              to="/funcionarios"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <FaUsers /> Funcionários
            </Link>
            <Link
              to="/metas"
              className="px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <FaBullseye /> Metas
            </Link>
            <div className="ml-4 flex items-center space-x-3">
              <span className="text-sm">Olá, {gerente?.nome || 'Gerente'}</span>
              <button
                onClick={handleLogout}
                className="bg-purple-700 hover:bg-purple-800 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
              >
                <FaSignOutAlt /> Sair
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-purple-700"
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-purple-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-600 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaHome /> Dashboard
            </Link>
            <Link
              to="/funcionarios"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-600 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaUsers /> Funcionários
            </Link>
            <Link
              to="/metas"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-purple-600 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FaBullseye /> Metas
            </Link>
            <div className="px-3 py-2 border-t border-purple-500 mt-2">
              <p className="text-sm mb-2">Olá, {gerente?.nome || 'Gerente'}</p>
              <button
                onClick={handleLogout}
                className="w-full bg-purple-800 hover:bg-purple-900 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2"
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

