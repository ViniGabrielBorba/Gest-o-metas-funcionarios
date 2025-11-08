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
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email inválido']
  },
  senha: {
    type: String,
    required: true,
    minlength: 8
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
  },
  emailVerificado: {
    type: Boolean,
    default: false
  },
  emailVerificacaoToken: {
    type: String,
    select: false
  },
  emailVerificacaoExpira: {
    type: Date,
    select: false
  },
  resetSenhaToken: {
    type: String,
    select: false
  },
  resetSenhaExpira: {
    type: Date,
    select: false
  },
  ultimoLogin: {
    type: Date
  },
  tentativasLogin: {
    type: Number,
    default: 0
  },
  bloqueadoAte: {
    type: Date
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

// Método para gerar token de reset de senha
gerenteSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.resetSenhaToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetSenhaExpira = Date.now() + 60 * 60 * 1000; // 1 hora
  
  return token;
};

// Método para gerar token de verificação de email
gerenteSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificacaoToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificacaoExpira = Date.now() + 24 * 60 * 60 * 1000; // 24 horas
  
  return token;
};

// Índices para melhor performance
// email já tem unique: true, não precisa de index adicional
gerenteSchema.index({ resetSenhaToken: 1 });
gerenteSchema.index({ emailVerificacaoToken: 1 });

module.exports = mongoose.model('Gerente', gerenteSchema);









