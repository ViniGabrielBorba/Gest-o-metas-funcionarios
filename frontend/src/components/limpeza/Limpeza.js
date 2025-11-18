import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPrint,
  FaBroom,
  FaCalendar,
  FaCheck,
  FaTimes,
  FaSave
} from 'react-icons/fa';

const Limpeza = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [escala, setEscala] = useState(null);
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [editandoDia, setEditandoDia] = useState(null);
  const [novaEscala, setNovaEscala] = useState([]);
  const [funcionariosManuais, setFuncionariosManuais] = useState([]);
  const [novoFuncionarioManual, setNovoFuncionarioManual] = useState('');
  const [editandoFuncionarioManual, setEditandoFuncionarioManual] = useState(null);
  const [nomeEditandoFuncionarioManual, setNomeEditandoFuncionarioManual] = useState('');

  useEffect(() => {
    fetchFuncionarios();
    fetchEscala();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesSelecionado, anoSelecionado]);

  const fetchEscala = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/limpeza/mes/${mesSelecionado}/ano/${anoSelecionado}`);
      setEscala(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        setEscala(null);
      } else {
        console.error('Erro ao buscar escala:', error);
        toast.error('Erro ao carregar escala');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      const data = response.data;
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
    }
  };

  const getNomeCompleto = (funcionario) => {
    if (funcionario.tipo === 'manual' || (!funcionario._id && funcionario.nome)) {
      return funcionario.nome || '';
    }
    if (funcionario.sobrenome && funcionario.sobrenome.trim() !== '') {
      return `${funcionario.nome} ${funcionario.sobrenome}`;
    }
    return funcionario.nome || '';
  };

  const gerarDiasDoMes = () => {
    const hoje = new Date();
    const hojeAno = hoje.getFullYear();
    const hojeMes = hoje.getMonth() + 1;
    const hojeDia = hoje.getDate();
    
    // Obter o número correto de dias no mês
    // new Date(ano, mes, 0) retorna o último dia do mês anterior
    // Então new Date(ano, mesSelecionado, 0) retorna o último dia de (mesSelecionado - 1)
    // Para obter o último dia do mês selecionado, usamos new Date(ano, mesSelecionado, 0)
    const diasNoMes = new Date(anoSelecionado, mesSelecionado, 0).getDate();
    const dias = [];
    
    // Se for o mês atual, começar a partir de hoje
    // Se for mês futuro, começar do dia 1
    const diaInicial = (anoSelecionado === hojeAno && mesSelecionado === hojeMes) 
      ? hojeDia 
      : 1;
    
    // Garantir que vamos até o último dia do mês
    for (let i = diaInicial; i <= diasNoMes; i++) {
      // Criar data no formato correto (mês é 0-indexed no JavaScript)
      const data = new Date(anoSelecionado, mesSelecionado - 1, i);
      // Verificar se a data é válida e está no mês correto
      if (data.getMonth() === mesSelecionado - 1 && data.getDate() === i) {
        dias.push(data);
      }
    }
    return dias;
  };

  const handleCriarEscala = () => {
    const dias = gerarDiasDoMes();
    const escalaInicial = dias.map(data => ({
      data: data.toISOString().split('T')[0],
      funcionario: null,
      tarefas: {
        mesa: false,
        panos: false,
        microondas: false,
        geladeira: false
      },
      assinatura: ''
    }));
    setNovaEscala(escalaInicial);
    setFuncionariosManuais([]);
    setShowModal(true);
  };

  const handleEditarEscala = () => {
    if (!escala) return;
    
    // Separar funcionários manuais existentes
    const funcionariosManuaisExistentes = [];
    escala.escala.forEach(item => {
      if (item.funcionario && item.funcionario.tipo === 'manual' && !funcionariosManuaisExistentes.find(f => f.nome === item.funcionario.nome)) {
        funcionariosManuaisExistentes.push(item.funcionario);
      }
    });
    
    setNovaEscala(escala.escala.map(item => ({
      _id: item._id,
      data: new Date(item.data).toISOString().split('T')[0],
      funcionario: item.funcionario,
      tarefas: item.tarefas,
      assinatura: item.assinatura
    })));
    setFuncionariosManuais(funcionariosManuaisExistentes);
    setShowModal(true);
  };

  const handleSalvarEscala = async () => {
    try {
      // Filtrar apenas os dias que têm funcionário atribuído
      const escalaComFuncionarios = novaEscala.filter(dia => dia.funcionario);
      
      if (escalaComFuncionarios.length === 0) {
        toast.error('Adicione pelo menos um funcionário para algum dia');
        return;
      }

      await api.post('/limpeza', {
        mes: mesSelecionado,
        ano: anoSelecionado,
        escala: escalaComFuncionarios
      });

      toast.success('Escala salva com sucesso!');
      setShowModal(false);
      fetchEscala();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao salvar escala');
    }
  };

  const handleAtualizarTarefa = async (diaId, tarefa, valor) => {
    try {
      if (!escala || !escala._id) return;

      const dia = escala.escala.find(d => d._id === diaId);
      if (!dia) return;

      const novasTarefas = {
        ...dia.tarefas,
        [tarefa]: valor
      };

      await api.put(`/limpeza/${escala._id}/dia/${diaId}`, {
        tarefas: novasTarefas
      });

      await fetchEscala();
      toast.success('Tarefa atualizada!');
    } catch (error) {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleAtualizarAssinatura = async (diaId, assinatura) => {
    try {
      if (!escala || !escala._id) return;

      await api.put(`/limpeza/${escala._id}/dia/${diaId}`, {
        assinatura: assinatura
      });

      await fetchEscala();
      toast.success('Assinatura salva!');
    } catch (error) {
      toast.error('Erro ao salvar assinatura');
    }
  };

  const handleExcluirEscala = async () => {
    if (!escala || !escala._id) return;

    const confirmar = window.confirm(
      `Tem certeza que deseja excluir a escala de ${meses[mesSelecionado - 1]} de ${anoSelecionado}?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmar) return;

    try {
      await api.delete(`/limpeza/${escala._id}`);
      toast.success('Escala excluída com sucesso!');
      setEscala(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao excluir escala');
    }
  };

  const handleAddFuncionarioManual = () => {
    const nome = novoFuncionarioManual.trim();
    if (!nome) {
      toast.error('Digite o nome do funcionário');
      return;
    }
    
    if (funcionariosManuais.some(f => f.nome.toLowerCase() === nome.toLowerCase())) {
      toast.error('Este funcionário já foi adicionado');
      return;
    }

    setFuncionariosManuais([...funcionariosManuais, { nome, tipo: 'manual' }]);
    setNovoFuncionarioManual('');
  };

  const handleEditFuncionarioManual = (index) => {
    const funcionario = funcionariosManuais[index];
    setEditandoFuncionarioManual(index);
    setNomeEditandoFuncionarioManual(funcionario.nome);
  };

  const handleSalvarEdicaoFuncionarioManual = (index) => {
    const nome = nomeEditandoFuncionarioManual.trim();
    if (!nome) {
      toast.error('Digite o nome do funcionário');
      return;
    }
    
    // Verificar se já existe outro funcionário com o mesmo nome (exceto o que está sendo editado)
    if (funcionariosManuais.some((f, i) => i !== index && f.nome.toLowerCase() === nome.toLowerCase())) {
      toast.error('Este funcionário já foi adicionado');
      return;
    }

    const novosFuncionarios = [...funcionariosManuais];
    novosFuncionarios[index].nome = nome;
    setFuncionariosManuais(novosFuncionarios);
    
    // Atualizar também na escala se este funcionário estiver sendo usado
    const novaEscalaAtualizada = novaEscala.map(dia => {
      if (dia.funcionario && dia.funcionario.tipo === 'manual' && dia.funcionario.nome === funcionariosManuais[index].nome) {
        return {
          ...dia,
          funcionario: { ...dia.funcionario, nome }
        };
      }
      return dia;
    });
    setNovaEscala(novaEscalaAtualizada);
    
    setEditandoFuncionarioManual(null);
    setNomeEditandoFuncionarioManual('');
    toast.success('Funcionário editado com sucesso!');
  };

  const handleCancelarEdicaoFuncionarioManual = () => {
    setEditandoFuncionarioManual(null);
    setNomeEditandoFuncionarioManual('');
  };

  const handleRemoveFuncionarioManual = (index) => {
    const funcionario = funcionariosManuais[index];
    const confirmar = window.confirm(
      `Tem certeza que deseja remover "${funcionario.nome}"?\n\nEste funcionário será removido de todos os dias da escala onde estiver atribuído.`
    );
    
    if (!confirmar) return;

    // Remover da lista
    const novosFuncionarios = funcionariosManuais.filter((_, i) => i !== index);
    setFuncionariosManuais(novosFuncionarios);
    
    // Remover da escala onde estiver sendo usado
    const novaEscalaAtualizada = novaEscala.map(dia => {
      if (dia.funcionario && dia.funcionario.tipo === 'manual' && dia.funcionario.nome === funcionario.nome) {
        return {
          ...dia,
          funcionario: null
        };
      }
      return dia;
    });
    setNovaEscala(novaEscalaAtualizada);
    
    toast.success('Funcionário removido com sucesso!');
  };

  const handlePrint = () => {
    if (!escala) return;

    const printWindow = window.open('', '_blank');
    const mesNome = new Date(anoSelecionado, mesSelecionado - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    
    const linhas = escala.escala.map((item, index) => {
      const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
      const nomeFuncionario = getNomeCompleto(item.funcionario);
      
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center; background-color: ${index % 2 === 0 ? '#fff9e6' : '#fff'};">
            ${dataFormatada}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; background-color: ${index % 2 === 0 ? '#e6f3ff' : '#fff'};">
            ${nomeFuncionario}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${item.tarefas.mesa ? '✓' : ''}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${item.tarefas.panos ? '✓' : ''}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${item.tarefas.microondas ? '✓' : ''}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">
            ${item.tarefas.geladeira ? '✓' : ''}
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; min-width: 150px;">
            ${item.assinatura || ''}
          </td>
        </tr>
      `;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ESCALA DE LIMPEZA - ${mesNome.toUpperCase()}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              padding: 15px;
              background-color: #169486;
              color: white;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #169486;
              color: white;
              padding: 12px;
              text-align: center;
              font-weight: bold;
              border: 1px solid #ddd;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧹 ESCALA DE LIMPEZA</h1>
            <p style="margin: 5px 0; font-size: 16px;">${mesNome.toUpperCase()}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>DATA</th>
                <th>NOME</th>
                <th>MESA</th>
                <th>PANOS</th>
                <th>MICROONDAS</th>
                <th>GELADEIRA</th>
                <th>ASSINATURA</th>
              </tr>
            </thead>
            <tbody>
              ${linhas}
            </tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getDiaEscala = (data) => {
    if (!escala || !escala.escala) return null;
    const dataStr = data.toISOString().split('T')[0];
    return escala.escala.find(item => {
      const itemData = new Date(item.data).toISOString().split('T')[0];
      return itemData === dataStr;
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
            <p className={`mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Verificar se é mês atual para mostrar mensagem
  const hoje = new Date();
  const hojeAno = hoje.getFullYear();
  const hojeMes = hoje.getMonth() + 1;
  const hojeDia = hoje.getDate();
  const isMesAtual = anoSelecionado === hojeAno && mesSelecionado === hojeMes;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho */}
        <div className={`mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaBroom className="text-4xl" style={{ color: '#169486' }} />
              <h1 className="text-3xl font-bold">Escala de Limpeza</h1>
            </div>
            <div className="flex gap-2">
              {escala && (
                <>
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    <FaPrint /> Imprimir
                  </button>
                  <button
                    onClick={handleEditarEscala}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit /> Editar Escala
                  </button>
                  <button
                    onClick={handleExcluirEscala}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTrash /> Excluir Escala
                  </button>
                </>
              )}
              {!escala && (
                <button
                  onClick={handleCriarEscala}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <FaPlus /> Criar Escala
                </button>
              )}
            </div>
          </div>

          {/* Seletor de Mês/Ano */}
          <div className="flex gap-4 items-center">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Mês
              </label>
              <select
                value={mesSelecionado}
                onChange={(e) => {
                  setMesSelecionado(parseInt(e.target.value));
                  setEscala(null);
                }}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              >
                {meses.map((mes, index) => (
                  <option key={index + 1} value={index + 1}>{mes}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Ano
              </label>
              <input
                type="number"
                value={anoSelecionado}
                onChange={(e) => {
                  setAnoSelecionado(parseInt(e.target.value));
                  setEscala(null);
                }}
                className={`px-4 py-2 rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
            </div>
          </div>
        </div>

        {/* Tabela de Escala */}
        {escala ? (
          <div className={`rounded-lg shadow-md overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={darkMode ? 'bg-gray-700' : 'bg-teal-600'}>
                    <th className="px-4 py-3 text-left text-white font-semibold">DATA</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">NOME</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">MESA</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">PANOS</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">MICROONDAS</th>
                    <th className="px-4 py-3 text-center text-white font-semibold">GELADEIRA</th>
                    <th className="px-4 py-3 text-left text-white font-semibold">ASSINATURA</th>
                  </tr>
                </thead>
                <tbody>
                  {escala.escala.map((item, index) => {
                    const dataFormatada = new Date(item.data).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit'
                    });
                    const nomeFuncionario = getNomeCompleto(item.funcionario);
                    const isPar = index % 2 === 0;

                    return (
                      <tr
                        key={item._id}
                        className={darkMode 
                          ? (isPar ? 'bg-gray-800' : 'bg-gray-750')
                          : (isPar ? 'bg-yellow-50' : 'bg-white')
                        }
                      >
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {dataFormatada}
                        </td>
                        <td className={`px-4 py-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {nomeFuncionario}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAtualizarTarefa(item._id, 'mesa', !item.tarefas.mesa)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              item.tarefas.mesa
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : darkMode
                                  ? 'border-gray-600 hover:border-teal-500'
                                  : 'border-gray-300 hover:border-teal-500'
                            }`}
                          >
                            {item.tarefas.mesa && <FaCheck className="text-xs" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAtualizarTarefa(item._id, 'panos', !item.tarefas.panos)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              item.tarefas.panos
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : darkMode
                                  ? 'border-gray-600 hover:border-teal-500'
                                  : 'border-gray-300 hover:border-teal-500'
                            }`}
                          >
                            {item.tarefas.panos && <FaCheck className="text-xs" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAtualizarTarefa(item._id, 'microondas', !item.tarefas.microondas)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              item.tarefas.microondas
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : darkMode
                                  ? 'border-gray-600 hover:border-teal-500'
                                  : 'border-gray-300 hover:border-teal-500'
                            }`}
                          >
                            {item.tarefas.microondas && <FaCheck className="text-xs" />}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleAtualizarTarefa(item._id, 'geladeira', !item.tarefas.geladeira)}
                            className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                              item.tarefas.geladeira
                                ? 'bg-teal-600 border-teal-600 text-white'
                                : darkMode
                                  ? 'border-gray-600 hover:border-teal-500'
                                  : 'border-gray-300 hover:border-teal-500'
                            }`}
                          >
                            {item.tarefas.geladeira && <FaCheck className="text-xs" />}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={item.assinatura || ''}
                            onChange={(e) => handleAtualizarAssinatura(item._id, e.target.value)}
                            placeholder="Assinatura"
                            className={`w-full px-2 py-1 rounded border text-sm ${
                              darkMode 
                                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                            } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
            <FaBroom className="text-6xl mx-auto mb-4" style={{ color: '#169486', opacity: 0.5 }} />
            <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Nenhuma escala criada para {meses[mesSelecionado - 1]} de {anoSelecionado}
            </p>
            {isMesAtual && (
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                A escala será criada apenas para os dias restantes do mês (a partir de hoje, dia {hojeDia})
              </p>
            )}
            <button
              onClick={handleCriarEscala}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Criar Escala
            </button>
          </div>
        )}

        {/* Modal de Criar/Editar Escala */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`w-full max-w-5xl rounded-lg shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-h-[90vh] overflow-y-auto`}>
              <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  {escala ? 'Editar Escala' : 'Criar Escala'} - {meses[mesSelecionado - 1]} de {anoSelecionado}
                </h2>
                {!escala && isMesAtual && (
                  <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Você pode preencher apenas os dias que desejar. A escala será criada apenas com os dias que tiverem funcionário atribuído.
                  </p>
                )}
              </div>
              <div className="p-6">
                {/* Adicionar funcionário manual */}
                <div className="mb-6">
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Adicionar Funcionário Manualmente
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={novoFuncionarioManual}
                      onChange={(e) => setNovoFuncionarioManual(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFuncionarioManual();
                        }
                      }}
                      placeholder="Digite o nome e pressione Enter"
                      className={`flex-1 px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                    />
                    <button
                      type="button"
                      onClick={handleAddFuncionarioManual}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                    >
                      <FaPlus /> Adicionar
                    </button>
                  </div>
                  {funcionariosManuais.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {funcionariosManuais.map((func, index) => (
                        <div
                          key={`manual-${index}`}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            darkMode 
                              ? 'bg-blue-900 text-blue-200' 
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {editandoFuncionarioManual === index ? (
                            <>
                              <input
                                type="text"
                                value={nomeEditandoFuncionarioManual}
                                onChange={(e) => setNomeEditandoFuncionarioManual(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSalvarEdicaoFuncionarioManual(index);
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    handleCancelarEdicaoFuncionarioManual();
                                  }
                                }}
                                className={`px-2 py-1 rounded text-sm ${
                                  darkMode 
                                    ? 'bg-gray-700 text-white border-gray-600' 
                                    : 'bg-white text-gray-900 border-gray-300'
                                } border focus:outline-none focus:ring-2 focus:ring-teal-500`}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSalvarEdicaoFuncionarioManual(index)}
                                className="text-green-600 hover:text-green-700"
                                title="Salvar"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={handleCancelarEdicaoFuncionarioManual}
                                className="text-red-600 hover:text-red-700"
                                title="Cancelar"
                              >
                                <FaTimes />
                              </button>
                            </>
                          ) : (
                            <>
                              <span>{func.nome}</span>
                              <button
                                onClick={() => handleEditFuncionarioManual(index)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Editar"
                              >
                                <FaEdit className="text-xs" />
                              </button>
                              <button
                                onClick={() => handleRemoveFuncionarioManual(index)}
                                className="text-red-600 hover:text-red-700"
                                title="Excluir"
                              >
                                <FaTrash className="text-xs" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabela de edição */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={darkMode ? 'bg-gray-700' : 'bg-gray-200'}>
                        <th className="px-3 py-2 text-left text-sm font-semibold">DATA</th>
                        <th className="px-3 py-2 text-left text-sm font-semibold">FUNCIONÁRIO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {novaEscala.map((dia, index) => {
                        const dataFormatada = new Date(dia.data).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit'
                        });
                        const todosFuncionarios = [
                          ...funcionarios.map(f => ({ ...f, tipo: 'cadastrado' })),
                          ...funcionariosManuais
                        ];

                        return (
                          <tr
                            key={index}
                            className={darkMode 
                              ? (index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750')
                              : (index % 2 === 0 ? 'bg-gray-50' : 'bg-white')
                            }
                          >
                            <td className={`px-3 py-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {dataFormatada}
                            </td>
                            <td className="px-3 py-2">
                              <select
                                value={
                                  dia.funcionario?._id 
                                    ? dia.funcionario._id 
                                    : (dia.funcionario?.nome 
                                        ? `manual-${dia.funcionario.nome}` 
                                        : '')
                                }
                                onChange={(e) => {
                                  const valor = e.target.value;
                                  let funcionarioSelecionado = null;
                                  
                                  if (valor.startsWith('manual-')) {
                                    const nome = valor.replace('manual-', '');
                                    funcionarioSelecionado = funcionariosManuais.find(f => f.nome === nome);
                                    if (!funcionarioSelecionado) {
                                      funcionarioSelecionado = { nome, tipo: 'manual' };
                                    }
                                  } else if (valor) {
                                    funcionarioSelecionado = funcionarios.find(f => f._id === valor);
                                  }
                                  
                                  const novaEscalaAtualizada = [...novaEscala];
                                  novaEscalaAtualizada[index].funcionario = funcionarioSelecionado;
                                  setNovaEscala(novaEscalaAtualizada);
                                }}
                                className={`w-full px-3 py-2 rounded border text-sm ${
                                  darkMode 
                                    ? 'bg-gray-700 border-gray-600 text-white' 
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
                              >
                                <option value="">Selecione...</option>
                                {funcionarios.map(func => {
                                  const nomeCompleto = getNomeCompleto(func);
                                  return (
                                    <option key={func._id} value={func._id}>
                                      {nomeCompleto}
                                    </option>
                                  );
                                })}
                                {funcionariosManuais.map((func, idx) => (
                                  <option key={`manual-${idx}`} value={`manual-${func.nome}`}>
                                    {func.nome}
                                  </option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setNovaEscala([]);
                      setFuncionariosManuais([]);
                    }}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvarEscala}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                  >
                    <FaSave /> Salvar Escala
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Limpeza;
