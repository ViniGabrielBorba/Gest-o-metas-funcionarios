const express = require('express');
const jwt = require('jsonwebtoken');
const Gerente = require('../models/Gerente');
const router = express.Router();

// Gerar token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key_gestao_metas', {
    expiresIn: '30d'
  });
};

// Cadastro de gerente
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, nomeLoja, cnpj, telefone } = req.body;

    // Verificar se email já existe
    const gerenteExistente = await Gerente.findOne({ email });
    if (gerenteExistente) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criar novo gerente
    const gerente = await Gerente.create({
      nome,
      email,
      senha,
      nomeLoja,
      cnpj,
      telefone
    });

    const token = generateToken(gerente._id);

    res.status(201).json({
      token,
      gerente: {
        id: gerente._id,
        nome: gerente.nome,
        email: gerente.email,
        nomeLoja: gerente.nomeLoja
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login de gerente
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Validar dados de entrada
    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar gerente
    const gerente = await Gerente.findOne({ email: email.toLowerCase().trim() });
    if (!gerente) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Verificar senha
    const senhaValida = await gerente.comparePassword(senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const token = generateToken(gerente._id);

    res.json({
      token,
      gerente: {
        id: gerente._id,
        nome: gerente.nome,
        email: gerente.email,
        nomeLoja: gerente.nomeLoja
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
      details: process.env.NODE_ENV !== 'production' ? {
        name: error.name,
        stack: error.stack
      } : undefined
    });
  }
});

// Obter dados do gerente autenticado
router.get('/me', require('../middleware/auth'), async (req, res) => {
  try {
    const gerente = await Gerente.findById(req.user.id).select('-senha');
    if (!gerente) {
      return res.status(404).json({ message: 'Gerente não encontrado' });
    }
    res.json(gerente);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

