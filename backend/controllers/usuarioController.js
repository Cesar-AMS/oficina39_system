const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Funcionario = require('../models/Funcionario');
const Log = require('../models/Log');

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { username, senha } = req.body;
    
    // Verificar se username e senha foram fornecidos
    if (!username || !senha) {
      return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
    }
    
    // Buscar usuário pelo username
    const usuario = await Usuario.findOne({ username });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Verificar se o usuário está ativo
    if (!usuario.ativo) {
      return res.status(401).json({ message: 'Usuário desativado. Contate o administrador.' });
    }
    
    // Verificar senha
    const senhaCorreta = await usuario.verificarSenha(senha);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario._id, perfil: usuario.perfil },
      process.env.JWT_SECRET || 'oficina39_secret_key',
      { expiresIn: '8h' }
    );
    
    // Registrar acesso
    await usuario.registrarAcesso();
    
    // Registrar log
    await Log.registrar(
      usuario._id,
      'Login',
      'Usuario',
      usuario._id,
      { username: usuario.username },
      req.ip
    );
    
    // Buscar informações do funcionário associado, se existir
    let funcionario = null;
    if (usuario.funcionario_id) {
      funcionario = await Funcionario.findById(usuario.funcionario_id)
        .select('nome cargo departamento');
    }
    
    res.status(200).json({
      token,
      usuario: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        perfil: usuario.perfil,
        permissoes: usuario.permissoes,
        funcionario: funcionario
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro no login', error: err.message });
  }
};

// Registrar novo usuário (apenas para administradores)
exports.register = async (req, res) => {
  try {
    const { username, email, senha, perfil, funcionario_id, permissoes } = req.body;
    
    // Verificar se o usuário atual tem permissão de administrador
    if (req.usuario.perfil !== 'Administrador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem criar usuários.' });
    }
    
    // Verificar se o funcionário existe, se fornecido
    if (funcionario_id) {
      const funcionario = await Funcionario.findById(funcionario_id);
      if (!funcionario) {
        return res.status(404).json({ message: 'Funcionário não encontrado' });
      }
    }
    
    // Criar novo usuário
    const novoUsuario = new Usuario({
      username,
      email,
      senha_hash: senha, // Será hasheado pelo middleware pre-save
      perfil,
      funcionario_id,
      permissoes: permissoes || []
    });
    
    const usuarioSalvo = await novoUsuario.save();
    
    // Se funcionário foi especificado, atualizar referência ao usuário
    if (funcionario_id) {
      await Funcionario.findByIdAndUpdate(
        funcionario_id,
        { usuario_id: usuarioSalvo._id }
      );
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario._id,
      'Criação',
      'Usuario',
      usuarioSalvo._id,
      { username: usuarioSalvo.username, perfil: usuarioSalvo.perfil },
      req.ip
    );
    
    res.status(201).json({
      message: 'Usuário criado com sucesso',
      usuario: {
        id: usuarioSalvo._id,
        username: usuarioSalvo.username,
        email: usuarioSalvo.email,
        perfil: usuarioSalvo.perfil
      }
    });
  } catch (err) {
    res.status(400).json({ message: 'Erro ao criar usuário', error: err.message });
  }
};

// Obter perfil do usuário atual
exports.getProfile = async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario._id)
      .select('-senha_hash -salt');
    
    // Buscar informações do funcionário associado, se existir
    let funcionario = null;
    if (usuario.funcionario_id) {
      funcionario = await Funcionario.findById(usuario.funcionario_id)
        .select('nome cargo departamento');
    }
    
    res.status(200).json({
      usuario: {
        id: usuario._id,
        username: usuario.username,
        email: usuario.email,
        perfil: usuario.perfil,
        permissoes: usuario.permissoes,
        ultimo_acesso: usuario.ultimo_acesso,
        funcionario: funcionario
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar perfil', error: err.message });
  }
};

// Atualizar senha
exports.updatePassword = async (req, res) => {
  try {
    const { senha_atual, nova_senha } = req.body;
    
    // Verificar se as senhas foram fornecidas
    if (!senha_atual || !nova_senha) {
      return res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
    }
    
    // Buscar usuário
    const usuario = await Usuario.findById(req.usuario._id);
    
    // Verificar senha atual
    const senhaCorreta = await usuario.verificarSenha(senha_atual);
    if (!senhaCorreta) {
      return res.status(401).json({ message: 'Senha atual incorreta' });
    }
    
    // Atualizar senha
    usuario.senha_hash = nova_senha; // Será hasheado pelo middleware pre-save
    await usuario.save();
    
    // Registrar log
    await Log.registrar(
      usuario._id,
      'Alteração de Senha',
      'Usuario',
      usuario._id,
      {},
      req.ip
    );
    
    res.status(200).json({ message: 'Senha atualizada com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar senha', error: err.message });
  }
};

// Solicitar redefinição de senha
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }
    
    // Buscar usuário pelo email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      // Por segurança, não informamos se o email existe ou não
      return res.status(200).json({ message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.' });
    }
    
    // Gerar token de reset
    await usuario.gerarTokenResetSenha();
    
    // Aqui seria implementado o envio de email com o token
    // Por simplicidade, apenas retornamos o token na resposta
    
    res.status(200).json({
      message: 'Instruções para redefinição de senha foram enviadas para seu email.',
      // Em produção, não retornaríamos o token diretamente
      token: usuario.token_reset_senha
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao solicitar redefinição de senha', error: err.message });
  }
};

// Redefinir senha com token
exports.resetPassword = async (req, res) => {
  try {
    const { token, nova_senha } = req.body;
    
    if (!token || !nova_senha) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    }
    
    // Buscar usuário pelo token
    const usuario = await Usuario.findOne({
      token_reset_senha: token,
      expiracao_token_reset: { $gt: Date.now() }
    });
    
    if (!usuario) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }
    
    // Redefinir senha
    await usuario.redefinirSenha(nova_senha);
    
    // Registrar log
    await Log.registrar(
      usuario._id,
      'Redefinição de Senha',
      'Usuario',
      usuario._id,
      {},
      req.ip
    );
    
    res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao redefinir senha', error: err.message });
  }
};

// Listar todos os usuários (apenas para administradores)
exports.getAllUsers = async (req, res) => {
  try {
    // Verificar se o usuário atual tem permissão de administrador
    if (req.usuario.perfil !== 'Administrador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem listar usuários.' });
    }
    
    const usuarios = await Usuario.find()
      .select('-senha_hash -salt')
      .populate('funcionario_id', 'nome cargo');
    
    res.status(200).json(usuarios);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar usuários', error: err.message });
  }
};

// Atualizar usuário (apenas para administradores)
exports.updateUser = async (req, res) => {
  try {
    // Verificar se o usuário atual tem permissão de administrador
    if (req.usuario.perfil !== 'Administrador') {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores podem atualizar usuários.' });
    }
    
    const { perfil, permissoes, ativo } = req.body;
    
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { perfil, permissoes, ativo },
      { new: true, runValidators: true }
    ).select('-senha_hash -salt');
    
    if (!usuarioAtualizado) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Registrar log
    await Log.registrar(
      req.usuario._id,
      'Atualização',
      'Usuario',
      usuarioAtualizado._id,
      { perfil, permissoes, ativo },
      req.ip
    );
    
    res.status(200).json(usuarioAtualizado);
  } catch (err) {
    res.status(400).json({ message: 'Erro ao atualizar usuário', error: err.message });
  }
};
