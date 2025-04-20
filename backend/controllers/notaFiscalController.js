const NotaFiscal = require('../models/NotaFiscal');
const OrdemServico = require('../models/OrdemServico');
const Cliente = require('../models/Cliente');
const Configuracao = require('../models/Configuracao');
const Log = require('../models/Log');

// Obter todas as notas fiscais
exports.getNotasFiscais = async (req, res) => {
  try {
    const { dataInicio, dataFim, status } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (status) {
      filtro.status = status;
    }
    
    if (dataInicio && dataFim) {
      filtro.data_emissao = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }
    
    const notasFiscais = await NotaFiscal.find(filtro)
      .populate('cliente_id', 'nome cpf_cnpj')
      .populate('ordem_servico_id', 'numero')
      .sort({ data_emissao: -1 });
    
    res.status(200).json(notasFiscais);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar notas fiscais', error: err.message });
  }
};

// Obter nota fiscal por ID
exports.getNotaFiscalById = async (req, res) => {
  try {
    const notaFiscal = await NotaFiscal.findById(req.params.id)
      .populate('cliente_id', 'nome cpf_cnpj endereco telefone email')
      .populate('ordem_servico_id', 'numero data_entrada data_conclusao');
    
    if (!notaFiscal) {
      return res.status(404).json({ message: 'Nota fiscal não encontrada' });
    }
    
    res.status(200).json(notaFiscal);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar nota fiscal', error: err.message });
  }
};

// Emitir nota fiscal para uma ordem de serviço
exports.emitirNotaFiscal = async (req, res) => {
  try {
    const { ordem_servico_id } = req.body;
    
    // Verificar se a ordem de serviço existe
    const ordemServico = await OrdemServico.findById(ordem_servico_id)
      .populate('cliente_id')
      .populate('itens_servico.servico_id')
      .populate('itens_produto.produto_id');
    
    if (!ordemServico) {
      return res.status(404).json({ message: 'Ordem de serviço não encontrada' });
    }
    
    // Verificar se a ordem de serviço já possui nota fiscal
    if (ordemServico.nota_fiscal_id) {
      return res.status(400).json({ message: 'Esta ordem de serviço já possui uma nota fiscal emitida' });
    }
    
    // Verificar se a ordem de serviço está concluída
    if (ordemServico.status !== 'Concluída' && ordemServico.status !== 'Entregue') {
      return res.status(400).json({ message: 'Só é possível emitir nota fiscal para ordens de serviço concluídas' });
    }
    
    // Obter configurações da empresa
    const config = await Configuracao.obterConfiguracoes();
    
    // Preparar itens da nota fiscal
    const itens = [];
    
    // Adicionar serviços
    ordemServico.itens_servico.forEach(item => {
      itens.push({
        descricao: item.descricao,
        quantidade: 1,
        valor_unitario: item.valor,
        valor_total: item.valor,
        cfop: '5933' // CFOP para serviços de oficina
      });
    });
    
    // Adicionar produtos
    ordemServico.itens_produto.forEach(item => {
      itens.push({
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        valor_total: item.valor_total,
        ncm: item.produto_id ? item.produto_id.ncm : '',
        cfop: '5102' // CFOP para venda de mercadorias
      });
    });
    
    // Incrementar numeração da NF
    const numeroNF = config.fiscal.proxima_numeracao_nfe.toString().padStart(9, '0');
    await config.incrementarNumeracaoNFe();
    
    // Criar nova nota fiscal
    const novaNotaFiscal = new NotaFiscal({
      numero: numeroNF,
      serie: config.fiscal.serie_nfe,
      ordem_servico_id: ordemServico._id,
      cliente_id: ordemServico.cliente_id._id,
      data_emissao: new Date(),
      valor_total: ordemServico.valor_total,
      itens,
      impostos: {
        base_calculo_icms: ordemServico.valor_produtos,
        valor_icms: ordemServico.valor_produtos * 0.18, // 18% de ICMS (exemplo)
        base_calculo_iss: ordemServico.valor_servicos,
        valor_iss: ordemServico.valor_servicos * 0.05, // 5% de ISS (exemplo)
        pis: ordemServico.valor_total * 0.0065, // 0.65% de PIS (exemplo)
        cofins: ordemServico.valor_total * 0.03 // 3% de COFINS (exemplo)
      },
      status: 'Emitida'
    });
    
    const notaFiscalSalva = await novaNotaFiscal.save();
    
    // Gerar chave de acesso (simulação)
    await notaFiscalSalva.gerarChaveAcesso();
    
    // Atualizar referência na ordem de serviço
    ordemServico.nota_fiscal_id = notaFiscalSalva._id;
    await ordemServico.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Emissão',
      'NotaFiscal',
      notaFiscalSalva._id,
      { numero: notaFiscalSalva.numero, ordem_servico: ordemServico.numero },
      req.ip
    );
    
    res.status(201).json(notaFiscalSalva);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao emitir nota fiscal', error: err.message });
  }
};

// Cancelar nota fiscal
exports.cancelarNotaFiscal = async (req, res) => {
  try {
    const { motivo } = req.body;
    
    if (!motivo) {
      return res.status(400).json({ message: 'Motivo do cancelamento é obrigatório' });
    }
    
    const notaFiscal = await NotaFiscal.findById(req.params.id);
    if (!notaFiscal) {
      return res.status(404).json({ message: 'Nota fiscal não encontrada' });
    }
    
    if (notaFiscal.status === 'Cancelada') {
      return res.status(400).json({ message: 'Esta nota fiscal já está cancelada' });
    }
    
    // Cancelar nota fiscal
    await notaFiscal.cancelar(motivo);
    
    // Remover referência na ordem de serviço
    await OrdemServico.findByIdAndUpdate(
      notaFiscal.ordem_servico_id,
      { $unset: { nota_fiscal_id: 1 } }
    );
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Cancelamento',
      'NotaFiscal',
      notaFiscal._id,
      { numero: notaFiscal.numero, motivo },
      req.ip
    );
    
    res.status(200).json({ message: 'Nota fiscal cancelada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cancelar nota fiscal', error: err.message });
  }
};

// Obter notas fiscais por cliente
exports.getNotasFiscaisByCliente = async (req, res) => {
  try {
    const notasFiscais = await NotaFiscal.find({ cliente_id: req.params.clienteId })
      .populate('ordem_servico_id', 'numero')
      .sort({ data_emissao: -1 });
    
    res.status(200).json(notasFiscais);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar notas fiscais', error: err.message });
  }
};

// Obter nota fiscal por ordem de serviço
exports.getNotaFiscalByOrdemServico = async (req, res) => {
  try {
    const notaFiscal = await NotaFiscal.findOne({ ordem_servico_id: req.params.ordemServicoId })
      .populate('cliente_id', 'nome cpf_cnpj')
      .populate('ordem_servico_id', 'numero');
    
    if (!notaFiscal) {
      return res.status(404).json({ message: 'Nota fiscal não encontrada para esta ordem de serviço' });
    }
    
    res.status(200).json(notaFiscal);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar nota fiscal', error: err.message });
  }
};

// Gerar PDF da nota fiscal (simulação)
exports.gerarPDF = async (req, res) => {
  try {
    const notaFiscal = await NotaFiscal.findById(req.params.id)
      .populate('cliente_id', 'nome cpf_cnpj endereco')
      .populate('ordem_servico_id', 'numero');
    
    if (!notaFiscal) {
      return res.status(404).json({ message: 'Nota fiscal não encontrada' });
    }
    
    // Simulação de geração de PDF
    const pdfPath = `/tmp/nf_${notaFiscal.numero}.pdf`;
    
    // Atualizar caminho do PDF na nota fiscal
    notaFiscal.pdf = pdfPath;
    await notaFiscal.save();
    
    res.status(200).json({
      message: 'PDF gerado com sucesso',
      pdf_path: pdfPath
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao gerar PDF', error: err.message });
  }
};
