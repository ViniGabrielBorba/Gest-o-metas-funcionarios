const mongoose = require('mongoose');

const metaSchema = new mongoose.Schema({
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
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  vendasDiarias: [{
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
  }],
  totalVendido: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Índices para busca eficiente
metaSchema.index({ gerenteId: 1, mes: 1, ano: 1 }, { unique: true });
metaSchema.index({ gerenteId: 1, ano: 1 }); // Para listar metas por ano
metaSchema.index({ 'vendasDiarias.data': 1 }); // Para buscas por data de venda
metaSchema.index({ createdAt: -1 }); // Para ordenação por data de criação

module.exports = mongoose.model('Meta', metaSchema);

