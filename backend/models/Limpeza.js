const mongoose = require('mongoose');

const limpezaSchema = new mongoose.Schema({
  gerenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente',
    required: true
  },
  mes: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  ano: {
    type: Number,
    required: true
  },
  escala: [{
    data: {
      type: Date,
      required: true
    },
    funcionario: {
      // Pode ser um ObjectId (funcionário cadastrado) ou um objeto com nome (adicionado manualmente)
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    tarefas: {
      mesa: {
        type: Boolean,
        default: false
      },
      panos: {
        type: Boolean,
        default: false
      },
      microondas: {
        type: Boolean,
        default: false
      },
      geladeira: {
        type: Boolean,
        default: false
      }
    },
    assinatura: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  observacoes: {
    type: String,
    trim: true,
    default: ''
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para busca eficiente
limpezaSchema.index({ gerenteId: 1, mes: 1, ano: 1 });
limpezaSchema.index({ 'escala.data': 1 });

// Garantir que só existe uma escala por mês/ano por gerente
limpezaSchema.index({ gerenteId: 1, mes: 1, ano: 1 }, { unique: true });

module.exports = mongoose.model('Limpeza', limpezaSchema);

