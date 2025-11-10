const express = require('express');
const VendaComercial = require('../models/VendaComercial');
const auth = require('../middleware/auth');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Listar todas as vendas comerciais (com filtros opcionais)
router.get('/', async (req, res) => {
  try {
    const { mes, ano, data } = req.query;
    
    let query = { gerenteId: req.user.id };
    
    // Filtrar por mês/ano se fornecido
    if (mes && ano) {
      const mesNum = parseInt(mes, 10);
      const anoNum = parseInt(ano, 10);
      const inicioMes = new Date(Date.UTC(anoNum, mesNum - 1, 1, 0, 0, 0, 0));
      const fimMes = new Date(Date.UTC(anoNum, mesNum, 0, 23, 59, 59, 999));
      
      query.data = {
        $gte: inicioMes,
        $lte: fimMes
      };
    } else if (data) {
      // Filtrar por data específica
      const dataFiltro = new Date(data);
      const inicioDia = new Date(Date.UTC(
        dataFiltro.getUTCFullYear(),
        dataFiltro.getUTCMonth(),
        dataFiltro.getUTCDate(),
        0, 0, 0, 0
      ));
      const fimDia = new Date(Date.UTC(
        dataFiltro.getUTCFullYear(),
        dataFiltro.getUTCMonth(),
        dataFiltro.getUTCDate(),
        23, 59, 59, 999
      ));
      
      query.data = {
        $gte: inicioDia,
        $lte: fimDia
      };
    }
    
    const vendas = await VendaComercial.find(query)
      .sort({ data: -1, createdAt: -1 });
    
    res.json(vendas);
  } catch (error) {
    console.error('Erro ao buscar vendas comerciais:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obter vendas comerciais agrupadas por dia
router.get('/agrupadas', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes, 10) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano, 10) : new Date().getFullYear();
    
    const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
    const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
    
    const vendas = await VendaComercial.find({
      gerenteId: req.user.id,
      data: {
        $gte: inicioMes,
        $lte: fimMes
      }
    }).sort({ data: 1 });
    
    // Agrupar por dia
    const vendasPorDia = {};
    
    vendas.forEach(venda => {
      const vendaDate = new Date(venda.data);
      const ano = vendaDate.getUTCFullYear();
      const mes = vendaDate.getUTCMonth() + 1;
      const dia = vendaDate.getUTCDate();
      const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      
      if (!vendasPorDia[dataKey]) {
        vendasPorDia[dataKey] = {
          data: new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0)),
          vendas: [],
          total: 0,
          quantidade: 0
        };
      }
      
      vendasPorDia[dataKey].vendas.push({
        id: venda._id,
        valor: venda.valor,
        observacao: venda.observacao || '',
        createdAt: venda.createdAt
      });
      
      vendasPorDia[dataKey].total += venda.valor;
      vendasPorDia[dataKey].quantidade += 1;
    });
    
    // Converter para array e ordenar por data
    const vendasAgrupadas = Object.values(vendasPorDia)
      .map(dia => ({
        ...dia,
        data: dia.data.toISOString()
      }))
      .sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Calcular resumo
    const totalMes = vendas.reduce((sum, v) => sum + v.valor, 0);
    const totalDias = vendasAgrupadas.length;
    const mediaDiaria = totalDias > 0 ? totalMes / totalDias : 0;
    
    res.json({
      vendasAgrupadas,
      resumo: {
        totalMes,
        totalDias,
        mediaDiaria,
        totalVendas: vendas.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar vendas comerciais agrupadas:', error);
    res.status(500).json({ message: error.message });
  }
});

// Criar nova venda comercial
router.post('/', async (req, res) => {
  try {
    const { data, valor, observacao } = req.body;
    
    if (!data || valor === undefined || valor === null) {
      return res.status(400).json({ message: 'Data e valor são obrigatórios' });
    }
    
    // Normalizar data (usar UTC para evitar problemas de timezone)
    let dataVenda;
    if (typeof data === 'string' && data.includes('-')) {
      const partes = data.split('-');
      if (partes.length === 3) {
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);
        dataVenda = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0));
      } else {
        dataVenda = new Date(data);
        const ano = dataVenda.getUTCFullYear();
        const mes = dataVenda.getUTCMonth();
        const dia = dataVenda.getUTCDate();
        dataVenda = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
      }
    } else {
      dataVenda = new Date(data);
      const ano = dataVenda.getUTCFullYear();
      const mes = dataVenda.getUTCMonth();
      const dia = dataVenda.getUTCDate();
      dataVenda = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
    }
    
    if (isNaN(dataVenda.getTime())) {
      return res.status(400).json({ message: 'Data inválida' });
    }
    
    const venda = await VendaComercial.create({
      gerenteId: req.user.id,
      data: dataVenda,
      valor: parseFloat(valor),
      observacao: observacao || ''
    });
    
    console.log('Venda comercial criada:', venda._id);
    
    res.status(201).json(venda);
  } catch (error) {
    console.error('Erro ao criar venda comercial:', error);
    res.status(500).json({ message: error.message });
  }
});

// Atualizar venda comercial
router.put('/:id', async (req, res) => {
  try {
    const { data, valor, observacao } = req.body;
    
    const venda = await VendaComercial.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });
    
    if (!venda) {
      return res.status(404).json({ message: 'Venda comercial não encontrada' });
    }
    
    if (data !== undefined) {
      // Normalizar data
      let dataVenda;
      if (typeof data === 'string' && data.includes('-')) {
        const partes = data.split('-');
        if (partes.length === 3) {
          const ano = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10);
          const dia = parseInt(partes[2], 10);
          dataVenda = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0));
        } else {
          dataVenda = new Date(data);
          const ano = dataVenda.getUTCFullYear();
          const mes = dataVenda.getUTCMonth();
          const dia = dataVenda.getUTCDate();
          dataVenda = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
        }
      } else {
        dataVenda = new Date(data);
        const ano = dataVenda.getUTCFullYear();
        const mes = dataVenda.getUTCMonth();
        const dia = dataVenda.getUTCDate();
        dataVenda = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
      }
      
      if (isNaN(dataVenda.getTime())) {
        return res.status(400).json({ message: 'Data inválida' });
      }
      
      venda.data = dataVenda;
    }
    
    if (valor !== undefined) {
      venda.valor = parseFloat(valor);
    }
    
    if (observacao !== undefined) {
      venda.observacao = observacao || '';
    }
    
    await venda.save();
    
    res.json(venda);
  } catch (error) {
    console.error('Erro ao atualizar venda comercial:', error);
    res.status(500).json({ message: error.message });
  }
});

// Deletar venda comercial
router.delete('/:id', async (req, res) => {
  try {
    const venda = await VendaComercial.findOneAndDelete({
      _id: req.params.id,
      gerenteId: req.user.id
    });
    
    if (!venda) {
      return res.status(404).json({ message: 'Venda comercial não encontrada' });
    }
    
    res.json({ message: 'Venda comercial deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar venda comercial:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

