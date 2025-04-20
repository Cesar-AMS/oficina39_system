const Financeiro = require('../models/Financeiro');
const Cliente = require('../models/Cliente');
const Fornecedor = require('../models/Fornecedor');
const OrdemServico = require('../models/OrdemServico');
const Log = require('../models/Log');

// Obter todos os lançamentos financeiros
exports.getLancamentos = async (req, res) => {
  try {
    const { tipo, status, dataInicio, dataFim } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (tipo) {
      filtro.tipo = tipo;
    }
    
    if (status) {
      filtro.status = status;
    }
    
    if (dataInicio && dataFim) {
      filtro.data_vencimento = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }
    
    const lancamentos = await Financeiro.find(filtro)
      .sort({ data_vencimento: 1 });
    
    res.status(200).json(lancamentos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar lançamentos financeiros', error: err.message });
  }
};

// Obter lançamento por ID
exports.getLancamentoById = async (req, res) => {
  try {
    const lancamento = await Financeiro.findById(req.params.id);
    
    if (!lancamento) {
      return res.status(404).json({ message: 'Lançamento financeiro não encontrado' });
    }
    
    res.status(200).json(lancamento);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar lançamento financeiro', error: err.message });
  }
};

// Criar novo lançamento
exports.createLancamento = async (req, res) => {
  try {
    const {
      tipo,
      categoria,
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
      forma_pagamento,
      status,
      documento_referencia,
      documento_id,
      cliente_fornecedor_id,
      observacoes
    } = req.body;
    
    // Verificar se o cliente/fornecedor existe, se fornecido
    if (cliente_fornecedor_id) {
      if (tipo === 'Receita') {
        const cliente = await Cliente.findById(cliente_fornecedor_id);
        if (!cliente) {
          return res.status(404).json({ message: 'Cliente não encontrado' });
        }
      } else if (tipo === 'Despesa') {
        const fornecedor = await Fornecedor.findById(cliente_fornecedor_id);
        if (!fornecedor) {
          return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }
      }
    }
    
    // Verificar se o documento existe, se fornecido
    if (documento_id && documento_referencia === 'Ordem de Serviço') {
      const ordemServico = await OrdemServico.findById(documento_id);
      if (!ordemServico) {
        return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
      }
    }
    
    const novoLancamento = new Financeiro({
      tipo,
      categoria,
      descricao,
      valor,
      data_vencimento: new Date(data_vencimento),
      data_pagamento: data_pagamento ? new Date(data_pagamento) : undefined,
      forma_pagamento,
      status: status || (data_pagamento ? 'Pago' : 'Pendente'),
      documento_referencia,
      documento_id,
      cliente_fornecedor_id,
      responsavel_id: req.usuario ? req.usuario._id : null,
      observacoes
    });
    
    const lancamentoSalvo = await novoLancamento.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Criação',
      'Financeiro',
      lancamentoSalvo._id,
      { tipo: lancamentoSalvo.tipo, valor: lancamentoSalvo.valor },
      req.ip
    );
    
    res.status(201).json(lancamentoSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar lançamento financeiro', error: err.message });
  }
};

// Atualizar lançamento
exports.updateLancamento = async (req, res) => {
  try {
    const {
      categoria,
      descricao,
      valor,
      data_vencimento,
      observacoes
    } = req.body;
    
    const lancamento = await Financeiro.findById(req.params.id);
    if (!lancamento) {
      return res.status(404).json({ message: 'Lançamento financeiro não encontrado' });
    }
    
    // Verificar se o lançamento já foi pago
    if (lancamento.status === 'Pago') {
      return res.status(400).json({ message: 'Não é possível editar um lançamento já pago' });
    }
    
    // Atualizar campos
    if (categoria) lancamento.categoria = categoria;
    if (descricao) lancamento.descricao = descricao;
    if (valor) lancamento.valor = valor;
    if (data_vencimento) lancamento.data_vencimento = new Date(data_vencimento);
    if (observacoes) lancamento.observacoes = observacoes;
    
    const lancamentoAtualizado = await lancamento.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Atualização',
      'Financeiro',
      lancamentoAtualizado._id,
      { campos_atualizados: req.body },
      req.ip
    );
    
    res.status(200).json(lancamentoAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar lançamento financeiro', error: err.message });
  }
};

// Registrar pagamento
exports.registrarPagamento = async (req, res) => {
  try {
    const { data_pagamento, forma_pagamento } = req.body;
    
    if (!data_pagamento || !forma_pagamento) {
      return res.status(400).json({ message: 'Data de pagamento e forma de pagamento são obrigatórios' });
    }
    
    const lancamento = await Financeiro.findById(req.params.id);
    if (!lancamento) {
      return res.status(404).json({ message: 'Lançamento financeiro não encontrado' });
    }
    
    // Verificar se o lançamento já foi pago
    if (lancamento.status === 'Pago') {
      return res.status(400).json({ message: 'Este lançamento já foi pago' });
    }
    
    // Registrar pagamento
    await lancamento.registrarPagamento(new Date(data_pagamento), forma_pagamento);
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Pagamento',
      'Financeiro',
      lancamento._id,
      { data_pagamento, forma_pagamento },
      req.ip
    );
    
    res.status(200).json(lancamento);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao registrar pagamento', error: err.message });
  }
};

// Cancelar lançamento
exports.cancelarLancamento = async (req, res) => {
  try {
    const { motivo } = req.body;
    
    if (!motivo) {
      return res.status(400).json({ message: 'Motivo do cancelamento é obrigatório' });
    }
    
    const lancamento = await Financeiro.findById(req.params.id);
    if (!lancamento) {
      return res.status(404).json({ message: 'Lançamento financeiro não encontrado' });
    }
    
    // Verificar se o lançamento já foi cancelado
    if (lancamento.status === 'Cancelado') {
      return res.status(400).json({ message: 'Este lançamento já está cancelado' });
    }
    
    // Cancelar lançamento
    await lancamento.cancelar();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Cancelamento',
      'Financeiro',
      lancamento._id,
      { motivo },
      req.ip
    );
    
    res.status(200).json({ message: 'Lançamento cancelado com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cancelar lançamento', error: err.message });
  }
};

// Obter lançamentos por período
exports.getLancamentosPorPeriodo = async (req, res) => {
  try {
    const { dataInicio, dataFim, tipo } = req.query;
    
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ message: 'Data inicial e final são obrigatórias' });
    }
    
    const lancamentos = await Financeiro.buscarPorPeriodo(
      new Date(dataInicio),
      new Date(dataFim),
      tipo
    );
    
    res.status(200).json(lancamentos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar lançamentos por período', error: err.message });
  }
};

// Obter resumo financeiro
exports.getResumoFinanceiro = async (req, res) => {
  try {
    const { dataInicio, dataFim } = req.query;
    
    if (!dataInicio || !dataFim) {
      return res.status(400).json({ message: 'Data inicial e final são obrigatórias' });
    }
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    // Buscar receitas
    const receitas = await Financeiro.find({
      tipo: 'Receita',
      status: 'Pago',
      data_pagamento: { $gte: inicio, $lte: fim }
    });
    
    // Buscar despesas
    const despesas = await Financeiro.find({
      tipo: 'Despesa',
      status: 'Pago',
      data_pagamento: { $gte: inicio, $lte: fim }
    });
    
    // Calcular totais
    const totalReceitas = receitas.reduce((total, item) => total + item.valor, 0);
    const totalDespesas = despesas.reduce((total, item) => total + item.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    
    // Agrupar por categoria
    const receitasPorCategoria = {};
    receitas.forEach(item => {
      if (!receitasPorCategoria[item.categoria]) {
        receitasPorCategoria[item.categoria] = 0;
      }
      receitasPorCategoria[item.categoria] += item.valor;
    });
    
    const despesasPorCategoria = {};
    despesas.forEach(item => {
      if (!despesasPorCategoria[item.categoria]) {
        despesasPorCategoria[item.categoria] = 0;
      }
      despesasPorCategoria[item.categoria] += item.valor;
    });
    
    res.status(200).json({
      periodo: {
        inicio: dataInicio,
        fim: dataFim
      },
      totais: {
        receitas: totalReceitas,
        despesas: totalDespesas,
        saldo
      },
      receitas_por_categoria: receitasPorCategoria,
      despesas_por_categoria: despesasPorCategoria
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao gerar resumo financeiro', error: err.message });
  }
};
