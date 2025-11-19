const express = require('express');
const Funcionario = require('../models/Funcionario');
const Meta = require('../models/Meta');
const auth = require('../middleware/auth');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Obter dados do dashboard
router.get('/', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    // Buscar funcionários
    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });

    // Buscar meta do mês
    const meta = await Meta.findOne({
      gerenteId: req.user.id,
      mes: mesAtual,
      ano: anoAtual
    });

    // Calcular vendas do mês
    const vendasMes = funcionarios.map(func => {
      try {
        const venda = (func.vendas || []).find(
          v => v && v.mes === mesAtual && v.ano === anoAtual
        );
        // Montar nome completo (nome + sobrenome)
        const nomeCompleto = func.sobrenome && func.sobrenome.trim() !== ''
          ? `${func.nome || ''} ${func.sobrenome}`
          : (func.nome || '');
        return {
          funcionarioId: func._id,
          nome: func.nome || '',
          sobrenome: func.sobrenome || '',
          nomeCompleto: nomeCompleto,
          funcao: (func.funcao && typeof func.funcao === 'string') ? func.funcao : '',
          valor: (venda && venda.valor) ? Number(venda.valor) : 0,
          metaIndividual: (func.metaIndividual) ? Number(func.metaIndividual) : 0
        };
      } catch (err) {
        console.error('Erro ao processar funcionário:', func._id, err);
        return {
          funcionarioId: func._id,
          nome: func.nome || '',
          sobrenome: func.sobrenome || '',
          nomeCompleto: func.nome || '',
          funcao: '',
          valor: 0,
          metaIndividual: 0
        };
      }
    });

    // Calcular total de vendas do mês - apenas de funcionários com função de venda
    const funcoesVenda = ['Vendedor', 'Vendedora', 'Vendedor Online'];
    const totalVendasMes = vendasMes
      .filter(v => v.funcao && funcoesVenda.includes(v.funcao))
      .reduce((sum, v) => sum + (Number(v.valor) || 0), 0);

    // Calcular top vendedores do mês (ordenado) - apenas funcionários com função de venda
    const topVendedoresMes = [...vendasMes]
      .filter(v => v.funcao && funcoesVenda.includes(v.funcao))
      .sort((a, b) => (Number(b.valor) || 0) - (Number(a.valor) || 0))
      .filter(v => (Number(v.valor) || 0) > 0)
      .slice(0, 10); // Top 10

    // Calcular vendas diárias do mês (agregado por dia) - Funcionários + Loja
    const vendasDiariasMes = {};
    
    // Vendas dos funcionários - apenas funcionários com função de venda
    const funcoesVendaArray = ['Vendedor', 'Vendedora', 'Vendedor Online'];
    funcionarios.forEach(func => {
      try {
        // Processar vendas diárias apenas de funcionários com função de venda
        const temFuncaoVenda = func.funcao && funcoesVendaArray.includes(func.funcao);
        if (!temFuncaoVenda) return; // Pular funcionários que não são vendedores
        
        if (func.vendasDiarias && Array.isArray(func.vendasDiarias) && func.vendasDiarias.length > 0) {
          func.vendasDiarias.forEach(venda => {
            try {
              if (!venda || !venda.data) return;
              // Normalizar data usando UTC para evitar problemas de timezone
              const vendaDate = new Date(venda.data);
              if (isNaN(vendaDate.getTime())) return;
              // Usar UTC para extrair os componentes (garante dia correto)
              const mesVenda = vendaDate.getUTCMonth() + 1;
              const anoVenda = vendaDate.getUTCFullYear();
              const diaVenda = vendaDate.getUTCDate();
              
              if (mesVenda === mesAtual && anoVenda === anoAtual) {
                const dataKey = `${anoVenda}-${String(mesVenda).padStart(2, '0')}-${String(diaVenda).padStart(2, '0')}`;
                
                if (!vendasDiariasMes[dataKey]) {
                  vendasDiariasMes[dataKey] = {
                    data: dataKey,
                    dia: diaVenda,
                    total: 0,
                    quantidade: 0
                  };
                }
                const valorVenda = Number(venda.valor) || 0;
                vendasDiariasMes[dataKey].total += valorVenda;
                vendasDiariasMes[dataKey].quantidade += 1;
              }
            } catch (err) {
              console.error('Erro ao processar venda diária:', err);
            }
          });
        }
      } catch (err) {
        console.error('Erro ao processar vendas diárias do funcionário:', func._id, err);
      }
    });

    // Vendas comerciais (buscar do novo endpoint)
    const VendaComercial = require('../models/VendaComercial');
    const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
    const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
    
    const vendasComerciais = await VendaComercial.find({
      gerenteId: req.user.id,
      data: {
        $gte: inicioMes,
        $lte: fimMes
      }
    });
    
    console.log(`Encontradas ${vendasComerciais.length} vendas comerciais no mês`);
    
    // Adicionar vendas comerciais ao agregado de vendas diárias
    vendasComerciais.forEach(venda => {
      try {
        const vendaDate = new Date(venda.data);
        const mesVenda = vendaDate.getUTCMonth() + 1;
        const anoVenda = vendaDate.getUTCFullYear();
        const diaVenda = vendaDate.getUTCDate();
        
        if (mesVenda === mesAtual && anoVenda === anoAtual) {
          const dataKey = `${anoVenda}-${String(mesVenda).padStart(2, '0')}-${String(diaVenda).padStart(2, '0')}`;
          
          if (!vendasDiariasMes[dataKey]) {
            vendasDiariasMes[dataKey] = {
              data: dataKey,
              dia: diaVenda,
              total: 0,
              quantidade: 0
            };
          }
          vendasDiariasMes[dataKey].total += parseFloat(venda.valor) || 0;
          vendasDiariasMes[dataKey].quantidade += 1;
        }
      } catch (err) {
        console.error('Erro ao processar venda comercial:', err);
      }
    });
    
    // Calcular total de vendas comerciais do mês
    const totalVendasComerciais = vendasComerciais.reduce((sum, v) => sum + (v.valor || 0), 0);
    console.log(`Total de vendas comerciais do mês: R$ ${totalVendasComerciais}`);

    // Converter para array e ordenar por data
    const vendasDiariasArray = Object.values(vendasDiariasMes)
      .sort((a, b) => (a.dia || 0) - (b.dia || 0));

    // Encontrar melhor vendedor do mês (apenas funcionários com função de venda)
    const vendedoresFiltrados = vendasMes.filter(v => v.funcao && funcoesVenda.includes(v.funcao));
    const melhorMes = vendedoresFiltrados.length > 0
      ? vendedoresFiltrados.reduce((best, current) => {
          const valorAtual = Number(current.valor) || 0;
          const valorBest = Number(best.valor) || 0;
          return valorAtual > valorBest ? current : best;
        }, { nome: 'Nenhum', valor: 0, nomeCompleto: 'Nenhum' })
      : { nome: 'Nenhum', valor: 0, nomeCompleto: 'Nenhum' };

    // Calcular total vendido (vendas dos funcionários + vendas comerciais)
    // O meta.totalVendido inclui apenas vendas dos funcionários agora
    const totalVendidoGeral = (meta && meta.totalVendido ? meta.totalVendido : 0) + totalVendasComerciais;
    const faltandoParaMeta = meta ? Math.max(0, meta.valor - totalVendidoGeral) : 0;
    const excedenteMeta = meta ? Math.max(0, totalVendidoGeral - meta.valor) : 0;
    const metaBatida = meta && totalVendidoGeral >= meta.valor;
    
    // Calcular status da meta considerando o tempo decorrido
    const hoje = new Date();
    const mesAtualSistema = hoje.getMonth() + 1;
    const anoAtualSistema = hoje.getFullYear();
    const isMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
    
    // Calcular dias decorridos
    const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
    let diasDecorridos = 0;
    
    if (isMesAtual) {
      diasDecorridos = hoje.getDate();
    } else if (anoAtual > anoAtualSistema || (anoAtual === anoAtualSistema && mesAtual > mesAtualSistema)) {
      diasDecorridos = 0;
    } else {
      diasDecorridos = diasNoMes;
    }
    
    const percentualEsperado = diasDecorridos > 0 ? (diasDecorridos / diasNoMes) * 100 : 0;
    const percentualAtingido = meta && meta.valor > 0 ? (totalVendidoGeral / meta.valor) * 100 : 0;
    const diferencaPercentual = percentualAtingido - percentualEsperado;
    
    // Determinar status da meta
    let statusMeta = 'abaixo';
    if (metaBatida) {
      statusMeta = 'batida';
    } else if (isMesAtual) {
      if (diferencaPercentual >= 5) {
        statusMeta = 'no_prazo';
      } else if (diferencaPercentual >= -10) {
        statusMeta = 'no_ritmo';
      } else {
        statusMeta = 'abaixo';
      }
    } else {
      if (percentualAtingido >= 100) {
        statusMeta = 'batida';
      } else if (percentualAtingido >= 70) {
        statusMeta = 'no_prazo';
      } else if (percentualAtingido >= 50) {
        statusMeta = 'no_ritmo';
      } else {
        statusMeta = 'abaixo';
      }
    }

    // Aniversariantes do mês
    const aniversariantes = funcionarios
      .filter(func => {
        try {
          if (!func.dataAniversario) return false;
          const dataAniv = new Date(func.dataAniversario);
          if (isNaN(dataAniv.getTime())) return false;
          return dataAniv.getMonth() + 1 === mesAtual;
        } catch (err) {
          console.error('Erro ao processar aniversário do funcionário:', func._id, err);
          return false;
        }
      })
      .map(func => {
        try {
          // Montar nome completo (nome + sobrenome)
          const nomeCompleto = func.sobrenome && func.sobrenome.trim() !== ''
            ? `${func.nome || ''} ${func.sobrenome}`
            : (func.nome || '');
          const dataAniv = new Date(func.dataAniversario);
          return {
            id: func._id,
            nome: func.nome || '',
            sobrenome: func.sobrenome || '',
            nomeCompleto: nomeCompleto,
            dia: dataAniv.getDate() || 1
          };
        } catch (err) {
          console.error('Erro ao mapear aniversariante:', func._id, err);
          return {
            id: func._id,
            nome: func.nome || '',
            sobrenome: func.sobrenome || '',
            nomeCompleto: func.nome || '',
            dia: 1
          };
        }
      });

    res.json({
      resumo: {
        totalFuncionarios: funcionarios.length,
        metaMes: meta ? meta.valor : 0,
        totalVendasMes,
        totalVendidoLoja: totalVendidoGeral, // Mantido para compatibilidade
        totalVendidoGeral, // Total geral (funcionários + comerciais)
        totalVendasComerciais, // Total de vendas comerciais do mês
        faltandoParaMeta,
        excedenteMeta,
        metaBatida,
        statusMeta, // Status detalhado considerando tempo
        percentualAtingido, // Percentual total atingido
        percentualEsperado: isMesAtual ? percentualEsperado : null, // Percentual esperado (apenas mês atual)
        diasDecorridos: isMesAtual ? diasDecorridos : null, // Dias decorridos (apenas mês atual)
        diasNoMes: isMesAtual ? diasNoMes : null, // Total de dias no mês (apenas mês atual)
        melhorVendedorMes: melhorMes
      },
      vendasMes,
      topVendedoresMes,
      vendasDiarias: vendasDiariasArray,
      aniversariantes
    });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Erro ao buscar dados do dashboard',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Alertas e notificações para o gerente
router.get('/alertas', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });
    const meta = await Meta.findOne({
      gerenteId: req.user.id,
      mes: mesAtual,
      ano: anoAtual
    });

    const alertas = [];

    // Buscar vendas comerciais
    const VendaComercial = require('../models/VendaComercial');
    const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
    const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
    const vendasComerciais = await VendaComercial.find({
      gerenteId: req.user.id,
      data: { $gte: inicioMes, $lte: fimMes }
    });
    const totalVendasComerciais = vendasComerciais.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
    
    // Calcular total geral (vendas funcionários + vendas comerciais)
    const totalGeral = (meta && meta.totalVendido ? meta.totalVendido : 0) + totalVendasComerciais;

    // Calcular status da meta considerando tempo decorrido (mesma lógica do dashboard)
    if (meta && meta.valor > 0) {
      const hoje = new Date();
      const mesAtualSistema = hoje.getMonth() + 1;
      const anoAtualSistema = hoje.getFullYear();
      const isMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
      
      // Calcular dias decorridos
      const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
      let diasDecorridos = 0;
      
      if (isMesAtual) {
        diasDecorridos = hoje.getDate();
      } else if (anoAtual > anoAtualSistema || (anoAtual === anoAtualSistema && mesAtual > mesAtualSistema)) {
        diasDecorridos = 0;
      } else {
        diasDecorridos = diasNoMes;
      }
      
      const percentualEsperado = diasDecorridos > 0 ? (diasDecorridos / diasNoMes) * 100 : 0;
      const percentualAtingido = (totalGeral / meta.valor) * 100;
      const diferencaPercentual = percentualAtingido - percentualEsperado;
      
      // Determinar status da meta
      let statusMeta = 'abaixo';
      if (totalGeral >= meta.valor) {
        statusMeta = 'batida';
      } else if (isMesAtual) {
        if (diferencaPercentual >= 5) {
          statusMeta = 'no_prazo';
        } else if (diferencaPercentual >= -10) {
          statusMeta = 'no_ritmo';
        } else {
          statusMeta = 'abaixo';
        }
      } else {
        if (percentualAtingido >= 100) {
          statusMeta = 'batida';
        } else if (percentualAtingido >= 70) {
          statusMeta = 'no_prazo';
        } else if (percentualAtingido >= 50) {
          statusMeta = 'no_ritmo';
        } else {
          statusMeta = 'abaixo';
        }
      }
      
      // Gerar alertas baseados no status
      if (statusMeta === 'batida') {
        const excedente = totalGeral - meta.valor;
        alertas.push({
          tipo: 'sucesso',
          icone: '🎯',
          titulo: 'Meta Batida!',
          mensagem: `Parabéns! A meta foi atingida com ${percentualAtingido.toFixed(1)}%. Excedente: R$ ${excedente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          valor: totalGeral,
          meta: meta.valor
        });
      } else if (statusMeta === 'abaixo') {
        // Apenas mostrar alerta quando realmente estiver abaixo do esperado
        const mensagem = isMesAtual && diasDecorridos > 0
          ? `A meta está em ${percentualAtingido.toFixed(1)}% (esperado: ${percentualEsperado.toFixed(1)}%). Faltam R$ ${(meta.valor - totalGeral).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir a meta.`
          : `A meta está em ${percentualAtingido.toFixed(1)}%. Faltam R$ ${(meta.valor - totalGeral).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir a meta.`;
        
        alertas.push({
          tipo: 'alerta',
          icone: '⚠️',
          titulo: 'Meta Abaixo do Esperado',
          mensagem: mensagem,
          valor: totalGeral,
          meta: meta.valor
        });
      }
      // Não mostrar alerta para "no_prazo" ou "no_ritmo" - são situações normais
    }

    // Funcionários sem vendas no mês
    const funcionariosSemVendas = funcionarios.filter(f => {
      const v = f.vendas.find(v => v.mes === mesAtual && v.ano === anoAtual);
      return !v || v.valor === 0;
    });

    if (funcionariosSemVendas.length > 0) {
      alertas.push({
        tipo: 'info',
        icone: '📋',
        titulo: 'Funcionários sem Vendas',
        mensagem: `${funcionariosSemVendas.length} funcionário(s) ainda não registraram vendas neste mês.`,
        funcionarios: funcionariosSemVendas.map(f => {
          // Montar nome completo (nome + sobrenome)
          return f.sobrenome && f.sobrenome.trim() !== ''
            ? `${f.nome} ${f.sobrenome}`
            : f.nome;
        })
      });
    }

    // Funcionários abaixo da meta individual (considerando tempo decorrido)
    const hoje = new Date();
    const mesAtualSistema = hoje.getMonth() + 1;
    const anoAtualSistema = hoje.getFullYear();
    const isMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
    
    // Calcular dias decorridos
    const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
    let diasDecorridos = 0;
    
    if (isMesAtual) {
      diasDecorridos = hoje.getDate();
    } else if (anoAtual > anoAtualSistema || (anoAtual === anoAtualSistema && mesAtual > mesAtualSistema)) {
      diasDecorridos = 0;
    } else {
      diasDecorridos = diasNoMes;
    }
    
    const percentualEsperado = diasDecorridos > 0 ? (diasDecorridos / diasNoMes) * 100 : 0;
    
    const funcionariosAbaixoMeta = funcionarios.filter(f => {
      const v = f.vendas.find(v => v.mes === mesAtual && v.ano === anoAtual);
      const valorVendido = v ? v.valor : 0;
      
      if (f.metaIndividual <= 0) return false; // Ignorar funcionários sem meta
      
      // Se já bateu a meta, não está abaixo
      if (valorVendido >= f.metaIndividual) return false;
      
      // Calcular percentual atingido
      const percentualAtingido = (valorVendido / f.metaIndividual) * 100;
      
      // Se for o mês atual, considerar o tempo decorrido
      if (isMesAtual && diasDecorridos > 0) {
        const diferencaPercentual = percentualAtingido - percentualEsperado;
        
        // Apenas considerar "abaixo" se estiver significativamente abaixo do esperado (mais de 10% abaixo)
        // Se estiver entre -10% e +5%, está "no ritmo" (não precisa alertar)
        // Se estiver acima de +5%, está "no prazo" (não precisa alertar)
        return diferencaPercentual < -10;
      } else {
        // Para meses passados, usar classificação simples
        // Apenas alertar se estiver abaixo de 50% da meta
        return percentualAtingido < 50;
      }
    });

    if (funcionariosAbaixoMeta.length > 0) {
      alertas.push({
        tipo: 'warning',
        icone: '📊',
        titulo: 'Funcionários Abaixo da Meta',
        mensagem: `${funcionariosAbaixoMeta.length} funcionário(s) estão abaixo da meta individual${isMesAtual && diasDecorridos > 0 ? ` (esperado: ${percentualEsperado.toFixed(1)}% do mês)` : ''}.`,
        funcionarios: funcionariosAbaixoMeta.map(f => {
          // Montar nome completo (nome + sobrenome)
          return f.sobrenome && f.sobrenome.trim() !== ''
            ? `${f.nome} ${f.sobrenome}`
            : f.nome;
        })
      });
    }

    res.json({ alertas });
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Erro ao buscar dados do dashboard',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

