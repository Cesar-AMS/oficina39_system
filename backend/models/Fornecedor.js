const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FornecedorSchema = new Schema({
  razao_social: {
    type: String,
    required: true,
    trim: true
  },
  nome_fantasia: {
    type: String,
    trim: true
  },
  cnpj: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  inscricao_estadual: {
    type: String,
    trim: true
  },
  telefone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  endereco: {
    rua: { type: String, trim: true },
    numero: { type: String, trim: true },
    complemento: { type: String, trim: true },
    bairro: { type: String, trim: true },
    cidade: { type: String, trim: true },
    estado: { type: String, trim: true },
    cep: { type: String, trim: true }
  },
  contato_nome: {
    type: String,
    trim: true
  },
  contato_telefone: {
    type: String,
    trim: true
  },
  contato_email: {
    type: String,
    trim: true,
    lowercase: true
  },
  produtos_fornecidos: [{
    type: Schema.Types.ObjectId,
    ref: 'Produto'
  }],
  data_cadastro: {
    type: Date,
    default: Date.now
  },
  ultima_atualizacao: {
    type: Date,
    default: Date.now
  },
  observacoes: {
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

// Índice combinado para melhorar a performance das consultas
FornecedorSchema.index({ razao_social: 1, nome_fantasia: 1 });

// Middleware para atualizar o campo ultima_atualizacao
FornecedorSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Método para buscar fornecedores por nome ou CNPJ
FornecedorSchema.statics.buscarPorNomeOuCNPJ = function(termo) {
  return this.find({
    $or: [
      { razao_social: { $regex: termo, $options: 'i' } },
      { nome_fantasia: { $regex: termo, $options: 'i' } },
      { cnpj: { $regex: termo, $options: 'i' } }
    ]
  });
};

// Método para adicionar produto fornecido
FornecedorSchema.methods.adicionarProduto = function(produtoId) {
  if (!this.produtos_fornecidos.includes(produtoId)) {
    this.produtos_fornecidos.push(produtoId);
  }
  return this.save();
};

// Método para remover produto fornecido
FornecedorSchema.methods.removerProduto = function(produtoId) {
  this.produtos_fornecidos = this.produtos_fornecidos.filter(
    id => id.toString() !== produtoId.toString()
  );
  return this.save();
};

module.exports = mongoose.model('Fornecedor', FornecedorSchema);
