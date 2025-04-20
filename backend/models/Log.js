const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
  usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  acao: {
    type: String,
    required: true,
    trim: true
  },
  entidade: {
    type: String,
    required: true,
    trim: true
  },
  entidade_id: {
    type: Schema.Types.ObjectId
  },
  detalhes: {
    type: Schema.Types.Mixed
  },
  ip: {
    type: String,
    trim: true
  },
  data_hora: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
LogSchema.index({ usuario_id: 1 });
LogSchema.index({ acao: 1 });
LogSchema.index({ entidade: 1 });
LogSchema.index({ entidade_id: 1 });
LogSchema.index({ data_hora: 1 });

// Método para registrar log
LogSchema.statics.registrar = function(usuarioId, acao, entidade, entidadeId, detalhes, ip) {
  return this.create({
    usuario_id: usuarioId,
    acao,
    entidade,
    entidade_id: entidadeId,
    detalhes,
    ip,
    data_hora: new Date()
  });
};

// Método para buscar logs por período
LogSchema.statics.buscarPorPeriodo = function(dataInicio, dataFim) {
  return this.find({
    data_hora: {
      $gte: dataInicio,
      $lte: dataFim
    }
  })
  .sort({ data_hora: -1 })
  .populate('usuario_id', 'username');
};

// Método para buscar logs por usuário
LogSchema.statics.buscarPorUsuario = function(usuarioId) {
  return this.find({ usuario_id: usuarioId })
    .sort({ data_hora: -1 });
};

module.exports = mongoose.model('Log', LogSchema);
