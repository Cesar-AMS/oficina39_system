const OrdemServico = require('../models/OrdemServico');
const Cliente = require('../models/Cliente');
const Veiculo = require('../models/Veiculo');
const Servico = require('../models/Servico');
const Produto = require('../models/Produto');
const Funcionario = require('../models/Funcionario');
const MovimentacaoEstoque = require('../models/MovimentacaoEstoque');
const Log = require('../models/Log');

// Obter todas as ordens de serviço
exports.getOrdensServico = async (req, res) => {
  try {
    const { status, dataInicio, dataFim } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (status) {
      filtro.status = status;
    }
    
    if (dataInicio && dataFim) {
      filtro.data_entrada = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }
    
    const ordensServico = await OrdemServico.find(filtro)
      .populate('cliente_id', 'nome cpf_cnpj telefone')
      .populate('veiculo_id', 'placa marca modelo')
      .populate('responsavel_id', 'nome')
      .sort({ data_entrada: -1 });
    
    res.status(200).json(ordensServico);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar ordens de serviço', error: err.message });
  }
};

// Obter ordem de serviço por ID
exports.getOrdemServicoById = async (req, res) => {
  try {
    const ordemServico = await OrdemServico.findById(req.params.id)
      .populate('cliente_id', 'nome cpf_cnpj telefone celular email')
      .populate('veiculo_id', 'placa marca modelo ano_fabricacao cor quilometragem')
      .populate('itens_servico.servico_id', 'nome codigo')
      .populate('itens_servico.mecanico_id', 'nome')
      .populate('itens_produto.produto_id', 'nome codigo')
      .populate('responsavel_id', 'nome');
    
    if (!ordemServico) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    
    res.status(200).json(ordemServico);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar ordem de serviço', error: err.message });
  }
};

// Criar nova ordem de serviço
exports.createOrdemServico = async (req, res) => {
  try {
    const {
      cliente_id,
      veiculo_id,
      quilometragem,
      diagnostico,
      observacoes_cliente,
      observacoes_internas,
      responsavel_id
    } = req.body;
    
    // Verificar se o cliente existe
    const cliente = await Cliente.findById(cliente_id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    
    // Verificar se o veículo existe
    const veiculo = await Veiculo.findById(veiculo_id);
    if (!veiculo) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }
    
    // Verificar se o responsável existe, se fornecido
    if (responsavel_id) {
      const responsavel = await Funcionario.findById(responsavel_id);
      if (!responsavel) {
        return res.status(404).json({ message: 'Funcionário responsável não encontrado' });
      }
    }
    
    // Gerar número da OS
    const dataAtual = new Date();
    const ano = dataAtual.getFullYear();
    const mes = (dataAtual.getMonth() + 1).toString().padStart(2, '0');
    
    // Buscar a última OS para gerar o próximo número
    const ultimaOS = await OrdemServico.findOne()
      .sort({ data_cadastro: -1 });
    
    let proximoNumero = 1;
    if (ultimaOS && ultimaOS.numero) {
      const partes = ultimaOS.numero.split('/');
      if (partes.length > 0) {
        proximoNumero = parseInt(partes[0]) + 1;
      }
    }
    
    const numeroOS = `${proximoNumero.toString().padStart(6, '0')}/${mes}${ano}`;
    
    // Atualizar quilometragem do veículo
    if (quilometragem && quilometragem > veiculo.quilometragem) {
      veiculo.quilometragem = quilometragem;
      await veiculo.save();
    }
    
    // Criar nova ordem de serviço
    const novaOrdemServico = new OrdemServico({
      numero: numeroOS,
      cliente_id,
      veiculo_id,
      data_entrada: new Date(),
      status: 'Aberta',
      quilometragem: quilometragem || veiculo.quilometragem,
      diagnostico,
      observacoes_cliente,
      observacoes_internas,
      responsavel_id,
      itens_servico: [],
      itens_produto: [],
      valor_servicos: 0,
      valor_produtos: 0,
      valor_total: 0
    });
    
    const ordemServicoSalva = await novaOrdemServico.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Criação',
      'OrdemServico',
      ordemServicoSalva._id,
      { numero: ordemServicoSalva.numero },
      req.ip
    );
    
    res.status(201).json(ordemServicoSalva);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar ordem de serviço', error: err.message });
  }
};

// Atualizar ordem de serviço
exports.updateOrdemServico = async (req, res) => {
  try {
    const {
      status,
      data_previsao,
      diagnostico,
      observacoes_cliente,
      observacoes_internas,
      responsavel_id,
      desconto,
      forma_pagamento,
      parcelas
    } = req.body;
    
    // Verificar se o responsável existe, se fornecido
    if (responsavel_id) {
      const responsavel = await Funcionario.findById(responsavel_id);
      if (!responsavel) {
        return res.status(404).json({ message: 'Funcionário responsável não encontrado' });
      }
    }
    
    // Buscar a ordem de serviço
    const ordemServico = await OrdemServico.findById(req.params.id);
    if (!ordemServico) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    
    // Atualizar campos
    if (status) ordemServico.status = status;
    if (data_previsao) ordemServico.data_previsao = new Date(data_previsao);
    if (diagnostico) ordemServico.diagnostico = diagnostico;
    if (observacoes_cliente) ordemServico.observacoes_cliente = observacoes_cliente;
    if (observacoes_internas) ordemServico.observacoes_internas = observacoes_internas;
    if (responsavel_id) ordemServico.responsavel_id = responsavel_id;
    if (desconto !== undefined) ordemServico.desconto = desconto;
    if (forma_pagamento) ordemServico.forma_pagamento = forma_pagamento;
    if (parcelas) ordemServico.parcelas = parcelas;
    
    // Se o status for "Concluída", atualizar a data de conclusão
    if (status === 'Concluída') {
      ordemServico.data_conclusao = new Date();
    }
    
    const ordemServicoAtualizada = await ordemServico.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Atualização',
      'OrdemServico',
      ordemServicoAtualizada._id,
      { status: ordemServicoAtualizada.status },
      req.ip
    );
    
    res.status(200).json(ordemServicoAtualizada);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar ordem de serviço', error: err.message });
  }
};

// Adicionar serviço à ordem
exports.addServico = async (req, res) => {
  try {
    const { servico_id, descricao, valor, mecanico_id } = req.body;
    
    // Verificar se o serviço existe
    const servico = await Servico.findById(servico_id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }
    
    // Verificar se o mecânico existe, se fornecido
    if (mecanico_id) {
      const mecanico = await Funcionario.findById(mecanico_id);
      if (!mecanico) {
        return res.status(404).json({ message: 'Mecânico não encontrado' });
      }
    }
    
    // Buscar a ordem de serviço
    const ordemServico = await OrdemServico.findById(req.params.id);
    if (!ordemServico) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    
    // Adicionar serviço
    await ordemServico.adicionarServico(
      servico_id,
      descricao || servico.nome,
      valor || servico.preco,
      mecanico_id
    );
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Adição de Serviço',
      'OrdemServico',
      ordemServico._id,
      { servico_id, descricao, valor },
      req.ip
    );
    
    res.status(200).json(ordemServico);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao adicionar serviço', error: err.message });
  }
};

// Adicionar produto à ordem
exports.addProduto = async (req, res) => {
  try {
    const { produto_id, descricao, quantidade, valor_unitario } = req.body;
    
    // Verificar se o produto existe
    const produto = await Produto.findById(produto_id);
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Verificar estoque
    if (produto.estoque_atual < quantidade) {
      return res.status(400).json({ message: 'Estoque insuficiente' });
    }
    
    // Buscar a ordem de serviço
    const ordemServico = await OrdemServico.findById(req.params.id);
    if (!ordemServico) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    
    // Adicionar produto
    await ordemServico.adicionarProduto(
      produto_id,
      descricao || produto.nome,
      quantidade,
      valor_unitario || produto.preco_venda
    );
    
    // Atualizar estoque
    await produto.atualizarEstoque(quantidade, 'saida');
    
    // Registrar movimentação de estoque
    await MovimentacaoEstoque.create({
      produto_id: produto._id,
      tipo: 'Saída',
      quantidade,
      motivo: `Utilizado na OS ${ordemServico.numero}`,
      documento_referencia: 'Ordem de Serviço',
      documento_id: ordemServico._id,
      responsavel_id: req.usuario ? req.usuario._id : null,
      data_movimentacao: new Date()
    });
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Adição de Produto',
      'OrdemServico',
      ordemServico._id,
      { produto_id, descricao, quantidade, valor_unitario },
      req.ip
    );
    
    res.status(200).json(ordemServico);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao adicionar produto', error: err.message });
  }
};

// Remover serviço da ordem
exports.removeServico = async (req, res) => {
  try {
    const { item_id } = req.params;
    
    // Buscar a ordem de serviço
    const ordemServico = await OrdemServico.findById(req.params.id);
    if (!ordemServico) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    
    // Encontrar o índice do item
    const index = ordemServico.itens_servico.findIndex(
      item => item._id.toString() === item_id
    );
    
    if (index === -1) {
      return res.status(404).json({ message: 'Item de serviço não encontrado' });
    }
    
    // Remover o item
    ordemServico.itens_servico.splice(index, 1);
    await ordemServico.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Remoção de Serviço',
      'OrdemServico',
      ordemServico._id,
      { item_id },
      req.ip
    );
    
    res.status(200).json(ordemServico);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao remover serviço', error: err.message });
  }
};

// Remover produto da ordem
exports.removeProduto = async (req, res) => {
  try {
    const { item_id } = req.params;
    
    // Buscar a ordem de serviço
    const ordemServico = await OrdemServico.findById(req.params.id);
    if (!ordemServico) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    
    // Encontrar o item
    const index = ordemServico.itens_produto.findIndex(
      item => item._id.toString() === item_id
    );
    
    if (index === -1) {
      return res.status(404).json({ message: 'Item de produto não encontrado' });
    }
    
    const item = ordemServico.itens_produto[index];
    
    // Devolver ao estoque
    const produto = await Produto.findById(item.produto_id);
    if (produto) {
      await produto.atualizarEstoque(item.quantidade, 'entrada');
      
      // Registrar movimentação de estoque
      await MovimentacaoEstoque.create({
        produto_id: produto._id,
        tipo: 'Entrada',
        quantidade: item.quantidade,
        motivo: `Devolvido da OS ${ordemServico.numero}`,
        documento_referencia: 'Ordem de Serviço',
        documento_id: ordemServico._id,
        responsavel_id: req.usuario ? req.usuario._id : null,
        data_movimentacao: new Date()
      });
    }
    
    // Remover o item
    ordemServico.itens_produto.splice(index, 1);
    await ordemServico.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Remoção de Produto',
      'OrdemServico',
      ordemServico._id,
      { item_id },
      req.ip
    );
    
    res.status(200).json(ordemServico);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao remover produto', error: err.message });
  }
};

// Buscar ordens de serviço por cliente
exports.getOrdensByCliente = async (req, res) => {
  try {
    const ordensServico = await OrdemServico.find({ cliente_id: req.params.clienteId })
      .populate('veiculo_id', 'placa marca modelo')
      .sort({ data_entrada: -1 });
    
    res.status(200).json(ordensServico);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar ordens de serviço', error: err.message });
  }
};

// Buscar ordens de serviço por veículo
exports.getOrdensByVeiculo = async (req, res) => {
  try {
    const ordensServico = await OrdemServico.find({ veiculo_id: req.params.veiculoId })
      .populate('cliente_id', 'nome')
      .sort({ data_entrada: -1 });
    
    res.status(200).json(ordensServico);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar ordens de serviço', error: err.message });
  }
};

// Buscar ordens de serviço por número
exports.searchOrdens = async (req, res) => {
  try {
    const termo = req.query.termo;
    if (!termo) {
      return res.status(400).json({ message: 'Termo de busca não fornecido' });
    }
    
    const ordensServico = await OrdemServico.buscarPorNumeroOuCliente(termo)
      .populate('veiculo_id', 'placa marca modelo');
    
    res.status(200).json(ordensServico);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar ordens de serviço', error: err.message });
  }
};
