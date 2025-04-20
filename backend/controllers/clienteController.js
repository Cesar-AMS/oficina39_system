const Cliente = require('../models/Cliente');
const Log = require('../models/Log');

// Obter todos os clientes
exports.getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find({ ativo: true });
    res.status(200).json(clientes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar clientes', error: err.message });
  }
};

// Obter cliente por ID
exports.getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.status(200).json(cliente);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar cliente', error: err.message });
  }
};

// Criar novo cliente
exports.createCliente = async (req, res) => {
  try {
    const novoCliente = new Cliente(req.body);
    const clienteSalvo = await novoCliente.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Criação',
      'Cliente',
      clienteSalvo._id,
      { dados: req.body },
      req.ip
    );
    
    res.status(201).json(clienteSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar cliente', error: err.message });
  }
};

// Atualizar cliente
exports.updateCliente = async (req, res) => {
  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!clienteAtualizado) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Atualização',
      'Cliente',
      clienteAtualizado._id,
      { dados: req.body },
      req.ip
    );
    
    res.status(200).json(clienteAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar cliente', error: err.message });
  }
};

// Desativar cliente (soft delete)
exports.deleteCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );
    
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Desativação',
      'Cliente',
      cliente._id,
      { motivo: req.body.motivo || 'Não especificado' },
      req.ip
    );
    
    res.status(200).json({ message: 'Cliente desativado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao desativar cliente', error: err.message });
  }
};

// Buscar clientes por nome ou CPF/CNPJ
exports.searchClientes = async (req, res) => {
  try {
    const termo = req.query.termo;
    if (!termo) {
      return res.status(400).json({ message: 'Termo de busca não fornecido' });
    }
    
    const clientes = await Cliente.buscarPorNomeOuDocumento(termo);
    res.status(200).json(clientes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar clientes', error: err.message });
  }
};
