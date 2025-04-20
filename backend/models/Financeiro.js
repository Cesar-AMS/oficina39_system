const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FinanceiroSchema = new Schema({
  tipo: {
    type: String,
    enum: ['Receita', 'Despesa'],
    required: true
  },
  categoria: {
    type: String,
    required: true,
    trim: true
  },
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  data_vencimento: {
    type: Date,
    required: true
  },
  data_pagamento: {
    type: Date
  },
  forma_pagamento: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pendente', 'Pago', 'Atrasado', 'Cancelado'],
    default: 'Pendente',
    required: true
  },
  documento_referencia: {
    type: String,
    trim: true
  },
  documento_id: {
    type: Schema.Types.ObjectId
  },
  cliente_fornecedor_id: {
    type: Schema.Types.ObjectId
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

// Índices para melhorar a performance das consultas (sem duplicação)
FinanceiroSchema.index({ tipo: 1, categoria: 1, data_vencimento: 1, status: 1, cliente_fornecedor_id: 1 });

// Middleware para atualizar o campo ultima_atualizacao
FinanceiroSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  
  // Atualizar status baseado nas datas
  if (this.status !== 'Pago' && this.status !== 'Cancelado') {
    const hoje = new Date();
    if (this.data_vencimento < hoje) {
      this.status = 'Atrasado';
    } else {
      this.status = 'Pendente';
    }
  }
  
  next();
});

// Método para registrar pagamento
FinanceiroSchema.methods.registrarPagamento = function(dataPagamento, formaPagamento) {
  this.data_pagamento = dataPagamento || new Date();
  this.forma_pagamento = formaPagamento;
  this.status = 'Pago';
  return this.save();
};

// Método para cancelar lançamento
FinanceiroSchema.methods.cancelar = function() {
  this.status = 'Cancelado';
  return this.save();
};

// Método para buscar lançamentos por período
FinanceiroSchema.statics.buscarPorPeriodo = function(dataInicio, dataFim, tipo = null) {
  const query = {
    data_vencimento: {
      $gte: dataInicio,
      $lte: dataFim
    }
  };
  
  if (tipo) {
    query.tipo = tipo;
  }
  
  return this.find(query).sort({ data_vencimento: 1 });
};

module.exports = mongoose.model('Financeiro', FinanceiroSchema);
