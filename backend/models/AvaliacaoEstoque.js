const mongoose = require('mongoose');

const avaliacaoEstoqueSchema = new mongoose.Schema({
  gerenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente',
    required: true
  },
  // Seção 1: Definição da Forma de Avaliação
  frequenciaAvaliacao: {
    type: String,
    enum: ['Semanal', 'Mensal'],
    required: true
  },
  formaPagamento: {
    type: String,
    enum: ['Ganho', 'Perda'],
    required: true
  },
  // Seção 2: Responsáveis pela Avaliação
  responsaveis: {
    type: String,
    trim: true
  },
  gerentes: {
    type: Boolean,
    default: false
  },
  outros: {
    type: Boolean,
    default: false
  },
  outrosEspecificacao: {
    type: String,
    trim: true
  },
  // Seção 3: Tópicos Importantes para Avaliação
  topicos: [{
    topico: {
      type: String,
      required: true
    },
    observacoesPontuacao: {
      type: String,
      trim: true
    }
  }],
  // Seção 4: Sugestões de Novos Tópicos
  sugestoesNovosTopicos: [{
    type: String,
    trim: true
  }],
  // Seção 5: Pontuação e Valores
  tipoValor: {
    type: String,
    enum: ['Fixo', 'Variável']
  },
  valorMinimoSugerido: {
    type: Number,
    default: 200.00
  },
  // Assinatura e Data
  assinatura: {
    type: String,
    trim: true
  },
  data: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice para busca eficiente
avaliacaoEstoqueSchema.index({ gerenteId: 1, data: -1 });

module.exports = mongoose.model('AvaliacaoEstoque', avaliacaoEstoqueSchema);

