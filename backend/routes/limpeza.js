const express = require('express');
const mongoose = require('mongoose');
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
      .sort({ data: -1, criadoEm: -1 });

    // Processar funcionários: popular os que são ObjectIds, manter os que são objetos
    const limpezasProcessadas = await Promise.all(limpezas.map(async (limpeza) => {
      const funcionariosProcessados = await Promise.all(limpeza.funcionarios.map(async (func) => {
        // Se for ObjectId, popular
        if (func instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(func)) {
          const funcionario = await Funcionario.findById(func).select('nome sobrenome');
          if (funcionario) {
            return {
              _id: funcionario._id,
              nome: funcionario.nome,
              sobrenome: funcionario.sobrenome,
              tipo: 'cadastrado'
            };
          }
        }
        // Se já for objeto (adicionado manualmente), retornar como está
        if (typeof func === 'object' && func.nome) {
          return {
            ...func,
            tipo: 'manual'
          };
        }
        return func;
      }));
      
      const limpezaObj = limpeza.toObject();
      limpezaObj.funcionarios = funcionariosProcessados;
      return limpezaObj;
    }));

    res.json(limpezasProcessadas);
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
    });

    if (!limpeza) {
      return res.status(404).json({ message: 'Limpeza não encontrada' });
    }

    // Processar funcionários
    const funcionariosProcessados = await Promise.all(limpeza.funcionarios.map(async (func) => {
      if (func instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(func)) {
        const funcionario = await Funcionario.findById(func).select('nome sobrenome');
        if (funcionario) {
          return {
            _id: funcionario._id,
            nome: funcionario.nome,
            sobrenome: funcionario.sobrenome,
            tipo: 'cadastrado'
          };
        }
      }
      if (typeof func === 'object' && func.nome) {
        return {
          ...func,
          tipo: 'manual'
        };
      }
      return func;
    }));

    const limpezaObj = limpeza.toObject();
    limpezaObj.funcionarios = funcionariosProcessados;
    res.json(limpezaObj);
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
      return res.status(400).json({ message: 'É necessário adicionar pelo menos um funcionário' });
    }

    // Processar funcionários: separar IDs de objetos
    const funcionariosIds = funcionarios.filter(f => typeof f === 'string' || mongoose.Types.ObjectId.isValid(f));
    const funcionariosManuais = funcionarios.filter(f => typeof f === 'object' && f.nome);

    // Validar funcionários cadastrados
    if (funcionariosIds.length > 0) {
      const funcionariosValidos = await Funcionario.find({
        _id: { $in: funcionariosIds },
        gerenteId: req.user.id
      });

      if (funcionariosValidos.length !== funcionariosIds.length) {
        return res.status(400).json({ message: 'Um ou mais funcionários cadastrados não foram encontrados' });
      }
    }

    // Validar funcionários manuais (devem ter nome)
    for (const func of funcionariosManuais) {
      if (!func.nome || !func.nome.trim()) {
        return res.status(400).json({ message: 'Funcionários adicionados manualmente devem ter um nome' });
      }
    }

    // Combinar funcionários: IDs e objetos
    const funcionariosProcessados = [...funcionariosIds, ...funcionariosManuais];

    const limpeza = await Limpeza.create({
      gerenteId: req.user.id,
      data: new Date(data),
      funcionarios: funcionariosProcessados,
      observacoes: observacoes || ''
    });

    // Processar funcionários para retornar
    const funcionariosRetorno = await Promise.all(limpeza.funcionarios.map(async (func) => {
      if (func instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(func)) {
        const funcionario = await Funcionario.findById(func).select('nome sobrenome');
        if (funcionario) {
          return {
            _id: funcionario._id,
            nome: funcionario.nome,
            sobrenome: funcionario.sobrenome,
            tipo: 'cadastrado'
          };
        }
      }
      if (typeof func === 'object' && func.nome) {
        return {
          ...func,
          tipo: 'manual'
        };
      }
      return func;
    }));

    const limpezaObj = limpeza.toObject();
    limpezaObj.funcionarios = funcionariosRetorno;

    logger.audit('Limpeza criada', req.user.id, {
      limpezaId: limpeza._id,
      data: limpeza.data,
      funcionarios: funcionariosProcessados.length
    });

    res.status(201).json(limpezaObj);
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
        return res.status(400).json({ message: 'É necessário adicionar pelo menos um funcionário' });
      }

      // Processar funcionários: separar IDs de objetos
      const funcionariosIds = funcionarios.filter(f => typeof f === 'string' || mongoose.Types.ObjectId.isValid(f));
      const funcionariosManuais = funcionarios.filter(f => typeof f === 'object' && f.nome);

      // Validar funcionários cadastrados
      if (funcionariosIds.length > 0) {
        const funcionariosValidos = await Funcionario.find({
          _id: { $in: funcionariosIds },
          gerenteId: req.user.id
        });

        if (funcionariosValidos.length !== funcionariosIds.length) {
          return res.status(400).json({ message: 'Um ou mais funcionários cadastrados não foram encontrados' });
        }
      }

      // Validar funcionários manuais
      for (const func of funcionariosManuais) {
        if (!func.nome || !func.nome.trim()) {
          return res.status(400).json({ message: 'Funcionários adicionados manualmente devem ter um nome' });
        }
      }

      // Combinar funcionários
      limpeza.funcionarios = [...funcionariosIds, ...funcionariosManuais];
    }

    if (observacoes !== undefined) {
      limpeza.observacoes = observacoes || '';
    }

    await limpeza.save();

    // Processar funcionários para retornar
    const funcionariosProcessados = await Promise.all(limpeza.funcionarios.map(async (func) => {
      if (func instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(func)) {
        const funcionario = await Funcionario.findById(func).select('nome sobrenome');
        if (funcionario) {
          return {
            _id: funcionario._id,
            nome: funcionario.nome,
            sobrenome: funcionario.sobrenome,
            tipo: 'cadastrado'
          };
        }
      }
      if (typeof func === 'object' && func.nome) {
        return {
          ...func,
          tipo: 'manual'
        };
      }
      return func;
    }));

    const limpezaObj = limpeza.toObject();
    limpezaObj.funcionarios = funcionariosProcessados;

    logger.audit('Limpeza atualizada', req.user.id, {
      limpezaId: limpeza._id,
      data: limpeza.data
    });

    res.json(limpezaObj);
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

