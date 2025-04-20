const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para veículos
router.get('/', veiculoController.getVeiculos);
router.get('/search', veiculoController.searchVeiculoByPlaca);
router.get('/cliente/:clienteId', veiculoController.getVeiculosByCliente);
router.get('/:id', veiculoController.getVeiculoById);
router.post('/', veiculoController.createVeiculo);
router.put('/:id', veiculoController.updateVeiculo);
router.delete('/:id', veiculoController.deleteVeiculo);
router.post('/:id/manutencao', veiculoController.addManutencao);

module.exports = router;
