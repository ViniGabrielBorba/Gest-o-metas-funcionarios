const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { exportToExcel, exportToCSV, formatDate, formatCurrency, formatNumber } = require('../utils/export');
const Funcionario = require('../models/Funcionario');
const Meta = require('../models/Meta');
const logger = require('../utils/logger');

// Todas as rotas precisam de autenticação
router.use(auth);

// Exportar funcionários para Excel
router.get('/funcionarios/excel', async (req, res) => {
  try {
    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });

    const data = funcionarios.map(func => ({
      nome: func.nome,
      sexo: func.sexo,
      idade: func.idade,
      funcao: func.funcao,
      dataAniversario: formatDate(func.dataAniversario),
      metaIndividual: formatCurrency(func.metaIndividual),
      totalVendas: formatCurrency(
        func.vendas.reduce((sum, v) => sum + v.valor, 0)
      )
    }));

    const headers = [
      { label: 'Nome', key: 'nome', width: 30 },
      { label: 'Sexo', key: 'sexo', width: 15 },
      { label: 'Idade', key: 'idade', width: 10 },
      { label: 'Função', key: 'funcao', width: 20 },
      { label: 'Data Aniversário', key: 'dataAniversario', width: 20 },
      { label: 'Meta Individual', key: 'metaIndividual', width: 20 },
      { label: 'Total Vendas', key: 'totalVendas', width: 20 }
    ];

    const workbook = await exportToExcel(data, headers);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=funcionarios.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();

    logger.audit('Exportação de funcionários para Excel', req.user.id, {
      count: funcionarios.length
    });
  } catch (error) {
    logger.error('Erro ao exportar funcionários para Excel', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao exportar funcionários',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Exportar funcionários para CSV
router.get('/funcionarios/csv', async (req, res) => {
  try {
    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });

    const data = funcionarios.map(func => ({
      nome: func.nome,
      sexo: func.sexo,
      idade: func.idade,
      funcao: func.funcao,
      dataAniversario: formatDate(func.dataAniversario),
      metaIndividual: func.metaIndividual,
      totalVendas: func.vendas.reduce((sum, v) => sum + v.valor, 0)
    }));

    // Gerar CSV usando função otimizada
    const headers = [
      { label: 'Nome', key: 'nome' },
      { label: 'Sexo', key: 'sexo' },
      { label: 'Idade', key: 'idade' },
      { label: 'Função', key: 'funcao' },
      { label: 'Data Aniversário', key: 'dataAniversario' },
      { label: 'Meta Individual', key: 'metaIndividual' },
      { label: 'Total Vendas', key: 'totalVendas' }
    ];

    const csv = exportToCSV(data, headers);
    const filename = `funcionarios-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send('\ufeff' + csv); // BOM para Excel reconhecer UTF-8

    logger.audit('Exportação de funcionários para CSV', req.user.id, {
      count: funcionarios.length
    });
  } catch (error) {
    logger.error('Erro ao exportar funcionários para CSV', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao exportar funcionários',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Exportar vendas para Excel
router.get('/vendas/excel', async (req, res) => {
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

    const data = [];

    // Adicionar vendas dos funcionários
    funcionarios.forEach(func => {
      const vendaMes = func.vendas.find(
        v => v.mes === mesAtual && v.ano === anoAtual
      );
      const vendasDiarias = func.vendasDiarias.filter(v => {
        const vendaDate = new Date(v.data);
        return vendaDate.getMonth() + 1 === mesAtual &&
               vendaDate.getFullYear() === anoAtual;
      });

      vendasDiarias.forEach(venda => {
        data.push({
          tipo: 'Funcionário',
          funcionario: func.nome,
          data: formatDate(venda.data),
          valor: formatCurrency(venda.valor),
          observacoes: venda.observacao || ''
        });
      });
    });

    // Adicionar vendas da loja
    if (meta && meta.vendasDiarias) {
      meta.vendasDiarias.forEach(venda => {
        const vendaDate = new Date(venda.data);
        if (vendaDate.getMonth() + 1 === mesAtual &&
            vendaDate.getFullYear() === anoAtual) {
          data.push({
            tipo: 'Loja',
            funcionario: '-',
            data: formatDate(venda.data),
            valor: formatCurrency(venda.valor),
            observacoes: venda.observacao || ''
          });
        }
      });
    }

    const headers = [
      { label: 'Tipo', key: 'tipo', width: 15 },
      { label: 'Funcionário', key: 'funcionario', width: 30 },
      { label: 'Data', key: 'data', width: 15 },
      { label: 'Valor', key: 'valor', width: 20 },
      { label: 'Observações', key: 'observacoes', width: 40 }
    ];

    const workbook = await exportToExcel(data, headers);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=vendas-${mesAtual}-${anoAtual}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();

    logger.audit('Exportação de vendas para Excel', req.user.id, {
      mes: mesAtual,
      ano: anoAtual,
      count: data.length
    });
  } catch (error) {
    logger.error('Erro ao exportar vendas para Excel', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao exportar vendas',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

module.exports = router;

