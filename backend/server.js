const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/oficina39')
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rotas
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/veiculos', require('./routes/veiculoRoutes'));
app.use('/api/produtos', require('./routes/produtoRoutes'));
//app.use('/api/fornecedores', require('./routes/fornecedorRoutes'));
//app.use('/api/servicos', require('./routes/servicoRoutes'));
app.use('/api/ordens-servico', require('./routes/ordemServicoRoutes'));
app.use('/api/notas-fiscais', require('./routes/notaFiscalRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
//app.use('/api/funcionarios', require('./routes/funcionarioRoutes'));
//app.use('/api/estoque', require('./routes/estoqueRoutes'));
app.use('/api/financeiro', require('./routes/financeiroRoutes'));
app.use('/api/agendamentos', require('./routes/agendamentoRoutes'));
app.use('/api/configuracoes', require('./routes/configuracaoRoutes'));

// Rota padrão
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Gerenciamento da Oficina 39' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
