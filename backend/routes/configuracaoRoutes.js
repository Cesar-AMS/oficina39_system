const express = require('express');
const router = express.Router();
const configuracaoController = require('../controllers/configuracaoController');
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar middleware de autenticação a todas as rotas
router.use(authMiddleware);

// Rotas para configurações
router.get('/', configuracaoController.getConfiguracoes);
router.put('/', configuracaoController.updateConfiguracoes);
router.post('/backup', configuracaoController.fazerBackup);
router.get('/estatisticas', configuracaoController.getEstatisticas);

module.exports = router;
