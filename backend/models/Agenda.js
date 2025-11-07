const mongoose = require('mongoose');

const agendaSchema = new mongoose.Schema({
  gerenteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gerente',
    required: true
  },
  eventos: [{
    data: {
      type: Date,
      required: true
    },
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    descricao: {
      type: String,
      trim: true
    },
    tipo: {
      type: String,
      enum: ['tarefa', 'compromisso', 'lembrete', 'reuniao', 'meta'],
      default: 'tarefa'
    },
    prioridade: {
      type: String,
      enum: ['baixa', 'media', 'alta'],
      default: 'media'
    },
    concluido: {
      type: Boolean,
      default: false
    },
    notificacao: {
      ativo: {
        type: Boolean,
        default: true
      },
      diasAntecedencia: {
        type: Number,
        default: 1,
        min: 0,
        max: 30
      },
      horario: {
        type: String,
        default: '09:00'
      },
      notificado: {
        type: Boolean,
        default: false
      }
    },
    cor: {
      type: String,
      default: '#169486'
    },
    criadoEm: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índice para busca eficiente
agendaSchema.index({ gerenteId: 1 });
agendaSchema.index({ 'eventos.data': 1 });

module.exports = mongoose.model('Agenda', agendaSchema);

