const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para lançamentos financeiros
router.get('/', financeiroController.getLancamentos);
router.get('/periodo', financeiroController.getLancamentosPorPeriodo);
router.get('/resumo', financeiroController.getResumoFinanceiro);
router.get('/:id', financeiroController.getLancamentoById);
router.post('/', financeiroController.createLancamento);
router.put('/:id', financeiroController.updateLancamento);
router.post('/:id/pagamento', financeiroController.registrarPagamento);
router.post('/:id/cancelar', financeiroController.cancelarLancamento);

module.exports = router;
