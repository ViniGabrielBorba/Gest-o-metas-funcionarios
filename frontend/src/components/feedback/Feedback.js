import React, { useState, useEffect } from 'react';
import Navbar from '../layout/Navbar';
import api from '../../utils/api';
import { useToast } from '../../contexts/ToastContext';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { FaPrint, FaChartLine, FaUsers, FaDollarSign, FaSearch, FaFilter } from 'react-icons/fa';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Feedback = ({ setIsAuthenticated }) => {
  const toast = useToast();
  const { darkMode } = useDarkMode();
  const [funcionarios, setFuncionarios] = useState([]);
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  const [vendasDiarias, setVendasDiarias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [observacaoGerente, setObservacaoGerente] = useState('');
  const [salvandoObservacao, setSalvandoObservacao] = useState(false);
  const [buscaFuncionario, setBuscaFuncionario] = useState('');
  const [compararPeriodos, setCompararPeriodos] = useState(false);
  const [mesComparacao, setMesComparacao] = useState(new Date().getMonth() + 1);
  const [anoComparacao, setAnoComparacao] = useState(new Date().getFullYear());
  const [dadosComparacao, setDadosComparacao] = useState(null);

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  useEffect(() => {
    if (selectedFuncionario) {
      fetchVendasFuncionario();
      fetchObservacaoGerente();
    }
  }, [selectedFuncionario, mes, ano]);

  const fetchFuncionarios = async () => {
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    }
  };

  const fetchVendasFuncionario = async () => {
    if (!selectedFuncionario) return;
    
    setLoading(true);
    try {
      const response = await api.get(
        `/funcionarios/${selectedFuncionario._id}/vendas-diarias?mes=${mes}&ano=${ano}`
      );
      setVendasDiarias(response.data || []);
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      setVendasDiarias([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchObservacaoGerente = async () => {
    if (!selectedFuncionario) return;
    
    try {
      const response = await api.get(
        `/funcionarios/${selectedFuncionario._id}/observacoes-gerente?mes=${mes}&ano=${ano}`
      );
      setObservacaoGerente(response.data?.observacao || '');
    } catch (error) {
      console.error('Erro ao buscar observação do gerente:', error);
      setObservacaoGerente('');
    }
  };

  const handleSalvarObservacao = async () => {
    if (!selectedFuncionario) return;
    
    setSalvandoObservacao(true);
    try {
      await api.put(
        `/funcionarios/${selectedFuncionario._id}/observacoes-gerente`,
        {
          mes,
          ano,
          observacao: observacaoGerente
        }
      );
      toast.success('Observação salva com sucesso!');
      
      // Após salvar, oferecer opção de imprimir
      setTimeout(() => {
        if (vendasDiarias.length > 0) {
          const confirmarImpressao = window.confirm(
            'Observação salva com sucesso! Deseja imprimir o relatório completo para mostrar ao funcionário?'
          );
          if (confirmarImpressao) {
            handleImprimir();
          }
        } else {
          toast.info('Observação salva! Quando houver vendas registradas, você poderá imprimir o relatório completo.');
        }
      }, 500);
    } catch (error) {
      console.error('Erro ao salvar observação:', error);
      toast.error('Erro ao salvar observação. Tente novamente.');
    } finally {
      setSalvandoObservacao(false);
    }
  };

  const handleSelectFuncionario = (funcionarioId) => {
    const funcionario = funcionarios.find(f => f._id === funcionarioId);
    setSelectedFuncionario(funcionario);
  };

  const getVendaMes = () => {
    if (!selectedFuncionario) return 0;
    const venda = selectedFuncionario.vendas?.find(
      v => v.mes === mes && v.ano === ano
    );
    return venda ? venda.valor : 0;
  };

  const getChartData = () => {
    return vendasDiarias
      .map(v => ({
        dia: new Date(v.data).getUTCDate(),
        valor: v.valor,
        dataCompleta: new Date(v.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }))
      .sort((a, b) => a.dia - b.dia);
  };

  const handleImprimir = () => {
    if (!selectedFuncionario || vendasDiarias.length === 0) {
      toast.warning('Selecione um funcionário e um período com vendas para imprimir');
      return;
    }

    const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                   'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const mesNome = meses[mes - 1];
    const totalVendas = vendasDiarias.reduce((sum, v) => sum + v.valor, 0);
    const percentualMeta = selectedFuncionario.metaIndividual > 0 
      ? ((totalVendas / selectedFuncionario.metaIndividual) * 100).toFixed(1)
      : 0;

    const chartData = getChartData();
    
    // Usar a observação que já está no estado
    const observacaoGerenteTexto = observacaoGerente || '';

    // Gerar gráfico SVG para impressão
    const gerarGraficoSVG = () => {
      if (chartData.length === 0) return '';
      
      const maxValor = Math.max(...chartData.map(d => d.valor), selectedFuncionario.metaIndividual || 0, 1);
      const svgWidth = 800;
      const svgHeight = 300;
      const padding = 60;
      const chartWidth = svgWidth - (padding * 2);
      const chartHeight = svgHeight - (padding * 2);
      const barWidth = Math.max(15, (chartWidth / chartData.length) - 3);
      
      let svg = `<svg width="${svgWidth}" height="${svgHeight}" style="background: white;">`;
      
      // Eixos
      svg += `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="#169486" stroke-width="2"/>`;
      svg += `<line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="#169486" stroke-width="2"/>`;
      
      // Linha de referência da meta (se aplicável)
      if (selectedFuncionario.metaIndividual > 0) {
        const metaPorDia = selectedFuncionario.metaIndividual / chartData.length;
        const metaY = svgHeight - padding - ((metaPorDia / maxValor) * chartHeight);
        if (metaY >= padding && metaY <= svgHeight - padding) {
          svg += `<line x1="${padding}" y1="${metaY}" x2="${svgWidth - padding}" y2="${metaY}" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,5" opacity="0.7"/>`;
          svg += `<text x="${svgWidth - padding + 10}" y="${metaY + 4}" fill="#ef4444" font-size="11" font-weight="bold">Meta/dia: R$ ${metaPorDia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</text>`;
        }
      }
      
      // Barras do gráfico
      chartData.forEach((item, index) => {
        const barHeight = (item.valor / maxValor) * chartHeight;
        const x = padding + (index * (chartWidth / chartData.length));
        const y = svgHeight - padding - barHeight;
        const isMetaBatida = selectedFuncionario.metaIndividual > 0 && 
                            item.valor >= (selectedFuncionario.metaIndividual / chartData.length);
        
        svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                      fill="${isMetaBatida ? '#10b981' : '#169486'}" 
                      stroke="#fff" stroke-width="1" opacity="0.9"/>`;
        
        // Valor acima da barra
        if (barHeight > 20) {
          svg += `<text x="${x + barWidth/2}" y="${y - 5}" 
                        text-anchor="middle" font-size="10" fill="#333" font-weight="bold">
                    R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                  </text>`;
        }
        
        // Dia abaixo da barra
        svg += `<text x="${x + barWidth/2}" y="${svgHeight - padding + 15}" 
                      text-anchor="middle" font-size="9" fill="#666">
                  Dia ${item.dia}
                </text>`;
      });
      
      // Valores do eixo Y
      for (let i = 0; i <= 5; i++) {
        const valor = (maxValor / 5) * i;
        const y = svgHeight - padding - (i * (chartHeight / 5));
        svg += `<text x="${padding - 10}" y="${y + 4}" text-anchor="end" font-size="10" fill="#666">
                  R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </text>`;
        svg += `<line x1="${padding - 5}" y1="${y}" x2="${padding}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>`;
      }
      
      svg += `</svg>`;
      return svg;
    };

    const graficoSVG = gerarGraficoSVG();

    const janelaImpressao = window.open('', '_blank');
    janelaImpressao.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Feedback - ${selectedFuncionario.nome}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { margin: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .header {
              border-bottom: 3px solid #169486;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              color: #169486;
              font-size: 28px;
            }
            .info-section {
              margin-bottom: 30px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              padding: 15px;
              background: #f0fdfa;
              border-radius: 5px;
              border-left: 4px solid #169486;
            }
            .info-item strong {
              color: #169486;
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
              background: #f0fdfa;
              font-weight: bold;
              color: #169486;
            }
            .total {
              font-weight: bold;
              font-size: 18px;
              color: #169486;
            }
            .grafico-container {
              margin-top: 40px;
              page-break-inside: avoid;
            }
            .grafico-container h3 {
              color: #169486;
              margin-bottom: 20px;
            }
            .observacoes {
              margin-top: 30px;
            }
            .observacao-item {
              padding: 10px;
              margin-bottom: 10px;
              background: #f0fdfa;
              border-left: 4px solid #169486;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Feedback de Desempenho</h1>
            <p><strong>Funcionário:</strong> ${selectedFuncionario.nome}</p>
            <p><strong>Período:</strong> ${mesNome} de ${ano}</p>
            <p><strong>Data do Relatório:</strong> ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>

          <div class="info-section">
            <h2 style="color: #169486; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Informações do Funcionário</h2>
            <div class="info-grid">
              <div class="info-item">
                <strong>Nome:</strong> ${selectedFuncionario.nome}
              </div>
              <div class="info-item">
                <strong>Função:</strong> ${selectedFuncionario.funcao}
              </div>
              <div class="info-item">
                <strong>Meta Individual:</strong> R$ ${selectedFuncionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div class="info-item">
                <strong>Total Vendido:</strong> R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <div class="info-item">
                <strong>Percentual da Meta:</strong> ${percentualMeta}%
              </div>
              <div class="info-item">
                <strong>Status:</strong> ${totalVendas >= selectedFuncionario.metaIndividual ? '✅ Meta Batida!' : '⚠️ Em andamento'}
              </div>
            </div>
          </div>

          <div class="info-section">
            <h2 style="color: #169486; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Vendas Diárias</h2>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Valor</th>
                  <th>Observação</th>
                </tr>
              </thead>
              <tbody>
                ${vendasDiarias.map(v => `
                  <tr>
                    <td>${new Date(v.data).toLocaleDateString('pt-BR')}</td>
                    <td>R$ ${v.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td>${v.observacao || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td><strong>Total:</strong></td>
                  <td class="total">R$ ${totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          ${observacaoGerenteTexto ? `
          <div class="info-section">
            <h2 style="color: #169486; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Observações do Gerente</h2>
            <div class="observacao-item" style="background: #f0fdfa; border-left: 4px solid #169486;">
              <p style="white-space: pre-wrap; margin: 0;">${observacaoGerenteTexto}</p>
              <p style="font-size: 12px; color: #666; margin-top: 10px;">
                <strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          ` : ''}

          ${chartData.length > 0 ? `
          <div class="grafico-container">
            <h3>Gráfico de Vendas Diárias</h3>
            <p style="color: #666; font-size: 14px;">Evolução das vendas ao longo do mês</p>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-top: 20px; text-align: center;">
              ${graficoSVG}
              <div style="margin-top: 15px; padding: 10px; background: #f0fdfa; border-radius: 4px;">
                <p style="margin: 0; font-size: 12px; color: #169486;">
                  <span style="display: inline-block; width: 15px; height: 15px; background: #169486; margin-right: 5px; vertical-align: middle;"></span>
                  Vendas Diárias
                  ${selectedFuncionario.metaIndividual > 0 ? `
                    <span style="display: inline-block; width: 15px; height: 15px; background: #ef4444; margin-left: 15px; margin-right: 5px; vertical-align: middle; border-top: 2px dashed #ef4444;"></span>
                    Meta Individual (R$ ${selectedFuncionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  ` : ''}
                </p>
              </div>
            </div>
          </div>
          ` : ''}

          ${vendasDiarias.filter(v => v.observacao && v.observacao.trim() !== '').length > 0 ? `
          <div class="observacoes">
            <h2 style="color: #169486; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Observações das Vendas</h2>
            ${vendasDiarias.filter(v => v.observacao && v.observacao.trim() !== '').map(v => `
              <div class="observacao-item">
                <strong>${new Date(v.data).toLocaleDateString('pt-BR')}:</strong> ${v.observacao}
              </div>
            `).join('')}
          </div>
          ` : ''}
        </body>
      </html>
    `);
    janelaImpressao.document.close();
    setTimeout(() => {
      janelaImpressao.print();
    }, 250);
  };

  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : ''}`}>
      <Navbar setIsAuthenticated={setIsAuthenticated} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Feedback de Funcionários</h1>
          <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Selecione um funcionário para visualizar seu desempenho e gerar relatório</p>
        </div>

        {/* Busca de Funcionários */}
        <div className={`card mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
          <div className="relative">
            <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Buscar funcionário por nome..."
              value={buscaFuncionario}
              onChange={(e) => setBuscaFuncionario(e.target.value)}
              className={`input-field pl-10 w-full ${darkMode ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : ''}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Seleção de Funcionário */}
          <div className="lg:col-span-1">
            <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                <FaUsers /> Selecionar Funcionário
              </h2>
              <div className="space-y-2">
                <select
                  value={selectedFuncionario?._id || ''}
                  onChange={(e) => handleSelectFuncionario(e.target.value)}
                  className="input-field"
                >
                  <option value="">Selecione um funcionário...</option>
                  {funcionarios
                    .filter(func => 
                      !buscaFuncionario || func.nome.toLowerCase().includes(buscaFuncionario.toLowerCase())
                    )
                    .map(func => (
                      <option key={func._id} value={func._id}>
                        {func.nome}
                      </option>
                    ))}
                </select>
              </div>

              {selectedFuncionario && (
                <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                  <h3 className={`font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{selectedFuncionario.nome}</h3>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}><strong>Função:</strong> {selectedFuncionario.funcao}</p>
                  <p className={`text-sm mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}><strong>Meta:</strong> R$ {selectedFuncionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              )}
            </div>

            {/* Filtros de Mês/Ano */}
            {selectedFuncionario && (
              <div className={`card mt-4 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Filtros</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                    <select
                      value={mes}
                      onChange={(e) => setMes(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{meses[m - 1]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                    <select
                      value={ano}
                      onChange={(e) => setAno(parseInt(e.target.value))}
                      className="input-field"
                    >
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={compararPeriodos}
                        onChange={(e) => setCompararPeriodos(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">Comparar com outro período</span>
                    </label>
                  </div>
                  {compararPeriodos && (
                    <div className="space-y-2 pl-6 border-l-2 border-gray-300">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mês Comparação</label>
                        <select
                          value={mesComparacao}
                          onChange={(e) => setMesComparacao(parseInt(e.target.value))}
                          className="input-field"
                        >
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>{meses[m - 1]}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ano Comparação</label>
                        <select
                          value={anoComparacao}
                          onChange={(e) => setAnoComparacao(parseInt(e.target.value))}
                          className="input-field"
                        >
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Área de Feedback */}
          <div className="lg:col-span-2">
            {!selectedFuncionario ? (
              <div className={`card text-center py-12 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600">Selecione um funcionário para ver o feedback</p>
              </div>
            ) : loading ? (
              <div className={`card text-center py-12 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                <p className="text-xl text-gray-600">Carregando dados...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Resumo */}
                <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FaChartLine /> Resumo do Período
                    </h2>
                    {vendasDiarias.length > 0 && (
                      <button
                        onClick={handleImprimir}
                        className="btn-primary flex items-center gap-2"
                      >
                        <FaPrint /> Imprimir
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-lg">
                      <p className="text-sm opacity-90 mb-1">Meta Individual</p>
                      <p className="text-2xl font-bold">
                        R$ {selectedFuncionario.metaIndividual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className={`p-4 rounded-lg text-white ${
                      getVendaMes() >= selectedFuncionario.metaIndividual
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                        : 'bg-gradient-to-br from-orange-500 to-amber-500'
                    }`}>
                      <p className="text-sm opacity-90 mb-1">Total Vendido</p>
                      <p className="text-2xl font-bold">
                        R$ {getVendaMes().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg">
                      <p className="text-sm opacity-90 mb-1">Percentual</p>
                      <p className="text-2xl font-bold">
                        {selectedFuncionario.metaIndividual > 0
                          ? ((getVendaMes() / selectedFuncionario.metaIndividual) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progresso da Meta</span>
                      <span className={`font-semibold ${
                        getVendaMes() >= selectedFuncionario.metaIndividual ? 'text-green-600' : 'text-orange-600'
                      }`}>
                        {getVendaMes() >= selectedFuncionario.metaIndividual ? '✅ Meta Batida!' : '⚠️ Em andamento'}
                      </span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          getVendaMes() >= selectedFuncionario.metaIndividual ? 'bg-green-500' : 'bg-orange-500'
                        }`}
                        style={{
                          width: `${Math.min(100, selectedFuncionario.metaIndividual > 0 
                            ? (getVendaMes() / selectedFuncionario.metaIndividual) * 100 
                            : 0)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Campo de Observações do Gerente */}
                <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaUsers /> Observações do Gerente
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      value={observacaoGerente}
                      onChange={(e) => setObservacaoGerente(e.target.value)}
                      className="input-field"
                      rows="5"
                      placeholder="Digite suas observações sobre o desempenho do funcionário neste período..."
                    />
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={handleSalvarObservacao}
                        disabled={salvandoObservacao}
                        className="btn-primary flex items-center gap-2"
                      >
                        {salvandoObservacao ? 'Salvando...' : 'Salvar Observação'}
                      </button>
                      {observacaoGerente && vendasDiarias.length > 0 && (
                        <button
                          onClick={handleImprimir}
                          className="btn-secondary flex items-center gap-2"
                        >
                          <FaPrint /> Imprimir Relatório
                        </button>
                      )}
                    </div>
                    {observacaoGerente && (
                      <p className="text-sm text-gray-500">
                        💡 Sua observação será salva para o período de {meses[mes - 1]} de {ano}
                        {vendasDiarias.length > 0 && ' - Após salvar, você poderá imprimir o relatório completo'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Gráfico */}
                {vendasDiarias.length > 0 && getChartData().length > 0 && (
                  <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaChartLine /> Gráfico de Vendas Diárias
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="dia" 
                          label={{ value: 'Dia do Mês', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          labelFormatter={(label) => `Dia ${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#169486" 
                          strokeWidth={3}
                          name="Vendas (R$)"
                          dot={{ fill: '#169486', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Tabela de Vendas */}
                {vendasDiarias.length > 0 ? (
                  <div className={`card ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <FaDollarSign /> Vendas Diárias
                    </h3>
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
                              <td className="px-4 py-2 text-right font-semibold" style={{ color: '#169486' }}>
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
                            <td className="px-4 py-2 text-right" style={{ color: '#169486' }}>
                              R$ {vendasDiarias.reduce((sum, v) => sum + v.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-2"></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className={`card text-center py-12 ${darkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
                    <FaDollarSign className="text-6xl text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">Nenhuma venda registrada neste período</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;

