const express = require('express');
const router = express.Router();
const notaFiscalController = require('../controllers/notaFiscalController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para notas fiscais
router.get('/', notaFiscalController.getNotasFiscais);
router.get('/cliente/:clienteId', notaFiscalController.getNotasFiscaisByCliente);
router.get('/ordem-servico/:ordemServicoId', notaFiscalController.getNotaFiscalByOrdemServico);
router.get('/:id', notaFiscalController.getNotaFiscalById);
router.post('/', notaFiscalController.emitirNotaFiscal);
router.post('/:id/cancelar', notaFiscalController.cancelarNotaFiscal);
router.get('/:id/pdf', notaFiscalController.gerarPDF);

module.exports = router;
