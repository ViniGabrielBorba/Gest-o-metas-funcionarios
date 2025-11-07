const mongoose = require('mongoose');

const mensagemDonoSchema = new mongoose.Schema({
  donoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dono',
    required: true
  },
  gerenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente',
    required: true
  },
  assunto: {
    type: String,
    required: true,
    trim: true
  },
  mensagem: {
    type: String,
    required: true,
    trim: true
  },
  lida: {
    type: Boolean,
    default: false
  },
  dataLeitura: {
    type: Date
  }
}, {
  timestamps: true
});

mensagemDonoSchema.index({ donoId: 1, gerenteId: 1 });
mensagemDonoSchema.index({ gerenteId: 1, lida: 1 });

module.exports = mongoose.model('MensagemDono', mensagemDonoSchema);

