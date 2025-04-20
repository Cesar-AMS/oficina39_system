const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para agendamentos
router.get('/', agendamentoController.getAgendamentos);
router.get('/disponibilidade', agendamentoController.getDisponibilidade);
router.get('/cliente/:clienteId', agendamentoController.getAgendamentosByCliente);
router.get('/veiculo/:veiculoId', agendamentoController.getAgendamentosByVeiculo);
router.get('/:id', agendamentoController.getAgendamentoById);
router.post('/', agendamentoController.createAgendamento);
router.put('/:id', agendamentoController.updateAgendamento);
router.post('/:id/confirmar', agendamentoController.confirmarAgendamento);
router.post('/:id/cancelar', agendamentoController.cancelarAgendamento);
router.post('/:id/concluir', agendamentoController.concluirAgendamento);

module.exports = router;
