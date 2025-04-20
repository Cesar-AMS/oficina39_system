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
}, {
  timestamps: true // Vai adicionar os campos createdAt e updatedAt automaticamente
});

// Índice composto para melhorar a performance das consultas de busca
LogSchema.index({ usuario_id: 1, createdAt: -1 }); // Índice para buscas por usuário e data
LogSchema.index({ acao: 1, entidade: 1, entidade_id: 1 }); // Índice composto para ação e entidade
LogSchema.index({ createdAt: 1 }); // Índice para criação (para facilitar buscas por data)


// Método para registrar log
LogSchema.statics.registrar = function(usuarioId, acao, entidade, entidadeId, detalhes, ip) {
  return this.create({
    usuario_id: usuarioId,
    acao,
    entidade,
    entidade_id: entidadeId,
    detalhes,
    ip
  });
};

// Método para buscar logs por período
LogSchema.statics.buscarPorPeriodo = function(dataInicio, dataFim) {
  return this.find({
    createdAt: {
      $gte: dataInicio,
      $lte: dataFim
    }
  })
  .sort({ createdAt: -1 })
  .populate('usuario_id', 'username');
};

// Método para buscar logs por usuário
LogSchema.statics.buscarPorUsuario = function(usuarioId) {
  return this.find({ usuario_id: usuarioId })
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Log', LogSchema);
