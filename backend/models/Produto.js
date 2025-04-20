const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProdutoSchema = new Schema({
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
  fornecedor_id: {
    type: Schema.Types.ObjectId,
    ref: 'Fornecedor'
  },
  preco_custo: {
    type: Number,
    required: true,
    min: 0
  },
  preco_venda: {
    type: Number,
    required: true,
    min: 0
  },
  margem_lucro: {
    type: Number,
    min: 0
  },
  unidade_medida: {
    type: String,
    required: true,
    trim: true
  },
  estoque_atual: {
    type: Number,
    default: 0,
    min: 0
  },
  estoque_minimo: {
    type: Number,
    default: 0,
    min: 0
  },
  estoque_maximo: {
    type: Number,
    default: 0,
    min: 0
  },
  localizacao_estoque: {
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
  },
  codigo_barras: {
    type: String,
    trim: true
  },
  ncm: {
    type: String,
    trim: true
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
ProdutoSchema.index({ codigo: 1 }, { unique: true });
ProdutoSchema.index({ nome: 1 });
ProdutoSchema.index({ categoria: 1 });
ProdutoSchema.index({ fornecedor_id: 1 });
ProdutoSchema.index({ codigo_barras: 1 });

// Middleware para atualizar o campo ultima_atualizacao
ProdutoSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  
  // Calcular margem de lucro se não for fornecida
  if (!this.margem_lucro && this.preco_custo > 0 && this.preco_venda > 0) {
    this.margem_lucro = ((this.preco_venda - this.preco_custo) / this.preco_custo) * 100;
  }
  
  next();
});

// Método para buscar produtos por nome ou código
ProdutoSchema.statics.buscarPorNomeOuCodigo = function(termo) {
  return this.find({
    $or: [
      { nome: { $regex: termo, $options: 'i' } },
      { codigo: { $regex: termo, $options: 'i' } },
      { codigo_barras: { $regex: termo, $options: 'i' } }
    ]
  });
};

// Método para atualizar estoque
ProdutoSchema.methods.atualizarEstoque = function(quantidade, tipo) {
  if (tipo === 'entrada') {
    this.estoque_atual += quantidade;
  } else if (tipo === 'saida') {
    if (this.estoque_atual >= quantidade) {
      this.estoque_atual -= quantidade;
    } else {
      throw new Error('Estoque insuficiente');
    }
  }
  return this.save();
};

// Método para verificar se o produto está com estoque baixo
ProdutoSchema.methods.estoqueEstaBaixo = function() {
  return this.estoque_atual <= this.estoque_minimo;
};

module.exports = mongoose.model('Produto', ProdutoSchema);
