const Configuracao = require('../models/Configuracao');
const Log = require('../models/Log');

// Obter configurações do sistema
exports.getConfiguracoes = async (req, res) => {
  try {
    const config = await Configuracao.obterConfiguracoes();
    
    // Remover informações sensíveis para usuários não administradores
    if (req.usuario.perfil !== 'Administrador') {
      // Remover senha do certificado e outras informações sensíveis
      if (config.fiscal) {
        delete config.fiscal.senha_certificado;
      }
    }
    
    res.status(200).json(config);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar configurações', error: err.message });
  }
};

// Atualizar configurações do sistema
exports.updateConfiguracoes = async (req, res) => {
  try {
    // Verificar se o usuário tem permissão de administrador
    if (req.usuario.perfil !== 'Administrador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem atualizar configurações.' });
    }
    
    const config = await Configuracao.obterConfiguracoes();
    
    // Atualizar dados da empresa
    if (req.body.empresa) {
      Object.assign(config.empresa, req.body.empresa);
    }
    
    // Atualizar configurações fiscais
    if (req.body.fiscal) {
      Object.assign(config.fiscal, req.body.fiscal);
    }
    
    // Atualizar configurações do sistema
    if (req.body.sistema) {
      Object.assign(config.sistema, req.body.sistema);
    }
    
    const configAtualizada = await config.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario._id,
      'Atualização',
      'Configuracao',
      configAtualizada._id,
      { secoes_atualizadas: Object.keys(req.body) },
      req.ip
    );
    
    // Remover informações sensíveis da resposta
    if (configAtualizada.fiscal) {
      delete configAtualizada.fiscal.senha_certificado;
    }
    
    res.status(200).json(configAtualizada);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar configurações', error: err.message });
  }
};

// Fazer backup do sistema (simulação)
exports.fazerBackup = async (req, res) => {
  try {
    // Verificar se o usuário tem permissão de administrador
    if (req.usuario.perfil !== 'Administrador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem realizar backups.' });
    }
    
    // Simulação de backup
    const dataAtual = new Date();
    const nomeArquivo = `backup_oficina39_${dataAtual.toISOString().split('T')[0]}.zip`;
    
    // Registrar log
    await Log.registrar(
      req.usuario._id,
      'Backup',
      'Sistema',
      null,
      { arquivo: nomeArquivo },
      req.ip
    );
    
    res.status(200).json({
      message: 'Backup realizado com sucesso',
      arquivo: nomeArquivo,
      data: dataAtual
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao realizar backup', error: err.message });
  }
};

// Obter estatísticas do sistema
exports.getEstatisticas = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const Cliente = mongoose.model('Cliente');
    const Veiculo = mongoose.model('Veiculo');
    const OrdemServico = mongoose.model('OrdemServico');
    const Produto = mongoose.model('Produto');
    const Agendamento = mongoose.model('Agendamento');
    
    // Contagem de registros
    const totalClientes = await Cliente.countDocuments({ ativo: true });
    const totalVeiculos = await Veiculo.countDocuments();
    const totalProdutos = await Produto.countDocuments({ ativo: true });
    
    // Ordens de serviço por status
    const ordensServicoPorStatus = await OrdemServico.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Agendamentos para hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    
    const agendamentosHoje = await Agendamento.countDocuments({
      data_hora: { $gte: hoje, $lt: amanha },
      status: { $in: ['Agendado', 'Confirmado'] }
    });
    
    // Produtos com estoque baixo
    const produtosEstoqueBaixo = await Produto.countDocuments({
      $expr: { $lte: ['$estoque_atual', '$estoque_minimo'] },
      ativo: true
    });
    
    // Faturamento do mês atual
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
    
    const ordensServicoMes = await OrdemServico.find({
      data_conclusao: { $gte: inicioMes, $lte: fimMes },
      status: { $in: ['Concluída', 'Entregue'] }
    });
    
    const faturamentoMes = ordensServicoMes.reduce((total, os) => total + os.valor_total, 0);
    
    res.status(200).json({
      registros: {
        clientes: totalClientes,
        veiculos: totalVeiculos,
        produtos: totalProdutos
      },
      ordens_servico: {
        por_status: ordensServicoPorStatus.reduce((obj, item) => {
          obj[item._id] = item.count;
          return obj;
        }, {})
      },
      agendamentos: {
        hoje: agendamentosHoje
      },
      estoque: {
        produtos_estoque_baixo: produtosEstoqueBaixo
      },
      financeiro: {
        faturamento_mes_atual: faturamentoMes
      },
      data_atualizacao: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter estatísticas', error: err.message });
  }
};
