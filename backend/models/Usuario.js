const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UsuarioSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  senha_hash: {
    type: String,
    required: true
  },
  salt: {
    type: String
  },
  funcionario_id: {
    type: Schema.Types.ObjectId,
    ref: 'Funcionario'
  },
  perfil: {
    type: String,
    enum: ['Administrador', 'Gerente', 'Mecânico', 'Atendente', 'Financeiro'],
    required: true
  },
  permissoes: [{
    type: String
  }],
  ultimo_acesso: {
    type: Date
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
  },
  token_reset_senha: {
    type: String
  },
  expiracao_token_reset: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
UsuarioSchema.index({ username: 1 }, { unique: true });
UsuarioSchema.index({ email: 1 }, { unique: true });
UsuarioSchema.index({ funcionario_id: 1 });

// Middleware para atualizar o campo ultima_atualizacao
UsuarioSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  
  // Gerar hash da senha se foi modificada
  if (this.isModified('senha_hash')) {
    const salt = bcrypt.genSaltSync(10);
    this.salt = salt;
    this.senha_hash = bcrypt.hashSync(this.senha_hash, salt);
  }
  
  next();
});

// Método para verificar senha
UsuarioSchema.methods.verificarSenha = function(senha) {
  return bcrypt.compareSync(senha, this.senha_hash);
};

// Método para gerar token de reset de senha
UsuarioSchema.methods.gerarTokenResetSenha = function() {
  this.token_reset_senha = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
  this.expiracao_token_reset = new Date(Date.now() + 3600000); // 1 hora
  return this.save();
};

// Método para redefinir senha
UsuarioSchema.methods.redefinirSenha = function(novaSenha) {
  this.senha_hash = novaSenha;
  this.token_reset_senha = undefined;
  this.expiracao_token_reset = undefined;
  return this.save();
};

// Método para registrar acesso
UsuarioSchema.methods.registrarAcesso = function() {
  this.ultimo_acesso = Date.now();
  return this.save();
};

module.exports = mongoose.model('Usuario', UsuarioSchema);
