const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotaFiscalSchema = new Schema({
  numero: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  serie: {
    type: String,
    required: true,
    trim: true
  },
  ordem_servico_id: {
    type: Schema.Types.ObjectId,
    ref: 'OrdemServico',
    required: true
  },
  cliente_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  data_emissao: {
    type: Date,
    required: true,
    default: Date.now
  },
  valor_total: {
    type: Number,
    required: true,
    min: 0
  },
  itens: [{
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
    },
    ncm: {
      type: String,
      trim: true
    },
    cfop: {
      type: String,
      trim: true
    }
  }],
  impostos: {
    base_calculo_icms: {
      type: Number,
      default: 0
    },
    valor_icms: {
      type: Number,
      default: 0
    },
    base_calculo_iss: {
      type: Number,
      default: 0
    },
    valor_iss: {
      type: Number,
      default: 0
    },
    pis: {
      type: Number,
      default: 0
    },
    cofins: {
      type: Number,
      default: 0
    }
  },
  chave_acesso: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Emitida', 'Cancelada'],
    default: 'Emitida'
  },
  xml: {
    type: String,
    trim: true
  },
  pdf: {
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

// Índices para melhorar a performance das consultas
NotaFiscalSchema.index({ numero: 1, serie: 1 }, { unique: true });
NotaFiscalSchema.index({ ordem_servico_id: 1 });
NotaFiscalSchema.index({ cliente_id: 1 });
NotaFiscalSchema.index({ data_emissao: 1 });
NotaFiscalSchema.index({ chave_acesso: 1 });

// Middleware para atualizar o campo ultima_atualizacao
NotaFiscalSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Método para cancelar nota fiscal
NotaFiscalSchema.methods.cancelar = function(motivo) {
  this.status = 'Cancelada';
  return this.save();
};

// Método para gerar chave de acesso (simulação)
NotaFiscalSchema.methods.gerarChaveAcesso = function() {
  // Simulação de geração de chave de acesso
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear().toString().substr(-2);
  const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
  const cnpj = '12345678901234'; // Exemplo
  const modelo = '55';
  const serie = this.serie.padStart(3, '0');
  const numero = this.numero.padStart(9, '0');
  const tipoEmissao = '1';
  const codigoNumerico = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  // Chave sem dígito verificador
  const chave = `${ano}${mes}${cnpj}${modelo}${serie}${numero}${tipoEmissao}${codigoNumerico}`;
  
  // Simulação de dígito verificador
  const dv = '0';
  
  this.chave_acesso = `${chave}${dv}`;
  return this.save();
};

module.exports = mongoose.model('NotaFiscal', NotaFiscalSchema);
