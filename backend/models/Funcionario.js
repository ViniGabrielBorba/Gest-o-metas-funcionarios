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
  sobrenome: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  sexo: {
    type: String,
    enum: ['Masculino', 'Feminino', 'Outro'],
    required: true
  },
  idade: {
    type: Number,
    required: false,
    min: 16,
    max: 100,
    default: 25
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
  dataNascimento: {
    type: Date,
    required: false
  },
  cpf: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  telefone: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: ''
  },
  chavePix: {
    type: String,
    required: false,
    trim: true,
    default: ''
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
  }],
  observacoesGerente: [{
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
    observacao: {
      type: String,
      trim: true
    },
    dataAtualizacao: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices para busca eficiente
funcionarioSchema.index({ gerenteId: 1 });
funcionarioSchema.index({ gerenteId: 1, nome: 1 }); // Para buscas por nome
funcionarioSchema.index({ gerenteId: 1, sobrenome: 1 }); // Para buscas por sobrenome
// Índice composto para busca por nome completo
funcionarioSchema.index({ gerenteId: 1, nome: 1, sobrenome: 1 });
funcionarioSchema.index({ gerenteId: 1, funcao: 1 }); // Para filtros por função
funcionarioSchema.index({ 'vendasDiarias.data': 1 }); // Para buscas por data de venda
funcionarioSchema.index({ dataAniversario: 1 }); // Para aniversariantes

module.exports = mongoose.model('Funcionario', funcionarioSchema);

