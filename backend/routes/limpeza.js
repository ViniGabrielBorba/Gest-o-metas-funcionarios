const express = require('express');
const mongoose = require('mongoose');
const Limpeza = require('../models/Limpeza');
const Funcionario = require('../models/Funcionario');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Listar escalas do gerente (por mês/ano)
router.get('/', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    
    const query = { gerenteId: req.user.id };
    
    if (mes) {
      query.mes = parseInt(mes);
    }
    if (ano) {
      query.ano = parseInt(ano);
    }

    const limpezas = await Limpeza.find(query)
      .sort({ ano: -1, mes: -1 });

    // Processar funcionários na escala
    const limpezasProcessadas = await Promise.all(limpezas.map(async (limpeza) => {
      const escalaProcessada = await Promise.all(limpeza.escala.map(async (item) => {
        let funcionarioProcessado = null;
        
        // Se for ObjectId, popular
        if (item.funcionario instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(item.funcionario)) {
          const funcionario = await Funcionario.findById(item.funcionario).select('nome sobrenome');
          if (funcionario) {
            funcionarioProcessado = {
              _id: funcionario._id,
              nome: funcionario.nome,
              sobrenome: funcionario.sobrenome,
              tipo: 'cadastrado'
            };
          }
        } else if (typeof item.funcionario === 'object' && item.funcionario.nome) {
          // Se já for objeto (adicionado manualmente)
          funcionarioProcessado = {
            ...item.funcionario,
            tipo: 'manual'
          };
        }

        return {
          _id: item._id,
          data: item.data,
          funcionario: funcionarioProcessado || item.funcionario,
          tarefas: item.tarefas,
          assinatura: item.assinatura
        };
      }));

      const limpezaObj = limpeza.toObject();
      limpezaObj.escala = escalaProcessada;
      return limpezaObj;
    }));

    res.json(limpezasProcessadas);
  } catch (error) {
    logger.error('Erro ao listar escalas', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Obter escala específica por mês/ano
router.get('/mes/:mes/ano/:ano', async (req, res) => {
  try {
    const mes = parseInt(req.params.mes);
    const ano = parseInt(req.params.ano);

    let limpeza = await Limpeza.findOne({
      gerenteId: req.user.id,
      mes: mes,
      ano: ano
    });

    if (!limpeza) {
      return res.status(404).json({ message: 'Escala não encontrada' });
    }

    // Processar funcionários
    const escalaProcessada = await Promise.all(limpeza.escala.map(async (item) => {
      let funcionarioProcessado = null;
      
      if (item.funcionario instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(item.funcionario)) {
        const funcionario = await Funcionario.findById(item.funcionario).select('nome sobrenome');
        if (funcionario) {
          funcionarioProcessado = {
            _id: funcionario._id,
            nome: funcionario.nome,
            sobrenome: funcionario.sobrenome,
            tipo: 'cadastrado'
          };
        }
      } else if (typeof item.funcionario === 'object' && item.funcionario.nome) {
        funcionarioProcessado = {
          ...item.funcionario,
          tipo: 'manual'
        };
      }

      return {
        _id: item._id,
        data: item.data,
        funcionario: funcionarioProcessado || item.funcionario,
        tarefas: item.tarefas,
        assinatura: item.assinatura
      };
    }));

    const limpezaObj = limpeza.toObject();
    limpezaObj.escala = escalaProcessada;
    res.json(limpezaObj);
  } catch (error) {
    logger.error('Erro ao buscar escala', {
      error: error.message,
      mes: req.params.mes,
      ano: req.params.ano,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Criar ou atualizar escala mensal
router.post('/', async (req, res) => {
  try {
    const { mes, ano, escala, observacoes } = req.body;

    if (!mes || !ano) {
      return res.status(400).json({ message: 'Mês e ano são obrigatórios' });
    }

    if (!escala || !Array.isArray(escala) || escala.length === 0) {
      return res.status(400).json({ message: 'É necessário adicionar pelo menos um dia na escala' });
    }

    // Processar e validar escala
    const escalaProcessada = [];
    for (const item of escala) {
      if (!item.data || !item.funcionario) {
        return res.status(400).json({ message: 'Cada item da escala deve ter data e funcionário' });
      }

      let funcionarioProcessado = null;

      // Se for ID de funcionário cadastrado, validar
      if (typeof item.funcionario === 'string' && mongoose.Types.ObjectId.isValid(item.funcionario)) {
        const funcionario = await Funcionario.findOne({
          _id: item.funcionario,
          gerenteId: req.user.id
        });
        if (!funcionario) {
          return res.status(400).json({ message: `Funcionário ${item.funcionario} não encontrado` });
        }
        funcionarioProcessado = item.funcionario;
      } else if (typeof item.funcionario === 'object' && item.funcionario.nome) {
        // Funcionário manual
        if (!item.funcionario.nome.trim()) {
          return res.status(400).json({ message: 'Nome do funcionário não pode estar vazio' });
        }
        funcionarioProcessado = { nome: item.funcionario.nome.trim() };
      } else {
        return res.status(400).json({ message: 'Funcionário inválido' });
      }

      // Normalizar data usando UTC para evitar problemas de timezone
      let dataNormalizada;
      if (typeof item.data === 'string' && item.data.includes('-')) {
        const partes = item.data.split('-');
        if (partes.length === 3) {
          const ano = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10);
          const dia = parseInt(partes[2], 10);
          // Usar UTC para criar a data - garante que dia/mês/ano sejam preservados
          dataNormalizada = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0));
        } else {
          const dataTemp = new Date(item.data);
          const ano = dataTemp.getUTCFullYear();
          const mes = dataTemp.getUTCMonth();
          const dia = dataTemp.getUTCDate();
          dataNormalizada = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
        }
      } else {
        const dataTemp = new Date(item.data);
        const ano = dataTemp.getUTCFullYear();
        const mes = dataTemp.getUTCMonth();
        const dia = dataTemp.getUTCDate();
        dataNormalizada = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
      }

      escalaProcessada.push({
        data: dataNormalizada,
        funcionario: funcionarioProcessado,
        tarefas: {
          mesa: item.tarefas?.mesa || false,
          panos: item.tarefas?.panos || false,
          microondas: item.tarefas?.microondas || false,
          geladeira: item.tarefas?.geladeira || false
        },
        assinatura: item.assinatura || ''
      });
    }

    // Buscar ou criar escala
    let limpeza = await Limpeza.findOne({
      gerenteId: req.user.id,
      mes: parseInt(mes),
      ano: parseInt(ano)
    });

    if (limpeza) {
      // Atualizar escala existente
      limpeza.escala = escalaProcessada;
      limpeza.observacoes = observacoes || '';
    } else {
      // Criar nova escala
      limpeza = await Limpeza.create({
        gerenteId: req.user.id,
        mes: parseInt(mes),
        ano: parseInt(ano),
        escala: escalaProcessada,
        observacoes: observacoes || ''
      });
    }

    await limpeza.save();

    // Processar para retornar
    const escalaRetorno = await Promise.all(limpeza.escala.map(async (item) => {
      let funcionarioProcessado = null;
      
      if (item.funcionario instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(item.funcionario)) {
        const funcionario = await Funcionario.findById(item.funcionario).select('nome sobrenome');
        if (funcionario) {
          funcionarioProcessado = {
            _id: funcionario._id,
            nome: funcionario.nome,
            sobrenome: funcionario.sobrenome,
            tipo: 'cadastrado'
          };
        }
      } else if (typeof item.funcionario === 'object' && item.funcionario.nome) {
        funcionarioProcessado = {
          ...item.funcionario,
          tipo: 'manual'
        };
      }

      return {
        _id: item._id,
        data: item.data,
        funcionario: funcionarioProcessado || item.funcionario,
        tarefas: item.tarefas,
        assinatura: item.assinatura
      };
    }));

    const limpezaObj = limpeza.toObject();
    limpezaObj.escala = escalaRetorno;

    logger.audit('Escala de limpeza criada/atualizada', req.user.id, {
      limpezaId: limpeza._id,
      mes: limpeza.mes,
      ano: limpeza.ano,
      dias: escalaProcessada.length
    });

    res.status(201).json(limpezaObj);
  } catch (error) {
    logger.error('Erro ao criar/atualizar escala', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Atualizar tarefas de um dia específico
router.put('/:id/dia/:diaId', async (req, res) => {
  try {
    const { tarefas, assinatura } = req.body;

    const limpeza = await Limpeza.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!limpeza) {
      return res.status(404).json({ message: 'Escala não encontrada' });
    }

    const diaIndex = limpeza.escala.findIndex(
      item => item._id.toString() === req.params.diaId
    );

    if (diaIndex === -1) {
      return res.status(404).json({ message: 'Dia não encontrado na escala' });
    }

    if (tarefas !== undefined) {
      limpeza.escala[diaIndex].tarefas = {
        mesa: tarefas.mesa || false,
        panos: tarefas.panos || false,
        microondas: tarefas.microondas || false,
        geladeira: tarefas.geladeira || false
      };
    }

    if (assinatura !== undefined) {
      limpeza.escala[diaIndex].assinatura = assinatura || '';
    }

    await limpeza.save();

    // Processar para retornar
    const item = limpeza.escala[diaIndex];
    let funcionarioProcessado = null;
    
    if (item.funcionario instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(item.funcionario)) {
      const funcionario = await Funcionario.findById(item.funcionario).select('nome sobrenome');
      if (funcionario) {
        funcionarioProcessado = {
          _id: funcionario._id,
          nome: funcionario.nome,
          sobrenome: funcionario.sobrenome,
          tipo: 'cadastrado'
        };
      }
    } else if (typeof item.funcionario === 'object' && item.funcionario.nome) {
      funcionarioProcessado = {
        ...item.funcionario,
        tipo: 'manual'
      };
    }

    const diaRetorno = {
      _id: item._id,
      data: item.data,
      funcionario: funcionarioProcessado || item.funcionario,
      tarefas: item.tarefas,
      assinatura: item.assinatura
    };

    logger.audit('Tarefas de limpeza atualizadas', req.user.id, {
      limpezaId: limpeza._id,
      diaId: req.params.diaId
    });

    res.json(diaRetorno);
  } catch (error) {
    logger.error('Erro ao atualizar tarefas', {
      error: error.message,
      limpezaId: req.params.id,
      diaId: req.params.diaId,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

// Excluir escala
router.delete('/:id', async (req, res) => {
  try {
    const limpeza = await Limpeza.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!limpeza) {
      return res.status(404).json({ message: 'Escala não encontrada' });
    }

    await limpeza.deleteOne();

    logger.audit('Escala de limpeza excluída', req.user.id, {
      limpezaId: req.params.id,
      mes: limpeza.mes,
      ano: limpeza.ano
    });

    res.json({ message: 'Escala excluída com sucesso' });
  } catch (error) {
    logger.error('Erro ao excluir escala', {
      error: error.message,
      limpezaId: req.params.id,
      userId: req.user.id
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
