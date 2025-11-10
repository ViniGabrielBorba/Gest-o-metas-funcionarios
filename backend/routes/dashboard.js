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
      const venda = func.vendas.find(
        v => v.mes === mesAtual && v.ano === anoAtual
      );
      return {
        funcionarioId: func._id,
        nome: func.nome,
        valor: venda ? venda.valor : 0,
        metaIndividual: func.metaIndividual
      };
    });

    // Calcular total de vendas do mês
    const totalVendasMes = vendasMes.reduce((sum, v) => sum + v.valor, 0);

    // Calcular top vendedores do mês (ordenado)
    const topVendedoresMes = [...vendasMes]
      .sort((a, b) => b.valor - a.valor)
      .filter(v => v.valor > 0)
      .slice(0, 10); // Top 10

    // Calcular vendas diárias do mês (agregado por dia) - Funcionários + Loja
    const vendasDiariasMes = {};
    
    // Vendas dos funcionários
    funcionarios.forEach(func => {
      if (func.vendasDiarias && func.vendasDiarias.length > 0) {
        func.vendasDiarias.forEach(venda => {
          // Normalizar data usando UTC para evitar problemas de timezone
          const vendaDate = new Date(venda.data);
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
            vendasDiariasMes[dataKey].total += venda.valor;
            vendasDiariasMes[dataKey].quantidade += 1;
          }
        });
      }
    });

    // Vendas da loja (se meta tiver vendas diárias)
    console.log('=== PROCESSANDO VENDAS DA LOJA NO DASHBOARD ===');
    console.log('Meta encontrada:', meta ? 'Sim' : 'Não');
    console.log('Meta mês/ano:', meta ? `${meta.mes}/${meta.ano}` : 'N/A');
    console.log('Mês/Ano atual:', `${mesAtual}/${anoAtual}`);
    console.log('Vendas diárias da meta:', meta?.vendasDiarias?.length || 0);
    
    if (meta && meta.vendasDiarias && meta.vendasDiarias.length > 0) {
      console.log(`Processando ${meta.vendasDiarias.length} vendas da loja...`);
      
      meta.vendasDiarias.forEach((venda, index) => {
        try {
          // Normalizar data usando UTC para evitar problemas de timezone
          const vendaDate = new Date(venda.data);
          
          if (isNaN(vendaDate.getTime())) {
            console.error(`Venda ${index} tem data inválida:`, venda.data);
            return;
          }
          
          // Usar UTC para extrair os componentes (garante dia correto)
          const mesVenda = vendaDate.getUTCMonth() + 1;
          const anoVenda = vendaDate.getUTCFullYear();
          const diaVenda = vendaDate.getUTCDate();
          
          console.log(`Venda ${index + 1}:`, {
            dataOriginal: venda.data,
            dataProcessada: vendaDate.toISOString(),
            mesVenda,
            anoVenda,
            diaVenda,
            valor: venda.valor,
            corresponde: mesVenda === mesAtual && anoVenda === anoAtual
          });
          
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
            
            console.log(`Venda adicionada ao dia ${diaVenda}. Total do dia: R$ ${vendasDiariasMes[dataKey].total}`);
          } else {
            console.log(`Venda ${index + 1} não corresponde ao mês/ano atual (${mesVenda}/${anoVenda} vs ${mesAtual}/${anoAtual})`);
          }
        } catch (err) {
          console.error(`Erro ao processar venda ${index}:`, err);
        }
      });
    } else {
      console.log('Meta não tem vendas diárias ou meta não encontrada');
    }
    
    console.log('Total de dias com vendas:', Object.keys(vendasDiariasMes).length);
    console.log('Vendas diárias processadas:', Object.values(vendasDiariasMes));

    // Converter para array e ordenar por data
    const vendasDiariasArray = Object.values(vendasDiariasMes)
      .sort((a, b) => a.dia - b.dia);

    // Encontrar melhor vendedor do mês
    const melhorMes = vendasMes.reduce((best, current) => 
      current.valor > best.valor ? current : best, 
      { nome: 'Nenhum', valor: 0 }
    );

    // Calcular total vendido (já inclui vendas dos funcionários + vendas diretas da loja)
    // O meta.totalVendido já é calculado somando vendas diretas + vendas dos funcionários
    const totalVendidoGeral = meta && meta.totalVendido ? meta.totalVendido : 0;
    const faltandoParaMeta = meta ? Math.max(0, meta.valor - totalVendidoGeral) : 0;
    const excedenteMeta = meta ? Math.max(0, totalVendidoGeral - meta.valor) : 0;
    const metaBatida = meta && totalVendidoGeral >= meta.valor;

    // Aniversariantes do mês
    const aniversariantes = funcionarios.filter(func => {
      const dataAniv = new Date(func.dataAniversario);
      return dataAniv.getMonth() + 1 === mesAtual;
    }).map(func => ({
      id: func._id,
      nome: func.nome,
      dia: new Date(func.dataAniversario).getDate()
    }));

    res.json({
      resumo: {
        totalFuncionarios: funcionarios.length,
        metaMes: meta ? meta.valor : 0,
        totalVendasMes,
        totalVendidoLoja: totalVendidoGeral, // Mantido para compatibilidade, mas agora usa totalGeral
        totalVendidoGeral, // Novo campo com nome mais claro
        faltandoParaMeta,
        excedenteMeta,
        metaBatida,
        percentualAtingido: meta ? (totalVendidoGeral / meta.valor * 100) : 0,
        melhorVendedorMes: melhorMes
      },
      vendasMes,
      topVendedoresMes,
      vendasDiarias: vendasDiariasArray,
      aniversariantes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
    // Não precisamos somar novamente, pois isso causaria duplicação
    const totalGeral = meta ? (meta.totalVendido || 0) : 0;

    // Meta batida
    if (meta && meta.valor > 0 && totalGeral >= meta.valor) {
      const percentual = ((totalGeral / meta.valor) * 100).toFixed(1);
      const excedente = totalGeral - meta.valor;
      alertas.push({
        tipo: 'sucesso',
        icone: '🎯',
        titulo: 'Meta Batida!',
        mensagem: `Parabéns! A meta foi atingida com ${percentual}%. Excedente: R$ ${excedente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        valor: totalGeral,
        meta: meta.valor
      });
    }

    // Meta abaixo (menos de 70%)
    if (meta && meta.valor > 0 && (totalGeral / meta.valor) < 0.7) {
      const percentual = ((totalGeral / meta.valor) * 100).toFixed(1);
      const faltando = meta.valor - totalGeral;
      alertas.push({
        tipo: 'alerta',
        icone: '⚠️',
        titulo: 'Meta Abaixo do Esperado',
        mensagem: `A meta está em ${percentual}%. Faltam R$ ${faltando.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para atingir a meta.`,
        valor: totalGeral,
        meta: meta.valor
      });
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
        funcionarios: funcionariosSemVendas.map(f => f.nome)
      });
    }

    // Funcionários abaixo da meta individual
    const funcionariosAbaixoMeta = funcionarios.filter(f => {
      const v = f.vendas.find(v => v.mes === mesAtual && v.ano === anoAtual);
      const valorVendido = v ? v.valor : 0;
      return f.metaIndividual > 0 && valorVendido < f.metaIndividual;
    });

    if (funcionariosAbaixoMeta.length > 0) {
      alertas.push({
        tipo: 'warning',
        icone: '📊',
        titulo: 'Funcionários Abaixo da Meta',
        mensagem: `${funcionariosAbaixoMeta.length} funcionário(s) estão abaixo da meta individual.`,
        funcionarios: funcionariosAbaixoMeta.map(f => f.nome)
      });
    }

    res.json({ alertas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

