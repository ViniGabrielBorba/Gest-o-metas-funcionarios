const express = require('express');
const Limpeza = require('../models/Limpeza');
const Funcionario = require('../models/Funcionario');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Listar todas as limpezas do gerente
router.get('/', async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    // Construir query
    const query = { gerenteId: req.user.id };
    
    // Filtro por data
    if (dataInicio || dataFim) {
      query.data = {};
      if (dataInicio) {
        query.data.$gte = new Date(dataInicio);
      }
      if (dataFim) {
        // Adicionar 23:59:59 ao final do dia
        const fim = new Date(dataFim);
        fim.setHours(23, 59, 59, 999);
        query.data.$lte = fim;
      }
    }

    const limpezas = await Limpeza.find(query)
      .populate('funcionarios', 'nome sobrenome')
      .sort({ data: -1, criadoEm: -1 });

    res.json(limpezas);
  } catch (error) {
    logger.error('Erro ao listar limpezas', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Obter uma limpeza específica
router.get('/:id', async (req, res) => {
  try {
    const limpeza = await Limpeza.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    }).populate('funcionarios', 'nome sobrenome');

    if (!limpeza) {
      return res.status(404).json({ message: 'Limpeza não encontrada' });
    }

    res.json(limpeza);
  } catch (error) {
    logger.error('Erro ao buscar limpeza', {
      error: error.message,
      limpezaId: req.params.id,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Criar nova limpeza
router.post('/', async (req, res) => {
  try {
    const { data, funcionarios, observacoes } = req.body;

    // Validações
    if (!data) {
      return res.status(400).json({ message: 'Data é obrigatória' });
    }

    if (!funcionarios || !Array.isArray(funcionarios) || funcionarios.length === 0) {
      return res.status(400).json({ message: 'É necessário selecionar pelo menos um funcionário' });
    }

    // Verificar se os funcionários pertencem ao gerente
    const funcionariosValidos = await Funcionario.find({
      _id: { $in: funcionarios },
      gerenteId: req.user.id
    });

    if (funcionariosValidos.length !== funcionarios.length) {
      return res.status(400).json({ message: 'Um ou mais funcionários não foram encontrados' });
    }

    const limpeza = await Limpeza.create({
      gerenteId: req.user.id,
      data: new Date(data),
      funcionarios: funcionarios,
      observacoes: observacoes || ''
    });

    // Popular funcionários para retornar
    await limpeza.populate('funcionarios', 'nome sobrenome');

    logger.audit('Limpeza criada', req.user.id, {
      limpezaId: limpeza._id,
      data: limpeza.data,
      funcionarios: funcionarios.length
    });

    res.status(201).json(limpeza);
  } catch (error) {
    logger.error('Erro ao criar limpeza', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Atualizar limpeza
router.put('/:id', async (req, res) => {
  try {
    const { data, funcionarios, observacoes } = req.body;

    const limpeza = await Limpeza.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!limpeza) {
      return res.status(404).json({ message: 'Limpeza não encontrada' });
    }

    // Validações
    if (data) {
      limpeza.data = new Date(data);
    }

    if (funcionarios !== undefined) {
      if (!Array.isArray(funcionarios) || funcionarios.length === 0) {
        return res.status(400).json({ message: 'É necessário selecionar pelo menos um funcionário' });
      }

      // Verificar se os funcionários pertencem ao gerente
      const funcionariosValidos = await Funcionario.find({
        _id: { $in: funcionarios },
        gerenteId: req.user.id
      });

      if (funcionariosValidos.length !== funcionarios.length) {
        return res.status(400).json({ message: 'Um ou mais funcionários não foram encontrados' });
      }

      limpeza.funcionarios = funcionarios;
    }

    if (observacoes !== undefined) {
      limpeza.observacoes = observacoes || '';
    }

    await limpeza.save();
    await limpeza.populate('funcionarios', 'nome sobrenome');

    logger.audit('Limpeza atualizada', req.user.id, {
      limpezaId: limpeza._id,
      data: limpeza.data
    });

    res.json(limpeza);
  } catch (error) {
    logger.error('Erro ao atualizar limpeza', {
      error: error.message,
      limpezaId: req.params.id,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Excluir limpeza
router.delete('/:id', async (req, res) => {
  try {
    const limpeza = await Limpeza.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!limpeza) {
      return res.status(404).json({ message: 'Limpeza não encontrada' });
    }

    await limpeza.deleteOne();

    logger.audit('Limpeza excluída', req.user.id, {
      limpezaId: req.params.id,
      data: limpeza.data
    });

    res.json({ message: 'Limpeza excluída com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir limpeza', {
      error: error.message,
      limpezaId: req.params.id,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

