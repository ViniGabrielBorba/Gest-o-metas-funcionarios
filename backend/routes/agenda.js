const express = require('express');
const Agenda = require('../models/Agenda');
const auth = require('../middleware/auth');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Obter agenda do gerente
router.get('/', async (req, res) => {
  try {
    let agenda = await Agenda.findOne({ gerenteId: req.user.id });
    
    if (!agenda) {
      // Criar agenda vazia se não existir
      agenda = await Agenda.create({
        gerenteId: req.user.id,
        eventos: []
      });
    }

    res.json(agenda);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter eventos por período
router.get('/eventos', async (req, res) => {
  try {
    const { mes, ano, dataInicio, dataFim } = req.query;
    
    let agenda = await Agenda.findOne({ gerenteId: req.user.id });
    
    if (!agenda) {
      return res.json({ eventos: [] });
    }

    let eventos = agenda.eventos;

    // Filtrar por mês/ano
    if (mes && ano) {
      const mesNum = parseInt(mes);
      const anoNum = parseInt(ano);
      eventos = eventos.filter(evento => {
        const dataEvento = new Date(evento.data);
        return dataEvento.getMonth() + 1 === mesNum && dataEvento.getFullYear() === anoNum;
      });
    }

    // Filtrar por intervalo de datas
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      eventos = eventos.filter(evento => {
        const dataEvento = new Date(evento.data);
        return dataEvento >= inicio && dataEvento <= fim;
      });
    }

    // Ordenar por data
    eventos.sort((a, b) => new Date(a.data) - new Date(b.data));

    res.json({ eventos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar novo evento
router.post('/eventos', async (req, res) => {
  try {
    const { data, titulo, descricao, tipo, prioridade, notificacao, cor } = req.body;

    if (!data || !titulo) {
      return res.status(400).json({ message: 'Data e título são obrigatórios' });
    }

    let agenda = await Agenda.findOne({ gerenteId: req.user.id });

    if (!agenda) {
      agenda = await Agenda.create({
        gerenteId: req.user.id,
        eventos: []
      });
    }

    // Normalizar data usando UTC
    const dataEvento = new Date(data);
    const ano = dataEvento.getUTCFullYear();
    const mes = dataEvento.getUTCMonth();
    const dia = dataEvento.getUTCDate();
    const dataNormalizada = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));

    const novoEvento = {
      data: dataNormalizada,
      titulo: titulo.trim(),
      descricao: descricao ? descricao.trim() : '',
      tipo: tipo || 'tarefa',
      prioridade: prioridade || 'media',
      concluido: false,
      notificacao: {
        ativo: notificacao?.ativo !== false,
        diasAntecedencia: notificacao?.diasAntecedencia || 1,
        horario: notificacao?.horario || '09:00',
        notificado: false
      },
      cor: cor || '#169486'
    };

    agenda.eventos.push(novoEvento);
    await agenda.save();

    res.status(201).json(novoEvento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Atualizar evento
router.put('/eventos/:eventoId', async (req, res) => {
  try {
    const { eventoId } = req.params;
    const { data, titulo, descricao, tipo, prioridade, concluido, notificacao, cor } = req.body;

    const agenda = await Agenda.findOne({ gerenteId: req.user.id });

    if (!agenda) {
      return res.status(404).json({ message: 'Agenda não encontrada' });
    }

    const evento = agenda.eventos.id(eventoId);

    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    if (data) {
      const dataEvento = new Date(data);
      const ano = dataEvento.getUTCFullYear();
      const mes = dataEvento.getUTCMonth();
      const dia = dataEvento.getUTCDate();
      evento.data = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
    }

    if (titulo !== undefined) evento.titulo = titulo.trim();
    if (descricao !== undefined) evento.descricao = descricao ? descricao.trim() : '';
    if (tipo !== undefined) evento.tipo = tipo;
    if (prioridade !== undefined) evento.prioridade = prioridade;
    if (concluido !== undefined) evento.concluido = concluido;
    if (cor !== undefined) evento.cor = cor;

    if (notificacao !== undefined) {
      if (notificacao.ativo !== undefined) evento.notificacao.ativo = notificacao.ativo;
      if (notificacao.diasAntecedencia !== undefined) evento.notificacao.diasAntecedencia = notificacao.diasAntecedencia;
      if (notificacao.horario !== undefined) evento.notificacao.horario = notificacao.horario;
      // Resetar notificado quando atualizar configuração
      if (notificacao.ativo !== undefined || notificacao.diasAntecedencia !== undefined) {
        evento.notificacao.notificado = false;
      }
    }

    await agenda.save();

    res.json(evento);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deletar evento
router.delete('/eventos/:eventoId', async (req, res) => {
  try {
    const { eventoId } = req.params;

    const agenda = await Agenda.findOne({ gerenteId: req.user.id });

    if (!agenda) {
      return res.status(404).json({ message: 'Agenda não encontrada' });
    }

    agenda.eventos.id(eventoId).remove();
    await agenda.save();

    res.json({ message: 'Evento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter lembretes pendentes (para notificações)
router.get('/lembretes', async (req, res) => {
  try {
    const agenda = await Agenda.findOne({ gerenteId: req.user.id });

    if (!agenda) {
      return res.json({ lembretes: [] });
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const lembretes = agenda.eventos.filter(evento => {
      if (!evento.notificacao.ativo || evento.concluido || evento.notificacao.notificado) {
        return false;
      }

      const dataEvento = new Date(evento.data);
      dataEvento.setHours(0, 0, 0, 0);

      const diasRestantes = Math.ceil((dataEvento - hoje) / (1000 * 60 * 60 * 24));

      return diasRestantes <= evento.notificacao.diasAntecedencia && diasRestantes >= 0;
    });

    res.json({ lembretes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Marcar lembrete como notificado
router.put('/eventos/:eventoId/notificado', async (req, res) => {
  try {
    const { eventoId } = req.params;

    const agenda = await Agenda.findOne({ gerenteId: req.user.id });

    if (!agenda) {
      return res.status(404).json({ message: 'Agenda não encontrada' });
    }

    const evento = agenda.eventos.id(eventoId);

    if (!evento) {
      return res.status(404).json({ message: 'Evento não encontrado' });
    }

    evento.notificacao.notificado = true;
    await agenda.save();

    res.json({ message: 'Lembrete marcado como notificado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

