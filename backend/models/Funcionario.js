const mongoose = require('mongoose');

const funcionarioSchema = new mongoose.Schema({
  gerenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente',
    required: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  sexo: {
    type: String,
    enum: ['Masculino', 'Feminino', 'Outro'],
    required: true
  },
  idade: {
    type: Number,
    required: true,
    min: 16,
    max: 100
  },
  funcao: {
    type: String,
    required: true,
    trim: true
  },
  dataAniversario: {
    type: Date,
    required: true
  },
  metaIndividual: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  vendas: [{
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
      default: 0,
      min: 0
    }
  }],
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
  }]
}, {
  timestamps: true
});

// Índice para busca eficiente
funcionarioSchema.index({ gerenteId: 1 });

module.exports = mongoose.model('Funcionario', funcionarioSchema);

