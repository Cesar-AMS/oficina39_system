const express = require('express');
const router = express.Router();
const ordemServicoController = require('../controllers/ordemServicoController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para ordens de serviço
router.get('/', ordemServicoController.getOrdensServico);
router.get('/search', ordemServicoController.searchOrdens);
router.get('/cliente/:clienteId', ordemServicoController.getOrdensByCliente);
router.get('/veiculo/:veiculoId', ordemServicoController.getOrdensByVeiculo);
router.get('/:id', ordemServicoController.getOrdemServicoById);
router.post('/', ordemServicoController.createOrdemServico);
router.put('/:id', ordemServicoController.updateOrdemServico);
router.post('/:id/servicos', ordemServicoController.addServico);
router.post('/:id/produtos', ordemServicoController.addProduto);
router.delete('/:id/servicos/:item_id', ordemServicoController.removeServico);
router.delete('/:id/produtos/:item_id', ordemServicoController.removeProduto);

module.exports = router;
