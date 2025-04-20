const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para produtos
router.get('/', produtoController.getProdutos);
router.get('/search', produtoController.searchProdutos);
router.get('/estoque-baixo', produtoController.getProdutosEstoqueBaixo);
router.get('/:id', produtoController.getProdutoById);
router.get('/:id/movimentacoes', produtoController.getHistoricoMovimentacoes);
router.post('/', produtoController.createProduto);
router.put('/:id', produtoController.updateProduto);
router.delete('/:id', produtoController.deleteProduto);
router.post('/:id/estoque', produtoController.updateEstoque);

module.exports = router;
