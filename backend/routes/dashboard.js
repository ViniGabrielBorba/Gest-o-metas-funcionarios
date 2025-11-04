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
          const vendaDate = new Date(venda.data);
          if (vendaDate.getMonth() + 1 === mesAtual && vendaDate.getFullYear() === anoAtual) {
            const dia = vendaDate.getDate();
            const dataKey = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            
            if (!vendasDiariasMes[dataKey]) {
              vendasDiariasMes[dataKey] = {
                data: dataKey,
                dia,
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
    if (meta && meta.vendasDiarias && meta.vendasDiarias.length > 0) {
      meta.vendasDiarias.forEach(venda => {
        const vendaDate = new Date(venda.data);
        if (vendaDate.getMonth() + 1 === mesAtual && vendaDate.getFullYear() === anoAtual) {
          const dia = vendaDate.getDate();
          const dataKey = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          
          if (!vendasDiariasMes[dataKey]) {
            vendasDiariasMes[dataKey] = {
              data: dataKey,
              dia,
              total: 0,
              quantidade: 0
            };
          }
          vendasDiariasMes[dataKey].total += venda.valor;
          vendasDiariasMes[dataKey].quantidade += 1;
        }
      });
    }

    // Converter para array e ordenar por data
    const vendasDiariasArray = Object.values(vendasDiariasMes)
      .sort((a, b) => a.dia - b.dia);

    // Encontrar melhor vendedor do mês
    const melhorMes = vendasMes.reduce((best, current) => 
      current.valor > best.valor ? current : best, 
      { nome: 'Nenhum', valor: 0 }
    );

    // Calcular total vendido da loja no mês
    const totalVendidoLoja = meta && meta.totalVendido ? meta.totalVendido : 0;
    const faltandoParaMeta = meta ? Math.max(0, meta.valor - totalVendidoLoja) : 0;
    const excedenteMeta = meta ? Math.max(0, totalVendidoLoja - meta.valor) : 0;
    const metaBatida = meta && totalVendidoLoja >= meta.valor;

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
        totalVendidoLoja,
        faltandoParaMeta,
        excedenteMeta,
        metaBatida,
        percentualAtingido: meta ? (totalVendidoLoja / meta.valor * 100) : 0,
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

module.exports = router;

