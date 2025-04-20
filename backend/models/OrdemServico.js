const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrdemServicoSchema = new Schema({
  numero: {
    type: String,
    required: true,
    unique: true, // único já cria o índice
    trim: true
  },
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
  data_entrada: {
    type: Date,
    required: true,
    default: Date.now
  },
  data_previsao: {
    type: Date
  },
  data_conclusao: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Aberta', 'Em andamento', 'Aguardando peças', 'Concluída', 'Entregue', 'Cancelada'],
    default: 'Aberta',
    required: true
  },
  quilometragem: {
    type: Number,
    required: true,
    min: 0
  },
  diagnostico: {
    type: String,
    trim: true
  },
  observacoes_cliente: {
    type: String,
    trim: true
  },
  observacoes_internas: {
    type: String,
    trim: true
  },
  itens_servico: [{
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
    valor: {
      type: Number,
      required: true,
      min: 0
    },
    mecanico_id: {
      type: Schema.Types.ObjectId,
      ref: 'Funcionario'
    },
    tempo_gasto: {
      type: Number,
      min: 0,
      comment: 'Tempo gasto em minutos'
    },
    status: {
      type: String,
      enum: ['Pendente', 'Em andamento', 'Concluído'],
      default: 'Pendente'
    }
  }],
  itens_produto: [{
    produto_id: {
      type: Schema.Types.ObjectId,
      ref: 'Produto',
      required: true
    },
    descricao: {
      type: String,
      required: true,
      trim: true
    },
    quantidade: {
      type: Number,
      required: true,
      min: 0
    },
    valor_unitario: {
      type: Number,
      required: true,
      min: 0
    },
    valor_total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  valor_servicos: {
    type: Number,
    default: 0,
    min: 0
  },
  valor_produtos: {
    type: Number,
    default: 0,
    min: 0
  },
  desconto: {
    type: Number,
    default: 0,
    min: 0
  },
  valor_total: {
    type: Number,
    default: 0,
    min: 0
  },
  forma_pagamento: {
    type: String,
    trim: true
  },
  parcelas: {
    type: Number,
    min: 1,
    default: 1
  },
  nota_fiscal_id: {
    type: Schema.Types.ObjectId,
    ref: 'NotaFiscal'
  },
  responsavel_id: {
    type: Schema.Types.ObjectId,
    ref: 'Funcionario'
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

// Índices para melhorar a performance das consultas
OrdemServicoSchema.index({ cliente_id: 1 });
OrdemServicoSchema.index({ veiculo_id: 1 });
OrdemServicoSchema.index({ status: 1 });
OrdemServicoSchema.index({ data_entrada: 1 });

// Middleware para atualizar o campo ultima_atualizacao
OrdemServicoSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  
  // Calcular valores totais
  this.valor_servicos = this.itens_servico.reduce((total, item) => total + item.valor, 0);
  this.valor_produtos = this.itens_produto.reduce((total, item) => total + item.valor_total, 0);
  this.valor_total = this.valor_servicos + this.valor_produtos - this.desconto;
  
  next();
});

// Método para adicionar serviço à ordem
OrdemServicoSchema.methods.adicionarServico = function(servicoId, descricao, valor, mecanicoId = null) {
  this.itens_servico.push({
    servico_id: servicoId,
    descricao,
    valor,
    mecanico_id: mecanicoId,
    status: 'Pendente'
  });
  return this.save();
};

// Método para adicionar produto à ordem
OrdemServicoSchema.methods.adicionarProduto = function(produtoId, descricao, quantidade, valorUnitario) {
  const valorTotal = quantidade * valorUnitario;
  this.itens_produto.push({
    produto_id: produtoId,
    descricao,
    quantidade,
    valor_unitario: valorUnitario,
    valor_total: valorTotal
  });
  return this.save();
};

// Método para atualizar status da ordem
OrdemServicoSchema.methods.atualizarStatus = function(novoStatus) {
  this.status = novoStatus;
  
  // Se o status for "Concluída", atualizar a data de conclusão
  if (novoStatus === 'Concluída') {
    this.data_conclusao = Date.now();
  }
  
  return this.save();
};

// Método para buscar ordens por número ou cliente
OrdemServicoSchema.statics.buscarPorNumeroOuCliente = function(termo) {
  return this.find({
    $or: [
      { numero: { $regex: termo, $options: 'i' } }
    ]
  }).populate('cliente_id', 'nome cpf_cnpj');
};

module.exports = mongoose.model('OrdemServico', OrdemServicoSchema);
