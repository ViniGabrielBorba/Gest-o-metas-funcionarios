const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const donoSchema = new mongoose.Schema({
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
  tipo: {
    type: String,
    enum: ['dono', 'admin'],
    default: 'dono'
  },
  lojasVinculadas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente'
  }]
}, {
  timestamps: true
});

// Hash da senha antes de salvar
donoSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

// Método para comparar senha
donoSchema.methods.comparePassword = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('Dono', donoSchema);

