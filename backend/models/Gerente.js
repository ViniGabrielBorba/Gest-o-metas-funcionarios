const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const gerenteSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true,
    minlength: 6
  },
  nomeLoja: {
    type: String,
    required: true,
    trim: true
  },
  cnpj: {
    type: String,
    trim: true
  },
  telefone: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Hash da senha antes de salvar
gerenteSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

// Método para comparar senha
gerenteSchema.methods.comparePassword = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('Gerente', gerenteSchema);







