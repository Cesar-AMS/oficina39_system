const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConfiguracaoSchema = new Schema({
  empresa: {
    razao_social: {
      type: String,
      required: true,
      trim: true
    },
    nome_fantasia: {
      type: String,
      required: true,
      trim: true
    },
    cnpj: {
      type: String,
      required: true,
      trim: true,
      unique: true  // Evitar duplicação de índice
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
      lowercase: true,
      unique: true  // Evitar duplicação de índice
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
    logo: {
      type: String,
      trim: true
    }
  },
  fiscal: {
    regime_tributario: {
      type: String,
      trim: true
    },
    ambiente_nfe: {
      type: String,
      enum: ['Produção', 'Homologação'],
      default: 'Homologação'
    },
    serie_nfe: {
      type: String,
      trim: true
    },
    proxima_numeracao_nfe: {
      type: Number,
      default: 1
    },
    certificado_digital: {
      type: String,
      trim: true
    },
    senha_certificado: {
      type: String,
      trim: true
    }
  },
  sistema: {
    tema: {
      type: String,
      default: 'light',
      enum: ['light', 'dark']
    },
    itens_por_pagina: {
      type: Number,
      default: 10
    },
    backup_automatico: {
      type: Boolean,
      default: true
    },
    intervalo_backup: {
      type: Number,
      default: 1,
      comment: 'Em dias'
    }
  },
  ultima_atualizacao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware para atualizar o campo ultima_atualizacao
ConfiguracaoSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Método para obter configurações
ConfiguracaoSchema.statics.obterConfiguracoes = async function() {
  const config = await this.findOne();
  if (config) {
    return config;
  }
  
  // Se não existir, cria uma configuração padrão
  return this.create({
    empresa: {
      razao_social: 'Oficina 39 LTDA',
      nome_fantasia: 'Oficina 39',
      cnpj: '00.000.000/0000-00',
      endereco: {
        cidade: 'São Paulo',
        estado: 'SP'
      }
    },
    fiscal: {
      ambiente_nfe: 'Homologação',
      serie_nfe: '1',
      proxima_numeracao_nfe: 1
    },
    sistema: {
      tema: 'light',
      itens_por_pagina: 10,
      backup_automatico: true,
      intervalo_backup: 1
    }
  });
};

// Método para incrementar numeração de NF-e
ConfiguracaoSchema.methods.incrementarNumeracaoNFe = function() {
  this.fiscal.proxima_numeracao_nfe += 1;
  return this.save();
};

module.exports = mongoose.model('Configuracao', ConfiguracaoSchema);
