const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MovimentacaoEstoqueSchema = new Schema({
  produto_id: {
    type: Schema.Types.ObjectId,
    ref: 'Produto',
    required: true
  },
  tipo: {
    type: String,
    enum: ['Entrada', 'Saída', 'Ajuste'],
    required: true
  },
  quantidade: {
    type: Number,
    required: true
  },
  motivo: {
    type: String,
    required: true,
    trim: true
  },
  documento_referencia: {
    type: String,
    trim: true
  },
  documento_id: {
    type: Schema.Types.ObjectId
  },
  responsavel_id: {
    type: Schema.Types.ObjectId,
    ref: 'Funcionario',
    required: true
  },
  data_movimentacao: {
    type: Date,
    default: Date.now,
    required: true
  },
  observacoes: {
    type: String,
    trim: true
  },
  data_cadastro: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
MovimentacaoEstoqueSchema.index({ produto_id: 1 });
MovimentacaoEstoqueSchema.index({ tipo: 1 });
MovimentacaoEstoqueSchema.index({ data_movimentacao: 1 });
MovimentacaoEstoqueSchema.index({ responsavel_id: 1 });

// Método para buscar movimentações por produto
MovimentacaoEstoqueSchema.statics.buscarPorProduto = function(produtoId) {
  return this.find({ produto_id: produtoId })
    .sort({ data_movimentacao: -1 })
    .populate('produto_id', 'nome codigo')
    .populate('responsavel_id', 'nome');
};

// Método para buscar movimentações por período
MovimentacaoEstoqueSchema.statics.buscarPorPeriodo = function(dataInicio, dataFim) {
  return this.find({
    data_movimentacao: {
      $gte: dataInicio,
      $lte: dataFim
    }
  })
  .sort({ data_movimentacao: -1 })
  .populate('produto_id', 'nome codigo')
  .populate('responsavel_id', 'nome');
};

module.exports = mongoose.model('MovimentacaoEstoque', MovimentacaoEstoqueSchema);
