const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/login', usuarioController.login);
router.post('/request-reset', usuarioController.requestPasswordReset);
router.post('/reset-password', usuarioController.resetPassword);

// Rotas protegidas
router.use(authMiddleware);
router.get('/profile', usuarioController.getProfile);
router.post('/update-password', usuarioController.updatePassword);
router.get('/', usuarioController.getAllUsers);
router.post('/', usuarioController.register);
router.put('/:id', usuarioController.updateUser);

module.exports = router;
