const express = require('express');
const AvaliacaoEstoque = require('../models/AvaliacaoEstoque');
const auth = require('../middleware/auth');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Listar todas as avaliações de estoque do gerente
router.get('/', async (req, res) => {
  try {
    const avaliacoes = await AvaliacaoEstoque.find({ gerenteId: req.user.id })
      .sort({ data: -1 });
    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter avaliação por ID
router.get('/:id', async (req, res) => {
  try {
    const avaliacao = await AvaliacaoEstoque.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!avaliacao) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json(avaliacao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar nova avaliação de estoque
router.post('/', async (req, res) => {
  try {
    const {
      frequenciaAvaliacao,
      formaPagamento,
      responsaveis,
      gerentes,
      outros,
      outrosEspecificacao,
      topicos,
      sugestoesNovosTopicos,
      tipoValor,
      valorMinimoSugerido,
      assinatura,
      data
    } = req.body;

    // Tópicos padrão do formulário
    const topicosPadrao = [
      'Atraso na produção de novos produtos - definir tempo máximo para conclusão.',
      'Avarias - definir prazos para retorno e sinalização adequada (sem alarme).',
      'Abastecimento de loja - garantir reposição impecável, com auxiliar responsável e tempo definido após solicitação.',
      'Organização do estoque - limpeza, descarte e etiquetagem de todos os produtos armazenados.',
      'Falta de produtos do galpão - garantir que produtos disponíveis no galpão não faltem na loja.',
      'Falta de suprimentos - identificar e registrar as causas.',
      'Produtos com preço antigo ou sem precificação - corrigir e manter atualizado.'
    ];

    // Se topicos não foram enviados, criar com os padrões
    let topicosProcessados = topicos;
    if (!topicos || topicos.length === 0) {
      topicosProcessados = topicosPadrao.map(topico => ({
        topico,
        observacoesPontuacao: ''
      }));
    }

    const avaliacao = await AvaliacaoEstoque.create({
      gerenteId: req.user.id,
      frequenciaAvaliacao,
      formaPagamento,
      responsaveis: responsaveis || '',
      gerentes: gerentes || false,
      outros: outros || false,
      outrosEspecificacao: outrosEspecificacao || '',
      topicos: topicosProcessados,
      sugestoesNovosTopicos: sugestoesNovosTopicos || [],
      tipoValor: tipoValor || 'Fixo',
      valorMinimoSugerido: valorMinimoSugerido || 200.00,
      assinatura: assinatura || '',
      data: data ? new Date(data) : new Date()
    });

    res.status(201).json(avaliacao);
  } catch (error) {
    console.error('Erro ao criar avaliação de estoque:', error);
    res.status(500).json({ message: error.message });
  }
});

// Atualizar avaliação de estoque
router.put('/:id', async (req, res) => {
  try {
    const avaliacao = await AvaliacaoEstoque.findOneAndUpdate(
      { _id: req.params.id, gerenteId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!avaliacao) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json(avaliacao);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deletar avaliação de estoque
router.delete('/:id', async (req, res) => {
  try {
    const avaliacao = await AvaliacaoEstoque.findOneAndDelete({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!avaliacao) {
      return res.status(404).json({ message: 'Avaliação não encontrada' });
    }

    res.json({ message: 'Avaliação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

