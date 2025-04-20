const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClienteSchema = new Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  cpf_cnpj: {
    type: String,
    required: true,
    unique: true,  // Este índice já cria o índice único
    trim: true
  },
  tipo: {
    type: String,
    enum: ['Pessoa Física', 'Pessoa Jurídica'],
    required: true
  },
  telefone: {
    type: String,
    trim: true
  },
  celular: {
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

// Índices para melhorar a performance das consultas
ClienteSchema.index({ nome: 1 });   // Para buscas por nome
ClienteSchema.index({ email: 1 });  // Para buscas por email

// Middleware para atualizar o campo ultima_atualizacao
ClienteSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Método para buscar clientes por nome ou CPF/CNPJ
ClienteSchema.statics.buscarPorNomeOuDocumento = function(termo) {
  return this.find({
    $or: [
      { nome: { $regex: termo, $options: 'i' } },
      { cpf_cnpj: { $regex: termo, $options: 'i' } }
    ]
  });
};

module.exports = mongoose.model('Cliente', ClienteSchema);
