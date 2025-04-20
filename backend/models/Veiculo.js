const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VeiculoSchema = new Schema({
  cliente_id: {
    type: Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  placa: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  marca: {
    type: String,
    required: true,
    trim: true
  },
  modelo: {
    type: String,
    required: true,
    trim: true
  },
  ano_fabricacao: {
    type: Number,
    required: true
  },
  ano_modelo: {
    type: Number,
    required: true
  },
  cor: {
    type: String,
    trim: true
  },
  chassi: {
    type: String,
    trim: true,
    uppercase: true
  },
  quilometragem: {
    type: Number,
    default: 0
  },
  combustivel: {
    type: String,
    enum: ['Gasolina', 'Etanol', 'Diesel', 'Flex', 'GNV', 'Elétrico', 'Híbrido', 'Outro'],
    required: true
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
  historico_manutencao: [{
    data: {
      type: Date,
      required: true
    },
    quilometragem: {
      type: Number,
      required: true
    },
    descricao: {
      type: String,
      required: true,
      trim: true
    }
  }]
}, {
  timestamps: true
});

// Índices para melhorar a performance das consultas
VeiculoSchema.index({ cliente_id: 1 });
VeiculoSchema.index({ placa: 1 }, { unique: true });
VeiculoSchema.index({ marca: 1, modelo: 1 });  // Índice composto

// Middleware para atualizar o campo ultima_atualizacao
VeiculoSchema.pre('save', function(next) {
  this.ultima_atualizacao = Date.now();
  next();
});

// Método para buscar veículos por placa
VeiculoSchema.statics.buscarPorPlaca = function(placa) {
  return this.findOne({ placa: new RegExp(placa, 'i') });
};

// Método para adicionar registro ao histórico de manutenção
VeiculoSchema.methods.adicionarManutencao = function(data, quilometragem, descricao) {
  this.historico_manutencao.push({
    data,
    quilometragem,
    descricao
  });
  this.quilometragem = quilometragem; // Atualiza a quilometragem atual
  return this.save();
};

module.exports = mongoose.model('Veiculo', VeiculoSchema);
