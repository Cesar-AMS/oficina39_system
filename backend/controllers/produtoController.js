const Produto = require('../models/Produto');
const Fornecedor = require('../models/Fornecedor');
const MovimentacaoEstoque = require('../models/MovimentacaoEstoque');
const Log = require('../models/Log');

// Obter todos os produtos
exports.getProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find({ ativo: true })
      .populate('fornecedor_id', 'razao_social nome_fantasia');
    res.status(200).json(produtos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: err.message });
  }
};

// Obter produto por ID
exports.getProdutoById = async (req, res) => {
  try {
    const produto = await Produto.findById(req.params.id)
      .populate('fornecedor_id', 'razao_social nome_fantasia');
    
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    res.status(200).json(produto);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produto', error: err.message });
  }
};

// Criar novo produto
exports.createProduto = async (req, res) => {
  try {
    // Verificar se o fornecedor existe, se fornecido
    if (req.body.fornecedor_id) {
      const fornecedor = await Fornecedor.findById(req.body.fornecedor_id);
      if (!fornecedor) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
    }
    
    const novoProduto = new Produto(req.body);
    const produtoSalvo = await novoProduto.save();
    
    // Se fornecedor foi especificado, adicionar produto à lista de produtos fornecidos
    if (req.body.fornecedor_id) {
      await Fornecedor.findByIdAndUpdate(
        req.body.fornecedor_id,
        { $addToSet: { produtos_fornecidos: produtoSalvo._id } }
      );
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Criação',
      'Produto',
      produtoSalvo._id,
      { dados: req.body },
      req.ip
    );
    
    // Registrar movimentação de estoque inicial, se houver estoque
    if (produtoSalvo.estoque_atual > 0) {
      await MovimentacaoEstoque.create({
        produto_id: produtoSalvo._id,
        tipo: 'Entrada',
        quantidade: produtoSalvo.estoque_atual,
        motivo: 'Estoque inicial',
        responsavel_id: req.usuario ? req.usuario._id : null,
        data_movimentacao: new Date()
      });
    }
    
    res.status(201).json(produtoSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar produto', error: err.message });
  }
};

// Atualizar produto
exports.updateProduto = async (req, res) => {
  try {
    // Verificar se o fornecedor existe, se fornecido
    if (req.body.fornecedor_id) {
      const fornecedor = await Fornecedor.findById(req.body.fornecedor_id);
      if (!fornecedor) {
        return res.status(404).json({ message: 'Fornecedor não encontrado' });
      }
    }
    
    // Buscar produto atual para comparar estoque
    const produtoAtual = await Produto.findById(req.params.id);
    if (!produtoAtual) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    const estoqueAnterior = produtoAtual.estoque_atual;
    
    const produtoAtualizado = await Produto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Atualização',
      'Produto',
      produtoAtualizado._id,
      { dados: req.body },
      req.ip
    );
    
    // Se o estoque foi alterado, registrar movimentação
    if (req.body.estoque_atual !== undefined && req.body.estoque_atual !== estoqueAnterior) {
      const diferenca = req.body.estoque_atual - estoqueAnterior;
      const tipo = diferenca > 0 ? 'Entrada' : 'Saída';
      
      await MovimentacaoEstoque.create({
        produto_id: produtoAtualizado._id,
        tipo,
        quantidade: Math.abs(diferenca),
        motivo: 'Ajuste manual de estoque',
        responsavel_id: req.usuario ? req.usuario._id : null,
        data_movimentacao: new Date()
      });
    }
    
    res.status(200).json(produtoAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar produto', error: err.message });
  }
};

// Desativar produto (soft delete)
exports.deleteProduto = async (req, res) => {
  try {
    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );
    
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Desativação',
      'Produto',
      produto._id,
      { motivo: req.body.motivo || 'Não especificado' },
      req.ip
    );
    
    res.status(200).json({ message: 'Produto desativado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao desativar produto', error: err.message });
  }
};

// Buscar produtos por nome ou código
exports.searchProdutos = async (req, res) => {
  try {
    const termo = req.query.termo;
    if (!termo) {
      return res.status(400).json({ message: 'Termo de busca não fornecido' });
    }
    
    const produtos = await Produto.buscarPorNomeOuCodigo(termo)
      .populate('fornecedor_id', 'razao_social nome_fantasia');
    
    res.status(200).json(produtos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos', error: err.message });
  }
};

// Atualizar estoque
exports.updateEstoque = async (req, res) => {
  try {
    const { quantidade, tipo, motivo } = req.body;
    
    if (!quantidade || !tipo || !motivo) {
      return res.status(400).json({ 
        message: 'Dados incompletos. Forneça quantidade, tipo (entrada/saida) e motivo' 
      });
    }
    
    const produto = await Produto.findById(req.params.id);
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    
    try {
      await produto.atualizarEstoque(quantidade, tipo.toLowerCase());
      
      // Registrar movimentação
      await MovimentacaoEstoque.create({
        produto_id: produto._id,
        tipo: tipo === 'entrada' ? 'Entrada' : 'Saída',
        quantidade,
        motivo,
        responsavel_id: req.usuario ? req.usuario._id : null,
        data_movimentacao: new Date()
      });
      
      // Registrar log
      await Log.registrar(
        req.usuario ? req.usuario._id : null,
        'Movimentação de Estoque',
        'Produto',
        produto._id,
        { quantidade, tipo, motivo },
        req.ip
      );
      
      res.status(200).json(produto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar estoque', error: err.message });
  }
};

// Obter produtos com estoque baixo
exports.getProdutosEstoqueBaixo = async (req, res) => {
  try {
    const produtos = await Produto.find({
      $expr: { $lte: ["$estoque_atual", "$estoque_minimo"] },
      ativo: true
    }).populate('fornecedor_id', 'razao_social nome_fantasia telefone');
    
    res.status(200).json(produtos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar produtos com estoque baixo', error: err.message });
  }
};

// Obter histórico de movimentações de um produto
exports.getHistoricoMovimentacoes = async (req, res) => {
  try {
    const movimentacoes = await MovimentacaoEstoque.buscarPorProduto(req.params.id);
    res.status(200).json(movimentacoes);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar histórico de movimentações', error: err.message });
  }
};
