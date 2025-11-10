const express = require('express');
const Funcionario = require('../models/Funcionario');
const Meta = require('../models/Meta');
const auth = require('../middleware/auth');
const { getPaginationOptions, createPaginationResponse } = require('../utils/pagination');
const { validate, funcionarioSchema } = require('../utils/validators');
const logger = require('../utils/logger');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Listar todos os funcionários da loja do gerente (com paginação)
router.get('/', async (req, res) => {
  try {
    const pagination = getPaginationOptions(req.query, { defaultPageSize: 20, maxPageSize: 100 });
    const { search, funcao } = req.query;

    // Construir query
    const query = { gerenteId: req.user.id };
    
    if (search) {
      // Buscar em nome e sobrenome
      query.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { sobrenome: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (funcao) {
      query.funcao = funcao;
    }

    // Buscar funcionários com paginação
    const [funcionarios, total] = await Promise.all([
      Funcionario.find(query)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .sort({ nome: 1, sobrenome: 1 }),
      Funcionario.countDocuments(query)
    ]);

    const response = createPaginationResponse(funcionarios, total, pagination);
    res.json(response);
  } catch (error) {
    logger.error('Erro ao listar funcionários', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Obter funcionário por ID
router.get('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar novo funcionário
router.post('/', validate(funcionarioSchema), async (req, res) => {
  try {
    const { nome, sobrenome, sexo, idade, funcao, dataAniversario, metaIndividual } = req.body;

    const funcionario = await Funcionario.create({
      gerenteId: req.user.id,
      nome,
      sobrenome: sobrenome || '',
      sexo,
      idade,
      funcao,
      dataAniversario: new Date(dataAniversario),
      metaIndividual,
      vendas: []
    });

    logger.audit('Funcionário criado', req.user.id, {
      funcionarioId: funcionario._id,
      nome: funcionario.nome
    });

    res.status(201).json(funcionario);
  } catch (error) {
    logger.error('Erro ao criar funcionário', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Atualizar funcionário
router.put('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findOneAndUpdate(
      { _id: req.params.id, gerenteId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Adicionar/atualizar venda mensal de um funcionário (mantido para compatibilidade)
router.post('/:id/vendas', async (req, res) => {
  try {
    const { mes, ano, valor } = req.body;

    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Verificar se já existe venda para esse mês/ano
    const vendaIndex = funcionario.vendas.findIndex(
      v => v.mes === mes && v.ano === ano
    );

    if (vendaIndex >= 0) {
      funcionario.vendas[vendaIndex].valor = valor;
    } else {
      funcionario.vendas.push({ mes, ano, valor });
    }

    await funcionario.save();
    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Salvar/atualizar observação do gerente sobre funcionário
router.put('/:id/observacoes-gerente', async (req, res) => {
  try {
    const { mes, ano, observacao } = req.body;

    if (!mes || !ano) {
      return res.status(400).json({ message: 'Mês e ano são obrigatórios' });
    }

    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Inicializar observacoesGerente se não existir
    if (!funcionario.observacoesGerente) {
      funcionario.observacoesGerente = [];
    }

    // Procurar se já existe observação para este mês/ano
    const observacaoIndex = funcionario.observacoesGerente.findIndex(
      obs => obs.mes === parseInt(mes) && obs.ano === parseInt(ano)
    );

    if (observacaoIndex >= 0) {
      // Atualizar observação existente
      funcionario.observacoesGerente[observacaoIndex].observacao = observacao || '';
      funcionario.observacoesGerente[observacaoIndex].dataAtualizacao = new Date();
    } else {
      // Adicionar nova observação
      funcionario.observacoesGerente.push({
        mes: parseInt(mes),
        ano: parseInt(ano),
        observacao: observacao || '',
        dataAtualizacao: new Date()
      });
    }

    await funcionario.save();
    res.json(funcionario);
  } catch (error) {
    console.error('Erro ao salvar observação do gerente:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obter observação do gerente para um mês/ano específico
router.get('/:id/observacoes-gerente', async (req, res) => {
  try {
    const { mes, ano } = req.query;

    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    if (mes && ano) {
      // Retornar observação específica do mês/ano
      const observacao = funcionario.observacoesGerente?.find(
        obs => obs.mes === parseInt(mes) && obs.ano === parseInt(ano)
      );
      res.json(observacao || { observacao: '' });
    } else {
      // Retornar todas as observações
      res.json(funcionario.observacoesGerente || []);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deletar funcionário
router.delete('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findOneAndDelete({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json({ message: 'Funcionário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

