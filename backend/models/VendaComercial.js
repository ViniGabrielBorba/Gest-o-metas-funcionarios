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
    trim: true
  }
}, {
  timestamps: true
});

// Índices para busca eficiente
vendaComercialSchema.index({ gerenteId: 1 });
vendaComercialSchema.index({ gerenteId: 1, data: 1 }); // Para buscas por data
vendaComercialSchema.index({ data: -1 }); // Para ordenação por data

module.exports = mongoose.model('VendaComercial', vendaComercialSchema);

