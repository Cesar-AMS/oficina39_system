const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AgendamentoSchema = new Schema({
  cliente_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  veiculo_id: {
    type: Schema.Types.ObjectId,
    ref: 'Veiculo',
    required: true
  },
  data_hora: {
    type: Date,
    required: true
  },
  servico_id: {
    type: Schema.Types.ObjectId,
    ref: 'Servico',
    required: true
  },
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Agendado', 'Confirmado', 'Cancelado', 'Concluído'],
    default: 'Agendado',
    required: true
  },
  responsavel_id: {
    type: Schema.Types.ObjectId,
    ref: 'Funcionario'
  },
  observacoes: {
    type: String,
    trim: true
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  },
  ultima_atualizacao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Definindo índices de forma correta e sem duplicação
AgendamentoSchema.index({ cliente_id: 1 });
AgendamentoSchema.index({ veiculo_id: 1 });
AgendamentoSchema.index({ data_hora: 1 });
AgendamentoSchema.index({ status: 1 });
AgendamentoSchema.index({ responsavel_id: 1 });

// Middleware para atualizar o campo ultima_atualizacao
AgendamentoSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Métodos de status
AgendamentoSchema.methods.confirmar = function() {
  this.status = 'Confirmado';
  return this.save();
};

AgendamentoSchema.methods.cancelar = function() {
  this.status = 'Cancelado';
  return this.save();
};

AgendamentoSchema.methods.concluir = function() {
  this.status = 'Concluído';
  return this.save();
};

// Método para buscar agendamentos por data
AgendamentoSchema.statics.buscarPorData = function(data) {
  const dataInicio = new Date(data);
  dataInicio.setHours(0, 0, 0, 0);
  
  const dataFim = new Date(data);
  dataFim.setHours(23, 59, 59, 999);
  
  return this.find({
    data_hora: {
      $gte: dataInicio,
      $lte: dataFim
    }
  })
  .sort({ data_hora: 1 })
  .populate('cliente_id', 'nome telefone celular')
  .populate('veiculo_id', 'placa marca modelo')
  .populate('servico_id', 'nome tempo_estimado')
  .populate('responsavel_id', 'nome');
};

module.exports = mongoose.model('Agendamento', AgendamentoSchema);
