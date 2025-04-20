const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Middleware de autenticação
const authMiddleware = async (req, res, next) => {
  try {
    // Verificar se o token está presente no cabeçalho
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Acesso não autorizado. Token não fornecido.' });
    }

    // Extrair o token
    const token = authHeader.split(' ')[1];
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oficina39_secret_key');
    
    // Buscar o usuário pelo ID
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }
    
    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({ message: 'Usuário desativado. Acesso negado.' });
    }
    
    // Adicionar o usuário à requisição
    req.usuario = usuario;
    
    // Registrar acesso
    await usuario.registrarAcesso();
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    
    res.status(500).json({ message: 'Erro na autenticação.', error: error.message });
  }
};

module.exports = authMiddleware;
