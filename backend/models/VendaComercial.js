const mongoose = require('mongoose');

const vendaComercialSchema = new mongoose.Schema({
  gerenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente',
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  observacao: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Índices para busca eficiente
vendaComercialSchema.index({ gerenteId: 1, data: 1 });
vendaComercialSchema.index({ gerenteId: 1, createdAt: -1 });
vendaComercialSchema.index({ data: 1 });

module.exports = mongoose.model('VendaComercial', vendaComercialSchema);
