const Agendamento = require('../models/Agendamento');
const Cliente = require('../models/Cliente');
const Veiculo = require('../models/Veiculo');
const Servico = require('../models/Servico');
const Funcionario = require('../models/Funcionario');
const Log = require('../models/Log');

// Obter todos os agendamentos
exports.getAgendamentos = async (req, res) => {
  try {
    const { data, status } = req.query;
    
    // Construir filtro
    const filtro = {};
    
    if (status) {
      filtro.status = status;
    }
    
    if (data) {
      const dataInicio = new Date(data);
      dataInicio.setHours(0, 0, 0, 0);
      
      const dataFim = new Date(data);
      dataFim.setHours(23, 59, 59, 999);
      
      filtro.data_hora = {
        $gte: dataInicio,
        $lte: dataFim
      };
    }
    
    const agendamentos = await Agendamento.find(filtro)
      .populate('cliente_id', 'nome telefone celular')
      .populate('veiculo_id', 'placa marca modelo')
      .populate('servico_id', 'nome tempo_estimado')
      .populate('responsavel_id', 'nome')
      .sort({ data_hora: 1 });
    
    res.status(200).json(agendamentos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: err.message });
  }
};

// Obter agendamento por ID
exports.getAgendamentoById = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id)
      .populate('cliente_id', 'nome telefone celular email')
      .populate('veiculo_id', 'placa marca modelo ano_fabricacao cor')
      .populate('servico_id', 'nome tempo_estimado preco')
      .populate('responsavel_id', 'nome');
    
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    res.status(200).json(agendamento);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar agendamento', error: err.message });
  }
};

// Criar novo agendamento
exports.createAgendamento = async (req, res) => {
  try {
    const {
      cliente_id,
      veiculo_id,
      data_hora,
      servico_id,
      descricao,
      responsavel_id,
      observacoes
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
    
    // Verificar se o serviço existe
    const servico = await Servico.findById(servico_id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }
    
    // Verificar se o responsável existe, se fornecido
    if (responsavel_id) {
      const responsavel = await Funcionario.findById(responsavel_id);
      if (!responsavel) {
        return res.status(404).json({ message: 'Funcionário responsável não encontrado' });
      }
    }
    
    // Verificar disponibilidade do horário
    const dataAgendamento = new Date(data_hora);
    const horaInicio = new Date(dataAgendamento);
    const horaFim = new Date(dataAgendamento);
    horaFim.setMinutes(horaFim.getMinutes() + servico.tempo_estimado);
    
    const agendamentosConflitantes = await Agendamento.find({
      status: { $in: ['Agendado', 'Confirmado'] },
      data_hora: {
        $lt: horaFim,
        $gt: new Date(horaInicio.getTime() - 30 * 60000) // 30 minutos antes
      }
    });
    
    if (agendamentosConflitantes.length > 0) {
      return res.status(400).json({
        message: 'Horário indisponível. Já existem agendamentos próximos a este horário.',
        conflitos: agendamentosConflitantes
      });
    }
    
    const novoAgendamento = new Agendamento({
      cliente_id,
      veiculo_id,
      data_hora: dataAgendamento,
      servico_id,
      descricao: descricao || servico.nome,
      status: 'Agendado',
      responsavel_id,
      observacoes
    });
    
    const agendamentoSalvo = await novoAgendamento.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Criação',
      'Agendamento',
      agendamentoSalvo._id,
      { data_hora: agendamentoSalvo.data_hora, servico: servico.nome },
      req.ip
    );
    
    res.status(201).json(agendamentoSalvo);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar agendamento', error: err.message });
  }
};

// Atualizar agendamento
exports.updateAgendamento = async (req, res) => {
  try {
    const {
      data_hora,
      servico_id,
      descricao,
      responsavel_id,
      observacoes
    } = req.body;
    
    // Buscar o agendamento
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    // Verificar se o agendamento já foi concluído ou cancelado
    if (agendamento.status === 'Concluído' || agendamento.status === 'Cancelado') {
      return res.status(400).json({
        message: `Não é possível editar um agendamento ${agendamento.status.toLowerCase()}`
      });
    }
    
    // Verificar se o serviço existe, se fornecido
    let servico = null;
    if (servico_id) {
      servico = await Servico.findById(servico_id);
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
    }
    
    // Verificar se o responsável existe, se fornecido
    if (responsavel_id) {
      const responsavel = await Funcionario.findById(responsavel_id);
      if (!responsavel) {
        return res.status(404).json({ message: 'Funcionário responsável não encontrado' });
      }
    }
    
    // Verificar disponibilidade do horário, se alterado
    if (data_hora) {
      const dataAgendamento = new Date(data_hora);
      const servicoAtual = servico || await Servico.findById(agendamento.servico_id);
      
      const horaInicio = new Date(dataAgendamento);
      const horaFim = new Date(dataAgendamento);
      horaFim.setMinutes(horaFim.getMinutes() + servicoAtual.tempo_estimado);
      
      const agendamentosConflitantes = await Agendamento.find({
        _id: { $ne: agendamento._id }, // Excluir o próprio agendamento
        status: { $in: ['Agendado', 'Confirmado'] },
        data_hora: {
          $lt: horaFim,
          $gt: new Date(horaInicio.getTime() - 30 * 60000) // 30 minutos antes
        }
      });
      
      if (agendamentosConflitantes.length > 0) {
        return res.status(400).json({
          message: 'Horário indisponível. Já existem agendamentos próximos a este horário.',
          conflitos: agendamentosConflitantes
        });
      }
      
      agendamento.data_hora = dataAgendamento;
    }
    
    // Atualizar campos
    if (servico_id) agendamento.servico_id = servico_id;
    if (descricao) agendamento.descricao = descricao;
    if (responsavel_id) agendamento.responsavel_id = responsavel_id;
    if (observacoes) agendamento.observacoes = observacoes;
    
    const agendamentoAtualizado = await agendamento.save();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Atualização',
      'Agendamento',
      agendamentoAtualizado._id,
      { campos_atualizados: req.body },
      req.ip
    );
    
    res.status(200).json(agendamentoAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar agendamento', error: err.message });
  }
};

// Confirmar agendamento
exports.confirmarAgendamento = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    if (agendamento.status !== 'Agendado') {
      return res.status(400).json({ message: `Agendamento não pode ser confirmado pois está ${agendamento.status.toLowerCase()}` });
    }
    
    await agendamento.confirmar();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Confirmação',
      'Agendamento',
      agendamento._id,
      {},
      req.ip
    );
    
    res.status(200).json(agendamento);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao confirmar agendamento', error: err.message });
  }
};

// Cancelar agendamento
exports.cancelarAgendamento = async (req, res) => {
  try {
    const { motivo } = req.body;
    
    if (!motivo) {
      return res.status(400).json({ message: 'Motivo do cancelamento é obrigatório' });
    }
    
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    if (agendamento.status === 'Concluído' || agendamento.status === 'Cancelado') {
      return res.status(400).json({ message: `Agendamento não pode ser cancelado pois está ${agendamento.status.toLowerCase()}` });
    }
    
    await agendamento.cancelar();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Cancelamento',
      'Agendamento',
      agendamento._id,
      { motivo },
      req.ip
    );
    
    res.status(200).json(agendamento);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao cancelar agendamento', error: err.message });
  }
};

// Concluir agendamento
exports.concluirAgendamento = async (req, res) => {
  try {
    const agendamento = await Agendamento.findById(req.params.id);
    if (!agendamento) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    if (agendamento.status !== 'Confirmado' && agendamento.status !== 'Agendado') {
      return res.status(400).json({ message: `Agendamento não pode ser concluído pois está ${agendamento.status.toLowerCase()}` });
    }
    
    await agendamento.concluir();
    
    // Registrar log
    await Log.registrar(
      req.usuario ? req.usuario._id : null,
      'Conclusão',
      'Agendamento',
      agendamento._id,
      {},
      req.ip
    );
    
    res.status(200).json(agendamento);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao concluir agendamento', error: err.message });
  }
};

// Obter agendamentos por cliente
exports.getAgendamentosByCliente = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({ cliente_id: req.params.clienteId })
      .populate('veiculo_id', 'placa marca modelo')
      .populate('servico_id', 'nome')
      .sort({ data_hora: -1 });
    
    res.status(200).json(agendamentos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: err.message });
  }
};

// Obter agendamentos por veículo
exports.getAgendamentosByVeiculo = async (req, res) => {
  try {
    const agendamentos = await Agendamento.find({ veiculo_id: req.params.veiculoId })
      .populate('cliente_id', 'nome')
      .populate('servico_id', 'nome')
      .sort({ data_hora: -1 });
    
    res.status(200).json(agendamentos);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error: err.message });
  }
};

// Obter disponibilidade de horários
exports.getDisponibilidade = async (req, res) => {
  try {
    const { data, servico_id } = req.query;
    
    if (!data) {
      return res.status(400).json({ message: 'Data é obrigatória' });
    }
    
    // Verificar se o serviço existe
    let tempoEstimado = 60; // Padrão: 1 hora
    if (servico_id) {
      const servico = await Servico.findById(servico_id);
      if (!servico) {
        return res.status(404).json({ message: 'Serviço não encontrado' });
      }
      tempoEstimado = servico.tempo_estimado;
    }
    
    // Definir horário de funcionamento (8h às 18h)
    const dataBase = new Date(data);
    dataBase.setHours(0, 0, 0, 0);
    
    const horaInicio = new Date(dataBase);
    horaInicio.setHours(8, 0, 0, 0);
    
    const horaFim = new Date(dataBase);
    horaFim.setHours(18, 0, 0, 0);
    
    // Buscar agendamentos do dia
    const agendamentosDia = await Agendamento.find({
      status: { $in: ['Agendado', 'Confirmado'] },
      data_hora: {
        $gte: horaInicio,
        $lt: horaFim
      }
    }).sort({ data_hora: 1 });
    
    // Gerar slots de horários disponíveis (a cada 30 minutos)
    const slots = [];
    const intervaloSlot = 30; // minutos
    
    for (let hora = horaInicio; hora < horaFim; hora.setMinutes(hora.getMinutes() + intervaloSlot)) {
      const slotInicio = new Date(hora);
      const slotFim = new Date(slotInicio);
      slotFim.setMinutes(slotFim.getMinutes() + tempoEstimado);
      
      // Verificar se o slot termina dentro do horário de funcionamento
      if (slotFim > horaFim) {
        continue;
      }
      
      // Verificar conflitos com agendamentos existentes
      const conflito = agendamentosDia.some(agendamento => {
        const agendamentoInicio = new Date(agendamento.data_hora);
        const servicoAgendado = agendamento.servico_id;
        let tempoAgendado = tempoEstimado;
        
        if (servicoAgendado && servicoAgendado.tempo_estimado) {
          tempoAgendado = servicoAgendado.tempo_estimado;
        }
        
        const agendamentoFim = new Date(agendamentoInicio);
        agendamentoFim.setMinutes(agendamentoFim.getMinutes() + tempoAgendado);
        
        // Verificar sobreposição
        return (
          (slotInicio < agendamentoFim && slotFim > agendamentoInicio) ||
          (Math.abs(slotInicio - agendamentoInicio) < 15 * 60000) // 15 minutos de intervalo
        );
      });
      
      if (!conflito) {
        slots.push({
          horario: slotInicio,
          disponivel: true
        });
      }
    }
    
    res.status(200).json({
      data: dataBase,
      servico_id,
      tempo_estimado: tempoEstimado,
      horarios_disponiveis: slots
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao verificar disponibilidade', error: err.message });
  }
};
