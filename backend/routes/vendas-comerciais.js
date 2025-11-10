const express = require('express');
const router = express.Router();
const VendaComercial = require('../models/VendaComercial');
const auth = require('../middleware/auth');
const { vendaDiariaSchema, validate } = require('../utils/validators');
const { getPaginationOptions, createPaginationResponse } = require('../utils/pagination');
const logger = require('../utils/logger');

router.use(auth);

// Listar todas as vendas comerciais (com paginação)
router.get('/', async (req, res) => {
  try {
    const pagination = getPaginationOptions(req.query, { defaultPageSize: 50, maxPageSize: 200 });
    const { mes, ano, dataInicio, dataFim } = req.query;

    // Construir query
    const query = { gerenteId: req.user.id };
    
    // Filtro por mês e ano
    if (mes && ano) {
      const inicioMes = new Date(Date.UTC(parseInt(ano), parseInt(mes) - 1, 1, 0, 0, 0));
      const fimMes = new Date(Date.UTC(parseInt(ano), parseInt(mes), 0, 23, 59, 59));
      query.data = { $gte: inicioMes, $lte: fimMes };
    } else if (dataInicio && dataFim) {
      // Filtro por intervalo de datas
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      query.data = { $gte: inicio, $lte: fim };
    }

    // Buscar vendas comerciais com paginação
    const [vendas, total] = await Promise.all([
      VendaComercial.find(query)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ data: -1 }),
      VendaComercial.countDocuments(query)
    ]);

    const response = createPaginationResponse(vendas, total, pagination);
    res.json(response);
  } catch (error) {
    logger.error('Erro ao listar vendas comerciais', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Obter venda comercial por ID
router.get('/:id', async (req, res) => {
  try {
    const venda = await VendaComercial.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!venda) {
      return res.status(404).json({ message: 'Venda comercial não encontrada' });
    }

    res.json(venda);
  } catch (error) {
    logger.error('Erro ao buscar venda comercial', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Criar nova venda comercial
router.post('/', validate(vendaDiariaSchema), async (req, res) => {
  try {
    const { data, valor, observacao } = req.body;

    if (!data || valor === undefined || valor === null) {
      return res.status(400).json({ message: 'Data e valor são obrigatórios' });
    }

    // Normalizar data (remover horas, manter apenas data)
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
    
    // Validar se a data é válida
    if (isNaN(dataVenda.getTime())) {
      return res.status(400).json({ message: 'Data inválida' });
    }

    const venda = await VendaComercial.create({
      gerenteId: req.user.id,
      data: dataVenda,
      valor: parseFloat(valor),
      observacao: observacao || ''
    });

    logger.audit('Venda comercial criada', req.user.id, {
      vendaId: venda._id,
      valor: venda.valor,
      data: venda.data
    });

    res.status(201).json(venda);
  } catch (error) {
    logger.error('Erro ao criar venda comercial', {
      error: error.message,
      userId: req.user.id
    });
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

    // Atualizar campos
    if (data !== undefined) {
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
      
      if (!isNaN(dataVenda.getTime())) {
        venda.data = dataVenda;
      }
    }

    if (valor !== undefined) {
      venda.valor = parseFloat(valor);
    }

    if (observacao !== undefined) {
      venda.observacao = observacao;
    }

    await venda.save();

    logger.audit('Venda comercial atualizada', req.user.id, {
      vendaId: venda._id,
      valor: venda.valor
    });

    res.json(venda);
  } catch (error) {
    logger.error('Erro ao atualizar venda comercial', {
      error: error.message,
      userId: req.user.id
    });
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

    logger.audit('Venda comercial deletada', req.user.id, {
      vendaId: req.params.id
    });

    res.json({ message: 'Venda comercial deletada com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar venda comercial', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Obter vendas comerciais agrupadas por dia
router.get('/agrupadas', async (req, res) => {
  try {
    // Validar autenticação
    if (!req.user || !req.user.id) {
      console.error('Erro: req.user não está definido');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes, 10) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano, 10) : new Date().getFullYear();
    
    console.log(`Buscando vendas comerciais para mês ${mesAtual}/${anoAtual}, gerenteId: ${req.user.id}`);
    
    const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
    const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
    
    console.log(`Período: ${inicioMes.toISOString()} até ${fimMes.toISOString()}`);
    
    // Verificar se o modelo está carregado
    if (!VendaComercial) {
      console.error('Erro: Modelo VendaComercial não está definido');
      return res.status(500).json({ message: 'Modelo VendaComercial não encontrado' });
    }
    
    const vendas = await VendaComercial.find({
      gerenteId: req.user.id,
      data: {
        $gte: inicioMes,
        $lte: fimMes
      }
    }).sort({ data: 1 });
    
    console.log(`Encontradas ${vendas.length} vendas comerciais`);
    
    // Agrupar por dia
    const vendasPorDia = {};
    
    vendas.forEach(venda => {
      try {
        if (!venda || !venda.data) {
          console.warn('Venda inválida encontrada:', venda);
          return;
        }
        
        const vendaDate = new Date(venda.data);
        if (isNaN(vendaDate.getTime())) {
          console.warn('Data inválida na venda:', venda._id);
          return;
        }
        
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
          id: venda._id.toString(),
          valor: parseFloat(venda.valor) || 0,
          observacao: venda.observacao || '',
          createdAt: venda.createdAt
        });
        
        vendasPorDia[dataKey].total += parseFloat(venda.valor) || 0;
        vendasPorDia[dataKey].quantidade += 1;
      } catch (err) {
        console.error('Erro ao processar venda:', err, venda);
      }
    });
    
    // Converter para array e ordenar por data
    const vendasAgrupadas = Object.values(vendasPorDia)
      .map(dia => {
        try {
          return {
            ...dia,
            data: dia.data.toISOString()
          };
        } catch (err) {
          console.error('Erro ao converter data:', err, dia);
          return null;
        }
      })
      .filter(dia => dia !== null)
      .sort((a, b) => new Date(b.data) - new Date(a.data));
    
    // Calcular resumo
    const totalMes = vendas.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
    const totalDias = vendasAgrupadas.length;
    const mediaDiaria = totalDias > 0 ? totalMes / totalDias : 0;
    
    console.log(`Resumo: Total R$ ${totalMes}, ${totalDias} dias, média R$ ${mediaDiaria}`);
    
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
    console.error('Erro completo ao buscar vendas comerciais agrupadas:', error);
    console.error('Stack trace:', error.stack);
    
    try {
      logger.error('Erro ao buscar vendas comerciais agrupadas', {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });
    } catch (logError) {
      console.error('Erro ao logar:', logError);
    }
    
    res.status(500).json({ 
      message: error.message || 'Erro ao buscar vendas comerciais',
      error: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
});

// Obter resumo de vendas comerciais por mês/ano
router.get('/resumo/:mes/:ano', async (req, res) => {
  try {
    const mes = parseInt(req.params.mes);
    const ano = parseInt(req.params.ano);

    const inicioMes = new Date(Date.UTC(ano, mes - 1, 1, 0, 0, 0));
    const fimMes = new Date(Date.UTC(ano, mes, 0, 23, 59, 59));

    const vendas = await VendaComercial.find({
      gerenteId: req.user.id,
      data: { $gte: inicioMes, $lte: fimMes }
    }).sort({ data: 1 });

    const total = vendas.reduce((sum, v) => sum + (v.valor || 0), 0);
    const quantidade = vendas.length;

    res.json({
      mes,
      ano,
      total,
      quantidade,
      vendas
    });
  } catch (error) {
    logger.error('Erro ao obter resumo de vendas comerciais', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

