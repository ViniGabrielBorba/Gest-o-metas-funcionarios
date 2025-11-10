import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaDollarSign,
  FaCalendar,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const Funcionarios = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    sobrenome: '',
    sexo: 'Masculino',
    idade: '',
    funcao: '',
    dataAniversario: '',
    metaIndividual: ''
  });
  const [buscaNome, setBuscaNome] = useState('');
  const [filtroFuncao, setFiltroFuncao] = useState('');

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      // A API retorna um objeto de paginação, extrair o array de dados
      const data = response.data;
      // Se for um objeto de paginação, usar data.data, senão usar data diretamente
      const funcionariosArray = Array.isArray(data) 
        ? data 
        : (data?.data && Array.isArray(data.data) 
            ? data.data 
            : (data?.funcionarios && Array.isArray(data.funcionarios) 
                ? data.funcionarios 
                : []));
      setFuncionarios(funcionariosArray);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
      console.error('Resposta da API:', error.response?.data);
      // Em caso de erro, garantir que funcionarios seja um array vazio
      setFuncionarios([]);
      toast.error('Erro ao carregar funcionários');
    } finally {
      setLoading(false);
    }
  };

  // Função helper para obter nome completo (compatibilidade com dados antigos)
  const getNomeCompleto = (funcionario) => {
    if (funcionario.sobrenome) {
      return `${funcionario.nome} ${funcionario.sobrenome}`;
    }
    // Se não tiver sobrenome, pode ser que o nome completo esteja no campo nome (dados antigos)
    return funcionario.nome || '';
  };

  // Função helper para separar nome completo em nome e sobrenome (para compatibilidade)
  const separarNomeSobrenome = (nomeCompleto) => {
    if (!nomeCompleto) return { nome: '', sobrenome: '' };
    const partes = nomeCompleto.trim().split(/\s+/);
    if (partes.length === 1) {
      return { nome: partes[0], sobrenome: '' };
    }
    const sobrenome = partes.slice(-1)[0];
    const nome = partes.slice(0, -1).join(' ');
    return { nome, sobrenome };
  };

  const handleOpenModal = (funcionario = null) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      // Se já tiver sobrenome separado, usar diretamente
      // Se não tiver, separar o nome completo (compatibilidade com dados antigos)
      const nomeData = funcionario.sobrenome 
        ? { nome: funcionario.nome, sobrenome: funcionario.sobrenome }
        : separarNomeSobrenome(funcionario.nome);
      
      setFormData({
        nome: nomeData.nome,
        sobrenome: nomeData.sobrenome,
        sexo: funcionario.sexo,
        idade: funcionario.idade,
        funcao: funcionario.funcao,
        dataAniversario: funcionario.dataAniversario.split('T')[0],
        metaIndividual: funcionario.metaIndividual
      });
    } else {
      setEditingFuncionario(null);
      setFormData({
        nome: '',
        sobrenome: '',
        sexo: 'Masculino',
        idade: '',
        funcao: '',
        dataAniversario: '',
        metaIndividual: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFuncionario(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFuncionario) {
        await api.put(`/funcionarios/${editingFuncionario._id}`, formData);
      } else {
        await api.post('/funcionarios', formData);
      }
      handleCloseModal();
      fetchFuncionarios();
      toast.success(editingFuncionario ? 'Funcionário atualizado com sucesso!' : 'Funcionário cadastrado com sucesso!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar funcionário');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await api.delete(`/funcionarios/${id}`);
        fetchFuncionarios();
        toast.success('Funcionário excluído com sucesso!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir funcionário');
      }
    }
  };

  const getVendaMes = (funcionario) => {
    const mesAtual = new Date().getMonth() + 1;
    const anoAtual = new Date().getFullYear();
    const venda = funcionario.vendas?.find(
      v => v.mes === mesAtual && v.ano === anoAtual
    );
    return venda ? venda.valor : 0;
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Funcionários</h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Gerencie sua equipe</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Novo Funcionário
          </button>
        </div>

        {/* Filtros e Busca */}
        <div className={`card mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Buscar por nome ou sobrenome..."
                value={buscaNome}
                onChange={(e) => setBuscaNome(e.target.value)}
                className={`input-field pl-10 ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : ''}`}
              />
            </div>
            <div>
              <select
                value={filtroFuncao}
                onChange={(e) => setFiltroFuncao(e.target.value)}
                className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : ''}`}
              >
                <option value="">Todas as funções</option>
                {Array.isArray(funcionarios) && funcionarios.length > 0 && [...new Set(funcionarios.map(f => f.funcao).filter(Boolean))].map(funcao => (
                  <option key={funcao} value={funcao}>{funcao}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(funcionarios) && funcionarios
            .filter(funcionario => {
              // Filtro por nome (buscar em nome e sobrenome)
              if (buscaNome) {
                const nomeCompleto = getNomeCompleto(funcionario).toLowerCase();
                if (!nomeCompleto.includes(buscaNome.toLowerCase())) {
                  return false;
                }
              }
              // Filtro por função
              if (filtroFuncao && funcionario.funcao !== filtroFuncao) {
                return false;
              }
              return true;
            })
            .map(funcionario => (
            <div key={funcionario._id} className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {getNomeCompleto(funcionario)}
                  </h3>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{funcionario.funcao}</p>
                </div>
                <span className="badge bg-red-100 text-red-800">
                  {funcionario.sexo}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <FaCalendar />
                  <span>{funcionario.idade} anos</span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(funcionario.dataAniversario).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit'
                    })}
                  </span>
                </div>
                <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <FaDollarSign />
                  <span>Meta: R$ {funcionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Vendas do mês:</span>
                    <span className={`font-bold text-lg ${
                      getVendaMes(funcionario) >= funcionario.metaIndividual
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}>
                      R$ {getVendaMes(funcionario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Meta:</span>
                    <span className={`text-xs font-semibold ${
                      getVendaMes(funcionario) >= funcionario.metaIndividual
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {((getVendaMes(funcionario) / funcionario.metaIndividual) * 100).toFixed(1)}%
                      {getVendaMes(funcionario) >= funcionario.metaIndividual ? ' ✅' : ' ⚠️'}
                    </span>
                  </div>
                  {getVendaMes(funcionario) >= funcionario.metaIndividual && (
                    <div className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded mt-1">
                      🎯 Meta batida!
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenModal(funcionario)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 flex-1 justify-center"
                >
                  <FaEdit /> Editar
                </button>
                <button
                  onClick={() => handleDelete(funcionario._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {(!Array.isArray(funcionarios) || funcionarios.length === 0) && !loading && (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Nenhum funcionário cadastrado</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary mt-4"
            >
              Cadastrar Primeiro Funcionário
            </button>
          </div>
        )}

        {/* Modal de Funcionário */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {editingFuncionario ? 'Editar Funcionário' : 'Novo Funcionário'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome
                      </label>
                      <input
                        type="text"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sobrenome
                      </label>
                      <input
                        type="text"
                        value={formData.sobrenome}
                        onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexo
                    </label>
                    <select
                      value={formData.sexo}
                      onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idade
                      </label>
                      <input
                        type="number"
                        value={formData.idade}
                        onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
                        className="input-field"
                        min="16"
                        max="100"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Função
                      </label>
                      <input
                        type="text"
                        value={formData.funcao}
                        onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Aniversário
                    </label>
                    <input
                      type="date"
                      value={formData.dataAniversario}
                      onChange={(e) => setFormData({ ...formData, dataAniversario: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Individual Mensal (R$)
                    </label>
                    <input
                      type="number"
                      value={formData.metaIndividual}
                      onChange={(e) => setFormData({ ...formData, metaIndividual: e.target.value })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      {editingFuncionario ? 'Atualizar' : 'Cadastrar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Funcionarios;

