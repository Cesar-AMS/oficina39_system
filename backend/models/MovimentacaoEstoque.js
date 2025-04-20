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
    default: Date.now, // Pode ser deixado como está, mas também pode ser obrigatório, dependendo do caso.
    required: true
  },
  observacoes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Vai adicionar createdAt e updatedAt automaticamente
});

// Índices para melhorar a performance das consultas
MovimentacaoEstoqueSchema.index({ produto_id: 1, tipo: 1 }); // Índice composto para produto e tipo
MovimentacaoEstoqueSchema.index({ data_movimentacao: 1 }); // Índice para data de movimentação
MovimentacaoEstoqueSchema.index({ responsavel_id: 1 }); // Índice para responsável

// Método para buscar movimentações por produto
MovimentacaoEstoqueSchema.statics.buscarPorProduto = function(produtoId) {
  return this.find({ produto_id: produtoId })
    .sort({ data_movimentacao: -1 })
    .populate('produto_id', 'nome codigo') // Populando com 'nome' e 'codigo' de Produto
    .populate('responsavel_id', 'nome');  // Populando com 'nome' de Funcionario
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
  .populate('produto_id', 'nome codigo') // Populando com 'nome' e 'codigo' de Produto
  .populate('responsavel_id', 'nome');  // Populando com 'nome' de Funcionario
};

module.exports = mongoose.model('MovimentacaoEstoque', MovimentacaoEstoqueSchema);
