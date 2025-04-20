const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FuncionarioSchema = new Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  rg: {
    type: String,
    trim: true
  },
  data_nascimento: {
    type: Date,
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
  cargo: {
    type: String,
    required: true,
    trim: true
  },
  departamento: {
    type: String,
    required: true,
    trim: true
  },
  data_admissao: {
    type: Date,
    required: true
  },
  data_demissao: {
    type: Date
  },
  salario: {
    type: Number,
    min: 0
  },
  comissao: {
    type: Number,
    min: 0,
    default: 0
  },
  usuario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario'
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
FuncionarioSchema.index({ nome: 1 });
FuncionarioSchema.index({ cpf: 1 }, { unique: true });
FuncionarioSchema.index({ cargo: 1 });
FuncionarioSchema.index({ departamento: 1 });

// Middleware para atualizar o campo ultima_atualizacao
FuncionarioSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Método para buscar funcionários por nome ou CPF
FuncionarioSchema.statics.buscarPorNomeOuCPF = function(termo) {
  return this.find({
    $or: [
      { nome: { $regex: termo, $options: 'i' } },
      { cpf: { $regex: termo, $options: 'i' } }
    ]
  });
};

// Método para calcular tempo de serviço em anos
FuncionarioSchema.methods.tempoServico = function() {
  const dataFim = this.data_demissao || new Date();
  const diffTime = Math.abs(dataFim - this.data_admissao);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(diffYears);
};

module.exports = mongoose.model('Funcionario', FuncionarioSchema);
