const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ServicoSchema = new Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  nome: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    trim: true
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  tempo_estimado: {
    type: Number,
    required: true,
    min: 0,
    comment: 'Tempo estimado em minutos'
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  },
  ultima_atualizacao: {
    type: Date,
    default: Date.now
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
ServicoSchema.index({ codigo: 1 }, { unique: true });
ServicoSchema.index({ nome: 1 });
ServicoSchema.index({ categoria: 1 });

// Middleware para atualizar o campo ultima_atualizacao
ServicoSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Método para buscar serviços por nome ou código
ServicoSchema.statics.buscarPorNomeOuCodigo = function(termo) {
  return this.find({
    $or: [
      { nome: { $regex: termo, $options: 'i' } },
      { codigo: { $regex: termo, $options: 'i' } }
    ]
  });
};

// Método para calcular tempo estimado em horas
ServicoSchema.methods.tempoEstimadoEmHoras = function() {
  return this.tempo_estimado / 60;
};

module.exports = mongoose.model('Servico', ServicoSchema);
