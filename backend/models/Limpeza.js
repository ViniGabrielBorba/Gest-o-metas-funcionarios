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
    // Pode ser um ObjectId (funcionário cadastrado) ou um objeto com nome (adicionado manualmente)
    type: mongoose.Schema.Types.Mixed,
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

