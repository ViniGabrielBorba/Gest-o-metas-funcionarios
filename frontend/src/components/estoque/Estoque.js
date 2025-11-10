import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { FaPlus, FaEdit, FaTrash, FaBox, FaPrint, FaSave } from 'react-icons/fa';

const Estoque = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAvaliacao, setEditingAvaliacao] = useState(null);
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [filtroFrequencia, setFiltroFrequencia] = useState('');
  const [compararAvaliacoes, setCompararAvaliacoes] = useState(false);
  const [avaliacaoSelecionada1, setAvaliacaoSelecionada1] = useState('');
  const [avaliacaoSelecionada2, setAvaliacaoSelecionada2] = useState('');
  const [formData, setFormData] = useState({
    frequenciaAvaliacao: 'Semanal',
    formaPagamento: 'Ganho',
    responsaveis: '',
    gerentes: false,
    outros: false,
    outrosEspecificacao: '',
    topicos: [
      { topico: 'Atraso na produção de novos produtos - definir tempo máximo para conclusão.', observacoesPontuacao: '' },
      { topico: 'Avarias - definir prazos para retorno e sinalização adequada (sem alarme).', observacoesPontuacao: '' },
      { topico: 'Abastecimento de loja - garantir reposição impecável, com auxiliar responsável e tempo definido após solicitação.', observacoesPontuacao: '' },
      { topico: 'Organização do estoque - limpeza, descarte e etiquetagem de todos os produtos armazenados.', observacoesPontuacao: '' },
      { topico: 'Falta de produtos do galpão - garantir que produtos disponíveis no galpão não faltem na loja.', observacoesPontuacao: '' },
      { topico: 'Falta de suprimentos - identificar e registrar as causas.', observacoesPontuacao: '' },
      { topico: 'Produtos com preço antigo ou sem precificação - corrigir e manter atualizado.', observacoesPontuacao: '' }
    ],
    sugestoesNovosTopicos: ['', '', '', ''],
    tipoValor: 'Fixo',
    valorMinimoSugerido: 200.00,
    assinatura: '',
    data: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAvaliacoes();
  }, []);

  const fetchAvaliacoes = async () => {
    try {
      const response = await api.get('/estoque');
      setAvaliacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (avaliacao = null) => {
    if (avaliacao) {
      setEditingAvaliacao(avaliacao);
      setFormData({
        frequenciaAvaliacao: avaliacao.frequenciaAvaliacao,
        formaPagamento: avaliacao.formaPagamento,
        responsaveis: avaliacao.responsaveis || '',
        gerentes: avaliacao.gerentes || false,
        outros: avaliacao.outros || false,
        outrosEspecificacao: avaliacao.outrosEspecificacao || '',
        topicos: avaliacao.topicos || formData.topicos,
        sugestoesNovosTopicos: avaliacao.sugestoesNovosTopicos || ['', '', '', ''],
        tipoValor: avaliacao.tipoValor || 'Fixo',
        valorMinimoSugerido: avaliacao.valorMinimoSugerido || 200.00,
        assinatura: avaliacao.assinatura || '',
        data: avaliacao.data ? new Date(avaliacao.data).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setEditingAvaliacao(null);
      setFormData({
        frequenciaAvaliacao: 'Semanal',
        formaPagamento: 'Ganho',
        responsaveis: '',
        gerentes: false,
        outros: false,
        outrosEspecificacao: '',
        topicos: [
          { topico: 'Atraso na produção de novos produtos - definir tempo máximo para conclusão.', observacoesPontuacao: '' },
          { topico: 'Avarias - definir prazos para retorno e sinalização adequada (sem alarme).', observacoesPontuacao: '' },
          { topico: 'Abastecimento de loja - garantir reposição impecável, com auxiliar responsável e tempo definido após solicitação.', observacoesPontuacao: '' },
          { topico: 'Organização do estoque - limpeza, descarte e etiquetagem de todos os produtos armazenados.', observacoesPontuacao: '' },
          { topico: 'Falta de produtos do galpão - garantir que produtos disponíveis no galpão não faltem na loja.', observacoesPontuacao: '' },
          { topico: 'Falta de suprimentos - identificar e registrar as causas.', observacoesPontuacao: '' },
          { topico: 'Produtos com preço antigo ou sem precificação - corrigir e manter atualizado.', observacoesPontuacao: '' }
        ],
        sugestoesNovosTopicos: ['', '', '', ''],
        tipoValor: 'Fixo',
        valorMinimoSugerido: 200.00,
        assinatura: '',
        data: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAvaliacao(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let avaliacaoSalva;
      if (editingAvaliacao) {
        const response = await api.put(`/estoque/${editingAvaliacao._id}`, formData);
        avaliacaoSalva = response.data;
      } else {
        const response = await api.post('/estoque', formData);
        avaliacaoSalva = response.data;
      }
      
      toast.success('Avaliação salva com sucesso!');
      
      // Perguntar se quer imprimir ANTES de fechar o modal
      const querImprimir = window.confirm('Deseja imprimir agora?');
      
      handleCloseModal();
      fetchAvaliacoes();
      
      // Se quiser imprimir, usar os dados salvos do servidor
      if (querImprimir) {
        // Aguardar um pouco para garantir que os dados foram salvos
        setTimeout(() => {
          handleImprimir(avaliacaoSalva);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
      console.error('Dados enviados:', formData);
      toast.error(error.response?.data?.message || 'Erro ao salvar avaliação');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await api.delete(`/estoque/${id}`);
        fetchAvaliacoes();
        toast.success('Avaliação excluída com sucesso!');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Erro ao excluir avaliação');
      }
    }
  };

  const handleImprimir = (avaliacao) => {
    // Garantir que temos os dados corretos
    if (!avaliacao) {
      toast.error('Erro: Dados da avaliação não encontrados');
      return;
    }
    
    // Log para debug
    console.log('Imprimindo avaliação:', avaliacao);
    console.log('Topicos:', avaliacao.topicos);
    console.log('Gerentes:', avaliacao.gerentes);
    console.log('Outros:', avaliacao.outros);
    
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Formulário - Pauta da Reunião</title>
          <style>
            @media print {
              @page { margin: 2cm; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              text-align: center;
              color: #169486;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 30px;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 20px;
            }
            .section h2 {
              color: #169486;
              margin-bottom: 15px;
            }
            .checkbox-group {
              margin: 10px 0;
            }
            .checkbox-group label {
              margin-right: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            table th, table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            table th {
              background-color: #f0fdfa;
              color: #169486;
              font-weight: bold;
            }
            .signature {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
          </style>
        </head>
        <body>
          <h1>Formulário - Pauta da Reunião</h1>
          
          <div class="section">
            <h2>1. Definição da Forma de Avaliação</h2>
            <div class="checkbox-group">
              <strong>Frequência da avaliação:</strong>
              <label>${avaliacao.frequenciaAvaliacao === 'Semanal' ? '☑' : '☐'} Semanal</label>
              <label>${avaliacao.frequenciaAvaliacao === 'Mensal' ? '☑' : '☐'} Mensal</label>
            </div>
            <div class="checkbox-group" style="margin-top: 15px;">
              <strong>Forma de pagamento:</strong>
              <label>${avaliacao.formaPagamento === 'Ganho' ? '☑' : '☐'} Ganho</label>
              <label>${avaliacao.formaPagamento === 'Perda' ? '☑' : '☐'} Perda</label>
            </div>
          </div>

          <div class="section">
            <h2>2. Responsáveis pela Avaliação</h2>
            <p><strong>Responsáveis:</strong> ${avaliacao.responsaveis || ''}</p>
            <div class="checkbox-group">
              <label>${avaliacao.gerentes ? '☑' : '☐'} Gerentes</label>
              <label>${avaliacao.outros ? '☑' : '☐'} Outros${avaliacao.outros && avaliacao.outrosEspecificacao ? ` (${avaliacao.outrosEspecificacao})` : ' (especifique)'}</label>
            </div>
          </div>

          <div class="section">
            <h2>3. Tópicos Importantes para Avaliação</h2>
            <table>
              <thead>
                <tr>
                  <th>Tópico</th>
                  <th>Observações / Pontuação</th>
                </tr>
              </thead>
              <tbody>
                ${(avaliacao.topicos || []).map((t, i) => `
                  <tr>
                    <td>${i + 1}. ${t.topico || ''}</td>
                    <td>${t.observacoesPontuacao || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>4. Sugestões de Novos Tópicos</h2>
            <p><em>Espaço para incluir novos pontos a serem avaliados</em></p>
            ${(avaliacao.sugestoesNovosTopicos || []).filter(s => s && s.trim()).map((s, i) => `<p>${i + 1}. ${s}</p>`).join('') || '<p>Nenhuma sugestão adicionada.</p>'}
          </div>

          <div class="section">
            <h2>5. Pontuação e Valores</h2>
            <div class="checkbox-group">
              <strong>Tipo de valor:</strong>
              <label>${avaliacao.tipoValor === 'Fixo' ? '☑' : '☐'} Fixo</label>
              <label>${avaliacao.tipoValor === 'Variável' ? '☑' : '☐'} Variável</label>
            </div>
            <div style="margin-top: 15px;">
              <strong>Valor mínimo sugerido:</strong> R$ ${avaliacao.valorMinimoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div class="signature">
            <p><strong>Assinatura dos Responsáveis:</strong> ${avaliacao.assinatura || ''}</p>
            <p><strong>Data:</strong> ${new Date(avaliacao.data).toLocaleDateString('pt-BR')}</p>
          </div>
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    setTimeout(() => {
      janelaImpressao.print();
    }, 250);
  };

  const updateTopico = (index, value) => {
    const newTopicos = [...formData.topicos];
    newTopicos[index].observacoesPontuacao = value;
    setFormData({ ...formData, topicos: newTopicos });
  };

  const updateSugestao = (index, value) => {
    const newSugestoes = [...formData.sugestoesNovosTopicos];
    newSugestoes[index] = value;
    setFormData({ ...formData, sugestoesNovosTopicos: newSugestoes });
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold mb-2 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <FaBox /> Estoque - Pauta da Reunião
            </h1>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Gerencie as avaliações de estoque e reuniões</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Nova Avaliação
          </button>
        </div>

        {/* Filtros */}
        <div className={`card mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <FaFilter /> Filtros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequência</label>
              <select
                value={filtroFrequencia}
                onChange={(e) => setFiltroFrequencia(e.target.value)}
                className="input-field"
              >
                <option value="">Todas</option>
                <option value="Semanal">Semanal</option>
                <option value="Mensal">Mensal</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={compararAvaliacoes}
                onChange={(e) => setCompararAvaliacoes(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">Comparar avaliações</span>
            </label>
          </div>
          {compararAvaliacoes && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação 1</label>
                <select
                  value={avaliacaoSelecionada1}
                  onChange={(e) => setAvaliacaoSelecionada1(e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecione...</option>
                  {avaliacoes.map(av => (
                    <option key={av._id} value={av._id}>
                      {new Date(av.data).toLocaleDateString('pt-BR')} - {av.frequenciaAvaliacao}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avaliação 2</label>
                <select
                  value={avaliacaoSelecionada2}
                  onChange={(e) => setAvaliacaoSelecionada2(e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecione...</option>
                  {avaliacoes.map(av => (
                    <option key={av._id} value={av._id}>
                      {new Date(av.data).toLocaleDateString('pt-BR')} - {av.frequenciaAvaliacao}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Comparação de Avaliações */}
        {compararAvaliacoes && avaliacaoSelecionada1 && avaliacaoSelecionada2 && (
          <div className="card mb-6 bg-blue-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Comparação de Avaliações</h3>
            <div className="grid grid-cols-2 gap-4">
              {[avaliacaoSelecionada1, avaliacaoSelecionada2].map((avId, index) => {
                const av = avaliacoes.find(a => a._id === avId);
                if (!av) return null;
                return (
                  <div key={avId} className="bg-white p-4 rounded-lg">
                    <h4 className="font-bold text-gray-800 mb-2">
                      Avaliação {index + 1} - {new Date(av.data).toLocaleDateString('pt-BR')}
                    </h4>
                    <p><strong>Frequência:</strong> {av.frequenciaAvaliacao}</p>
                    <p><strong>Forma de Pagamento:</strong> {av.formaPagamento}</p>
                    <p><strong>Valor Mínimo:</strong> R$ {av.valorMinimoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p><strong>Responsáveis:</strong> {av.responsaveis || 'Não informado'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {avaliacoes.length === 0 ? (
          <div className="card text-center py-12">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-4">Nenhuma avaliação cadastrada</p>
            <button
              onClick={() => handleOpenModal()}
              className="btn-primary"
            >
              Criar Primeira Avaliação
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avaliacoes
              .filter(av => {
                if (filtroDataInicio && new Date(av.data) < new Date(filtroDataInicio)) return false;
                if (filtroDataFim && new Date(av.data) > new Date(filtroDataFim)) return false;
                if (filtroFrequencia && av.frequenciaAvaliacao !== filtroFrequencia) return false;
                return true;
              })
              .map((avaliacao) => (
              <div key={avaliacao._id} className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {new Date(avaliacao.data).toLocaleDateString('pt-BR')}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {avaliacao.frequenciaAvaliacao} - {avaliacao.formaPagamento}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleImprimir(avaliacao)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Imprimir"
                    >
                      <FaPrint />
                    </button>
                    <button
                      onClick={() => handleOpenModal(avaliacao)}
                      className="text-green-600 hover:text-green-800"
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(avaliacao._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Excluir"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Responsáveis:</strong> {avaliacao.responsaveis || 'Não informado'}</p>
                  <p><strong>Tipo de valor:</strong> {avaliacao.tipoValor}</p>
                  <p><strong>Valor mínimo:</strong> R$ {avaliacao.valorMinimoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Formulário */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-4 max-h-[95vh] overflow-y-auto">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {editingAvaliacao ? 'Editar Avaliação' : 'Nova Avaliação'}
                  </h2>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* Seção 1 */}
                  <div className="border-b pb-3 sm:pb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">1. Definição da Forma de Avaliação</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frequência da avaliação:</label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="frequenciaAvaliacao"
                              value="Semanal"
                              checked={formData.frequenciaAvaliacao === 'Semanal'}
                              onChange={(e) => setFormData({ ...formData, frequenciaAvaliacao: e.target.value })}
                              className="mr-2"
                            />
                            Semanal
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="frequenciaAvaliacao"
                              value="Mensal"
                              checked={formData.frequenciaAvaliacao === 'Mensal'}
                              onChange={(e) => setFormData({ ...formData, frequenciaAvaliacao: e.target.value })}
                              className="mr-2"
                            />
                            Mensal
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Forma de pagamento:</label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="formaPagamento"
                              value="Ganho"
                              checked={formData.formaPagamento === 'Ganho'}
                              onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                              className="mr-2"
                            />
                            Ganho
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="formaPagamento"
                              value="Perda"
                              checked={formData.formaPagamento === 'Perda'}
                              onChange={(e) => setFormData({ ...formData, formaPagamento: e.target.value })}
                              className="mr-2"
                            />
                            Perda
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Seção 2 */}
                  <div className="border-b pb-3 sm:pb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">2. Responsáveis pela Avaliação</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Responsáveis:</label>
                        <input
                          type="text"
                          value={formData.responsaveis}
                          onChange={(e) => setFormData({ ...formData, responsaveis: e.target.value })}
                          className="input-field"
                          placeholder="Digite os responsáveis"
                        />
                      </div>
                      <div className="flex gap-6">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.gerentes}
                            onChange={(e) => setFormData({ ...formData, gerentes: e.target.checked })}
                            className="mr-2"
                          />
                          Gerentes
                        </label>
                        <label className="flex items-center flex-1">
                          <input
                            type="checkbox"
                            checked={formData.outros}
                            onChange={(e) => setFormData({ ...formData, outros: e.target.checked })}
                            className="mr-2"
                          />
                          Outros (especifique):
                          {formData.outros && (
                            <input
                              type="text"
                              value={formData.outrosEspecificacao}
                              onChange={(e) => setFormData({ ...formData, outrosEspecificacao: e.target.value })}
                              className="input-field ml-2 flex-1"
                              placeholder="Especifique"
                            />
                          )}
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Seção 3 */}
                  <div className="border-b pb-3 sm:pb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">3. Tópicos Importantes para Avaliação</h3>
                    <div className="overflow-x-auto -mx-2 sm:mx-0">
                      <div className="space-y-3">
                        {formData.topicos.map((topico, index) => (
                          <div key={index} className="border rounded-lg p-3 bg-gray-50">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                              {index + 1}. {topico.topico}
                            </p>
                            <textarea
                              value={topico.observacoesPontuacao}
                              onChange={(e) => updateTopico(index, e.target.value)}
                              className="input-field w-full text-sm"
                              rows="2"
                              placeholder="Digite observações ou pontuação..."
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Seção 4 */}
                  <div className="border-b pb-3 sm:pb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">4. Sugestões de Novos Tópicos</h3>
                    <p className="text-sm text-gray-600 mb-3 italic">Espaço para incluir novos pontos a serem avaliados</p>
                    <div className="space-y-2">
                      {formData.sugestoesNovosTopicos.map((sugestao, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-gray-600">({index + 1})</span>
                          <input
                            type="text"
                            value={sugestao}
                            onChange={(e) => updateSugestao(index, e.target.value)}
                            className="input-field flex-1"
                            placeholder="Digite um novo tópico..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seção 5 */}
                  <div className="border-b pb-3 sm:pb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">5. Pontuação e Valores</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de valor:</label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tipoValor"
                              value="Fixo"
                              checked={formData.tipoValor === 'Fixo'}
                              onChange={(e) => setFormData({ ...formData, tipoValor: e.target.value })}
                              className="mr-2"
                            />
                            Fixo
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="tipoValor"
                              value="Variável"
                              checked={formData.tipoValor === 'Variável'}
                              onChange={(e) => setFormData({ ...formData, tipoValor: e.target.value })}
                              className="mr-2"
                            />
                            Variável
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor mínimo sugerido (R$)
                        </label>
                        <input
                          type="number"
                          value={formData.valorMinimoSugerido}
                          onChange={(e) => setFormData({ ...formData, valorMinimoSugerido: parseFloat(e.target.value) || 0 })}
                          className="input-field"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Assinatura e Data */}
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Assinatura e Data</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assinatura dos Responsáveis:</label>
                        <input
                          type="text"
                          value={formData.assinatura}
                          onChange={(e) => setFormData({ ...formData, assinatura: e.target.value })}
                          className="input-field"
                          placeholder="Digite a assinatura"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data:</label>
                        <input
                          type="date"
                          value={formData.data}
                          onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                          className="input-field"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg text-sm sm:text-base"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <FaSave /> {editingAvaliacao ? 'Atualizar' : 'Salvar'} Avaliação
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

export default Estoque;

