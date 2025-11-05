import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUsers,
  FaDollarSign,
  FaCalendar,
  FaPrint
} from 'react-icons/fa';

const Funcionarios = ({ setIsAuthenticated }) => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState(null);
  const [showVendaModal, setShowVendaModal] = useState(false);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    sexo: 'Masculino',
    idade: '',
    funcao: '',
    dataAniversario: '',
    metaIndividual: ''
  });
  const [vendaData, setVendaData] = useState({
    data: new Date().toISOString().split('T')[0],
    valor: '',
    observacao: ''
  });
  const [showHistoricoModal, setShowHistoricoModal] = useState(false);
  const [vendasDiarias, setVendasDiarias] = useState([]);

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (funcionario = null) => {
    if (funcionario) {
      setEditingFuncionario(funcionario);
      setFormData({
        nome: funcionario.nome,
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
    } catch (error) {
      alert(error.response?.data?.message || 'Erro ao salvar funcionário');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
      try {
        await api.delete(`/funcionarios/${id}`);
        fetchFuncionarios();
      } catch (error) {
        alert(error.response?.data?.message || 'Erro ao excluir funcionário');
      }
    }
  };

  const handleOpenVendaModal = (funcionario) => {
    setSelectedFuncionario(funcionario);
    setShowVendaModal(true);
    setVendaData({
      data: new Date().toISOString().split('T')[0],
      valor: '',
      observacao: ''
    });
  };

  const handleSubmitVenda = async (e) => {
    e.preventDefault();
    try {
      // Validar se o valor foi preenchido
      if (!vendaData.valor || parseFloat(vendaData.valor) <= 0) {
        alert('Por favor, informe um valor válido para a venda.');
        return;
      }

      // Validar se a data foi preenchida
      if (!vendaData.data) {
        alert('Por favor, selecione uma data para a venda.');
        return;
      }

      const response = await api.post(`/funcionarios/${selectedFuncionario._id}/vendas-diarias`, vendaData);
      setShowVendaModal(false);
      fetchFuncionarios();
      alert('Venda registrada com sucesso! O total mensal foi atualizado automaticamente.');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      const mensagemErro = error.response?.data?.message || error.message || 'Erro ao salvar venda. Verifique os dados e tente novamente.';
      alert(mensagemErro);
    }
  };

  const handleVerHistorico = async (funcionario) => {
    setSelectedFuncionario(funcionario);
    try {
      const mesAtual = new Date().getMonth() + 1;
      const anoAtual = new Date().getFullYear();
      const response = await api.get(`/funcionarios/${funcionario._id}/vendas-diarias?mes=${mesAtual}&ano=${anoAtual}`);
      setVendasDiarias(response.data);
      setShowHistoricoModal(true);
    } catch (error) {
      alert('Erro ao carregar histórico de vendas');
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

  const handleImprimir = () => {
    if (!selectedFuncionario || vendasDiarias.length === 0) {
      alert('Não há dados para imprimir');
      return;
    }

    // Preparar dados para o gráfico
    const dadosGrafico = vendasDiarias
      .map(v => ({
        data: new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        valor: v.valor
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data.split('/').reverse().join('-'));
        const dateB = new Date(b.data.split('/').reverse().join('-'));
        return dateA - dateB;
      });

    // Coletar todas as observações do mês
    const observacoes = vendasDiarias
      .filter(v => v.observacao && v.observacao.trim() !== '')
      .map(v => ({
        data: new Date(v.data).toLocaleDateString('pt-BR'),
        observacao: v.observacao
      }));

    // Criar conteúdo para impressão
    // Determinar mês e ano das vendas (usar a primeira venda como referência)
    const primeiraVenda = vendasDiarias.length > 0 ? new Date(vendasDiarias[0].data) : new Date();
    const mesVenda = primeiraVenda.getMonth() + 1;
    const anoVenda = primeiraVenda.getFullYear();
    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mesNome = `${meses[mesVenda - 1]} de ${anoVenda}`;
    
    const totalVendas = vendasDiarias.reduce((sum, v) => sum + v.valor, 0);
    const percentualMeta = ((totalVendas / selectedFuncionario.metaIndividual) * 100).toFixed(1);

    // Criar janela de impressão
    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Relatório - ${selectedFuncionario.nome}</title>
          <style>
            @media print {
              @page {
                margin: 2cm;
              }
              body {
                margin: 0;
              }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              border-bottom: 3px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #1f2937;
              font-size: 28px;
            }
            .header p {
              margin: 5px 0;
              color: #6b7280;
            }
            .info-section {
              margin-bottom: 30px;
            }
            .info-section h2 {
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              padding: 10px;
              background: #f9fafb;
              border-radius: 5px;
            }
            .info-item strong {
              color: #1f2937;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            table th, table td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #e5e7eb;
            }
            table th {
              background: #f3f4f6;
              font-weight: bold;
              color: #1f2937;
            }
            table tr:hover {
              background: #f9fafb;
            }
            .total {
              font-weight: bold;
              font-size: 18px;
              color: #059669;
            }
            .observacoes {
              margin-top: 30px;
            }
            .observacao-item {
              padding: 10px;
              margin-bottom: 10px;
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
            }
            .observacao-item strong {
              color: #92400e;
            }
            .grafico-container {
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .grafico-container h2 {
              color: #1f2937;
              margin-bottom: 20px;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-weight: bold;
              margin-top: 10px;
            }
            .status-success {
              background: #d1fae5;
              color: #065f46;
            }
            .status-warning {
              background: #fed7aa;
              color: #92400e;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório de Vendas - ${selectedFuncionario.nome}</h1>
            <p><strong>Período:</strong> ${mesNome}</p>
            <p><strong>Gerado em:</strong> ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
          </div>

          <div class="info-section">
            <h2>Dados do Funcionário</h2>
            <div class="info-grid">
              <div class="info-item">
                <strong>Nome:</strong> ${selectedFuncionario.nome}
              </div>
              <div class="info-item">
                <strong>Função:</strong> ${selectedFuncionario.funcao}
              </div>
              <div class="info-item">
                <strong>Idade:</strong> ${selectedFuncionario.idade} anos
              </div>
              <div class="info-item">
                <strong>Sexo:</strong> ${selectedFuncionario.sexo}
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2>Resumo de Vendas</h2>
            <div class="info-grid">
              <div class="info-item">
                <strong>Meta Individual:</strong><br>
                R$ ${selectedFuncionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div class="info-item">
                <strong>Total Vendido:</strong><br>
                <span style="color: #059669; font-size: 20px; font-weight: bold;">
                  R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div class="info-item">
                <strong>Percentual da Meta:</strong><br>
                <span style="font-size: 18px; font-weight: bold;">${percentualMeta}%</span>
              </div>
              <div class="info-item">
                <strong>Status:</strong><br>
                <span class="status-badge ${totalVendas >= selectedFuncionario.metaIndividual ? 'status-success' : 'status-warning'}">
                  ${totalVendas >= selectedFuncionario.metaIndividual ? '✅ Meta Batida!' : '⚠️ Meta em Andamento'}
                </span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2>Vendas Diárias</h2>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th style="text-align: right;">Valor (R$)</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                ${vendasDiarias
                  .sort((a, b) => new Date(a.data) - new Date(b.data))
                  .map(v => `
                    <tr>
                      <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                      <td style="text-align: right; color: #059669; font-weight: bold;">
                        R$ ${v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td>${v.observacao || '-'}</td>
                    </tr>
                  `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total do Mês</strong></td>
                  <td style="text-align: right;" class="total">
                    R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          ${observacoes.length > 0 ? `
            <div class="observacoes">
              <h2>Observações do Mês</h2>
              ${observacoes.map(obs => `
                <div class="observacao-item">
                  <strong>${obs.data}:</strong> ${obs.observacao}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="grafico-container">
            <h2>Gráfico de Vendas Diárias</h2>
            <div id="grafico"></div>
            <p style="text-align: center; color: #6b7280; margin-top: 20px;">
              Gráfico gerado automaticamente com os dados das vendas diárias
            </p>
          </div>

          <div class="footer">
            <p>Este relatório foi gerado automaticamente pelo Sistema de Gestão de Metas</p>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/recharts@2.10.3/dist/Recharts.min.js"></script>
          <script>
            // Dados do gráfico
            const dadosGrafico = ${JSON.stringify(dadosGrafico)};
            
            // Criar gráfico usando Recharts (se disponível) ou canvas simples
            window.onload = function() {
              const container = document.getElementById('grafico');
              if (container && dadosGrafico && dadosGrafico.length > 0) {
                // Criar um gráfico simples usando canvas
                const canvas = document.createElement('canvas');
                canvas.width = 800;
                canvas.height = 400;
                container.appendChild(canvas);
                
                const ctx = canvas.getContext('2d');
                const padding = 50;
                const width = canvas.width - padding * 2;
                const height = canvas.height - padding * 2;
                
                // Encontrar valores máximo e mínimo
                const valores = dadosGrafico.map(d => d.valor);
                const maxValor = Math.max(...valores);
                const minValor = 0; // Sempre começar do zero
                const range = maxValor - minValor || 1;
                
                // Desenhar eixos
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(padding, padding);
                ctx.lineTo(padding, canvas.height - padding);
                ctx.lineTo(canvas.width - padding, canvas.height - padding);
                ctx.stroke();
                
                // Desenhar linhas de grade e valores no eixo Y
                ctx.strokeStyle = '#e5e7eb';
                ctx.lineWidth = 1;
                ctx.font = '10px Arial';
                ctx.fillStyle = '#666';
                ctx.textAlign = 'right';
                const numLinhas = 5;
                for (let i = 0; i <= numLinhas; i++) {
                  const y = padding + (height / numLinhas) * i;
                  const valor = maxValor - (range / numLinhas) * i;
                  
                  // Linha de grade
                  ctx.beginPath();
                  ctx.moveTo(padding, y);
                  ctx.lineTo(canvas.width - padding, y);
                  ctx.stroke();
                  
                  // Valor no eixo Y
                  ctx.fillText('R$ ' + valor.toFixed(0), padding - 5, y + 3);
                }
                
                // Desenhar barras
                const barWidth = width / dadosGrafico.length;
                const barSpacing = barWidth * 0.1;
                const actualBarWidth = barWidth - barSpacing;
                
                ctx.fillStyle = '#059669';
                dadosGrafico.forEach((d, i) => {
                  const barHeight = ((d.valor - minValor) / range) * height;
                  const x = padding + i * barWidth + barSpacing / 2;
                  const y = canvas.height - padding - barHeight;
                  
                  ctx.fillRect(x, y, actualBarWidth, barHeight);
                  
                  // Valor acima da barra
                  ctx.fillStyle = '#333';
                  ctx.font = '12px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('R$ ' + d.valor.toFixed(2), x + actualBarWidth / 2, y - 5);
                  ctx.fillStyle = '#059669';
                  
                  // Data abaixo da barra
                  ctx.fillStyle = '#666';
                  ctx.font = '10px Arial';
                  ctx.fillText(d.data, x + actualBarWidth / 2, canvas.height - padding + 20);
                  ctx.fillStyle = '#059669';
                });
                
                // Título do eixo Y
                ctx.save();
                ctx.translate(20, canvas.height / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillStyle = '#333';
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Valor (R$)', 0, 0);
                ctx.restore();
              } else {
                container.innerHTML = '<p style="text-align: center; color: #999;">Gráfico não disponível</p>';
              }
            };
          </script>
        </body>
      </html>
    `);
    
    janelaImpressao.document.close();
    
    // Aguardar um pouco para o conteúdo carregar antes de imprimir
    setTimeout(() => {
      janelaImpressao.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar setIsAuthenticated={setIsAuthenticated} />
        <div className="flex items-center justify-center h-96">
          <div className="text-xl text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Funcionários</h1>
            <p className="text-gray-600">Gerencie sua equipe</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Novo Funcionário
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {funcionarios.map(funcionario => (
            <div key={funcionario._id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{funcionario.nome}</h3>
                  <p className="text-gray-600">{funcionario.funcao}</p>
                </div>
                <span className="badge bg-purple-100 text-purple-800">
                  {funcionario.sexo}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
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
                <div className="flex items-center gap-2 text-gray-600">
                  <FaDollarSign />
                  <span>Meta: R$ {funcionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Vendas do mês:</span>
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

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenVendaModal(funcionario)}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <FaDollarSign /> Venda Diária
                  </button>
                  <button
                    onClick={() => handleVerHistorico(funcionario)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    📊 Histórico
                  </button>
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
            </div>
          ))}
        </div>

        {funcionarios.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">Nenhum funcionário cadastrado</p>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo
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

        {/* Modal de Venda */}
        {showVendaModal && selectedFuncionario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Registrar Venda - {selectedFuncionario.nome}
                </h2>
                <form onSubmit={handleSubmitVenda} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data da Venda
                    </label>
                    <input
                      type="date"
                      value={vendaData.data}
                      onChange={(e) => setVendaData({ ...vendaData, data: e.target.value })}
                      className="input-field"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      O total mensal será calculado automaticamente ao salvar
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor da Venda (R$)
                    </label>
                    <input
                      type="number"
                      value={vendaData.valor}
                      onChange={(e) => setVendaData({ ...vendaData, valor: e.target.value })}
                      className="input-field"
                      min="0"
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observação (opcional)
                    </label>
                    <textarea
                      value={vendaData.observacao}
                      onChange={(e) => setVendaData({ ...vendaData, observacao: e.target.value })}
                      className="input-field"
                      rows="3"
                      placeholder="Ex: Cliente X, produto Y..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowVendaModal(false)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 btn-primary"
                    >
                      Salvar Venda
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Histórico de Vendas Diárias */}
        {showHistoricoModal && selectedFuncionario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Histórico de Vendas - {selectedFuncionario.nome}
                  </h2>
                  <div className="flex gap-2">
                    {vendasDiarias.length > 0 && (
                      <button
                        onClick={handleImprimir}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        title="Imprimir Relatório"
                      >
                        <FaPrint /> Imprimir
                      </button>
                    )}
                    <button
                      onClick={() => setShowHistoricoModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Meta Individual:</span>
                      <span className="font-bold text-gray-800 ml-2">
                        R$ {selectedFuncionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total do Mês:</span>
                      <span className={`font-bold ml-2 ${
                        getVendaMes(selectedFuncionario) >= selectedFuncionario.metaIndividual
                          ? 'text-green-600'
                          : 'text-orange-600'
                      }`}>
                        R$ {getVendaMes(selectedFuncionario).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Progresso:</span>
                      <div className="mt-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            getVendaMes(selectedFuncionario) >= selectedFuncionario.metaIndividual
                              ? 'bg-green-500'
                              : 'bg-orange-500'
                          }`}
                          style={{
                            width: `${Math.min(100, (getVendaMes(selectedFuncionario) / selectedFuncionario.metaIndividual) * 100)}%`
                          }}
                        />
                      </div>
                      <span className={`text-xs font-semibold mt-1 block ${
                        getVendaMes(selectedFuncionario) >= selectedFuncionario.metaIndividual
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {((getVendaMes(selectedFuncionario) / selectedFuncionario.metaIndividual) * 100).toFixed(1)}% da meta
                        {getVendaMes(selectedFuncionario) >= selectedFuncionario.metaIndividual ? ' ✅' : ' ⚠️'}
                      </span>
                    </div>
                  </div>
                </div>

                {vendasDiarias.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhuma venda registrada este mês</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700 mb-2">Vendas Diárias:</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-right">Valor</th>
                            <th className="px-4 py-2 text-left">Observação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendasDiarias.map((venda, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-2">
                                {new Date(venda.data).toLocaleDateString('pt-BR')}
                              </td>
                              <td className="px-4 py-2 text-right font-semibold text-green-600">
                                R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {venda.observacao || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold">
                          <tr>
                            <td className="px-4 py-2">Total:</td>
                            <td className="px-4 py-2 text-right text-green-600">
                              R$ {vendasDiarias.reduce((sum, v) => sum + v.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Funcionarios;

