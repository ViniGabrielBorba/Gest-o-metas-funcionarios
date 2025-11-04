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

// Índice único para uma meta por loja/mês/ano
metaSchema.index({ gerenteId: 1, mes: 1, ano: 1 }, { unique: true });

module.exports = mongoose.model('Meta', metaSchema);

