const mongoose = require('mongoose');

const limpezaSchema = new mongoose.Schema({
  gerenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente',
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  funcionarios: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Funcionario',
    required: true
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
limpezaSchema.index({ gerenteId: 1, data: -1 });
limpezaSchema.index({ funcionarios: 1 });

module.exports = mongoose.model('Limpeza', limpezaSchema);

