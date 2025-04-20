const Veiculo = require('../models/Veiculo');
const Cliente = require('../models/Cliente');
const Log = require('../models/Log');

// Obter todos os veículos
exports.getVeiculos = async (req, res) => {
  try {
    const veiculos = await Veiculo.find()
      .populate('cliente_id', 'nome cpf_cnpj telefone');
    res.status(200).json(veiculos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar veículos', error: err.message });
  }
};

// Obter veículo por ID
exports.getVeiculoById = async (req, res) => {
  try {
    const veiculo = await Veiculo.findById(req.params.id)
      .populate('cliente_id', 'nome cpf_cnpj telefone');
    
    if (!veiculo) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    res.status(200).json(veiculo);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar veículo', error: err.message });
  }
};

// Obter veículos por cliente
exports.getVeiculosByCliente = async (req, res) => {
  try {
    const veiculos = await Veiculo.find({ cliente_id: req.params.clienteId })
      .populate('cliente_id', 'nome cpf_cnpj telefone');
    
    res.status(200).json(veiculos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar veículos do cliente', error: err.message });
  }
};

// Criar novo veículo
exports.createVeiculo = async (req, res) => {
  try {
    // Verificar se o cliente existe
    const cliente = await Cliente.findById(req.body.cliente_id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    const novoVeiculo = new Veiculo(req.body);
    const veiculoSalvo = await novoVeiculo.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Criação',
      'Veiculo',
      veiculoSalvo._id,
      { dados: req.body },
      req.ip
    );
    
    res.status(201).json(veiculoSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar veículo', error: err.message });
  }
};

// Atualizar veículo
exports.updateVeiculo = async (req, res) => {
  try {
    // Se estiver atualizando o cliente, verificar se existe
    if (req.body.cliente_id) {
      const cliente = await Cliente.findById(req.body.cliente_id);
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente não encontrado' });
      }
    }
    
    const veiculoAtualizado = await Veiculo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!veiculoAtualizado) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Atualização',
      'Veiculo',
      veiculoAtualizado._id,
      { dados: req.body },
      req.ip
    );
    
    res.status(200).json(veiculoAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar veículo', error: err.message });
  }
};

// Excluir veículo
exports.deleteVeiculo = async (req, res) => {
  try {
    const veiculo = await Veiculo.findByIdAndDelete(req.params.id);
    
    if (!veiculo) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Exclusão',
      'Veiculo',
      req.params.id,
      { motivo: req.body.motivo || 'Não especificado' },
      req.ip
    );
    
    res.status(200).json({ message: 'Veículo excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao excluir veículo', error: err.message });
  }
};

// Buscar veículo por placa
exports.searchVeiculoByPlaca = async (req, res) => {
  try {
    const placa = req.query.placa;
    if (!placa) {
      return res.status(400).json({ message: 'Placa não fornecida' });
    }
    
    const veiculo = await Veiculo.buscarPorPlaca(placa)
      .populate('cliente_id', 'nome cpf_cnpj telefone');
    
    if (!veiculo) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    res.status(200).json(veiculo);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar veículo', error: err.message });
  }
};

// Adicionar registro ao histórico de manutenção
exports.addManutencao = async (req, res) => {
  try {
    const { data, quilometragem, descricao } = req.body;
    
    if (!data || !quilometragem || !descricao) {
      return res.status(400).json({ message: 'Dados incompletos para registro de manutenção' });
    }
    
    const veiculo = await Veiculo.findById(req.params.id);
    
    if (!veiculo) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    await veiculo.adicionarManutencao(new Date(data), quilometragem, descricao);
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Adição de Manutenção',
      'Veiculo',
      veiculo._id,
      { data, quilometragem, descricao },
      req.ip
    );
    
    res.status(200).json(veiculo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao adicionar manutenção', error: err.message });
  }
};
