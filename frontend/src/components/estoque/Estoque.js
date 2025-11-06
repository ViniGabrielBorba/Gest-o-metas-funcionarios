import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { FaPlus, FaEdit, FaTrash, FaBox, FaPrint, FaSave } from 'react-icons/fa';

const Estoque = ({ setIsAuthenticated }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAvaliacao, setEditingAvaliacao] = useState(null);
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
      if (editingAvaliacao) {
        await api.put(`/estoque/${editingAvaliacao._id}`, formData);
      } else {
        await api.post('/estoque', formData);
      }
      handleCloseModal();
      fetchAvaliacoes();
      alert('Avaliação salva com sucesso!');
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar avaliação');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta avaliação?')) {
      try {
        await api.delete(`/estoque/${id}`);
        fetchAvaliacoes();
      } catch (error) {
        alert(error.response?.data?.message || 'Erro ao excluir avaliação');
      }
    }
  };

  const handleImprimir = (avaliacao) => {
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
              <label>☐ Semanal</label>
              <label>☐ Mensal</label>
            </div>
            <div style="margin-top: 10px;">
              <strong>Frequência selecionada:</strong> ${avaliacao.frequenciaAvaliacao}
            </div>
            <div class="checkbox-group" style="margin-top: 15px;">
              <strong>Forma de pagamento:</strong>
              <label>☐ Ganho</label>
              <label>☐ Perda</label>
            </div>
            <div style="margin-top: 10px;">
              <strong>Forma selecionada:</strong> ${avaliacao.formaPagamento}
            </div>
          </div>

          <div class="section">
            <h2>2. Responsáveis pela Avaliação</h2>
            <p><strong>Responsáveis:</strong> ${avaliacao.responsaveis || ''}</p>
            <div class="checkbox-group">
              <label>☐ Gerentes</label>
              <label>☐ Outros (especifique)</label>
            </div>
            <div style="margin-top: 10px;">
              <strong>Gerentes:</strong> ${avaliacao.gerentes ? '☑ Sim' : '☐ Não'}
            </div>
            ${avaliacao.outros ? `<div style="margin-top: 10px;"><strong>Outros:</strong> ${avaliacao.outrosEspecificacao || ''}</div>` : ''}
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
                ${avaliacao.topicos.map((t, i) => `
                  <tr>
                    <td>${i + 1}. ${t.topico}</td>
                    <td>${t.observacoesPontuacao || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>4. Sugestões de Novos Tópicos</h2>
            <p><em>Espaço para incluir novos pontos a serem avaliados</em></p>
            ${avaliacao.sugestoesNovosTopicos.filter(s => s.trim()).map((s, i) => `<p>${i + 1}. ${s}</p>`).join('') || '<p>Nenhuma sugestão adicionada.</p>'}
          </div>

          <div class="section">
            <h2>5. Pontuação e Valores</h2>
            <div class="checkbox-group">
              <strong>Tipo de valor:</strong>
              <label>☐ Fixo</label>
              <label>☐ Variável</label>
            </div>
            <div style="margin-top: 10px;">
              <strong>Tipo selecionado:</strong> ${avaliacao.tipoValor}
            </div>
            <div style="margin-top: 15px;">
              <strong>Valor mínimo sugerido:</strong> R$ ${avaliacao.valorMinimoSugerido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (indicação de Dona Ruana)
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
      <div className="min-h-screen">
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <FaBox /> Estoque - Pauta da Reunião
            </h1>
            <p className="text-gray-600">Gerencie as avaliações de estoque e reuniões</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Nova Avaliação
          </button>
        </div>

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
            {avaliacoes.map((avaliacao) => (
              <div key={avaliacao._id} className="card">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingAvaliacao ? 'Editar Avaliação' : 'Nova Avaliação - Pauta da Reunião'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Seção 1 */}
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">1. Definição da Forma de Avaliação</h3>
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
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">2. Responsáveis pela Avaliação</h3>
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
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">3. Tópicos Importantes para Avaliação</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr>
                            <th className="px-4 py-2 text-left bg-gray-100">Tópico</th>
                            <th className="px-4 py-2 text-left bg-gray-100">Observações / Pontuação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.topicos.map((topico, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-3 align-top" style={{ width: '40%' }}>
                                {index + 1}. {topico.topico}
                              </td>
                              <td className="px-4 py-3">
                                <textarea
                                  value={topico.observacoesPontuacao}
                                  onChange={(e) => updateTopico(index, e.target.value)}
                                  className="input-field w-full"
                                  rows="2"
                                  placeholder="Digite observações ou pontuação..."
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Seção 4 */}
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">4. Sugestões de Novos Tópicos</h3>
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
                  <div className="border-b pb-4">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">5. Pontuação e Valores</h3>
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
                        <p className="text-xs text-gray-500 mt-1">(indicação de Dona Ruana)</p>
                      </div>
                    </div>
                  </div>

                  {/* Assinatura e Data */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Assinatura e Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className="flex-1 btn-primary flex items-center justify-center gap-2"
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

