const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Gerente = require('../models/Gerente');
const router = express.Router();

const { validate, cadastroGerenteSchema, loginSchema, recuperarSenhaSchema, resetSenhaSchema } = require('../utils/validators');
const { authLimiter, passwordResetLimiter } = require('../utils/rateLimiter');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');
const logger = require('../utils/logger');
const auth = require('../middleware/auth');

// Gerar token JWT
const generateToken = (id, tipo = 'gerente') => {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET não está configurado! Não é possível gerar token.');
    throw new Error('JWT_SECRET não está configurado. Configure a variável de ambiente JWT_SECRET.');
  }
  return jwt.sign({ id, tipo }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Cadastro de gerente
router.post('/cadastro', authLimiter, validate(cadastroGerenteSchema), async (req, res) => {
  try {
    const { nome, email, senha, nomeLoja, cnpj, telefone } = req.body;

    // Verificar se email já existe
    const gerenteExistente = await Gerente.findOne({ email: email.toLowerCase().trim() });
    if (gerenteExistente) {
      logger.warn('Tentativa de cadastro com email já existente', { email });
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criar novo gerente
    const gerente = await Gerente.create({
      nome,
      email: email.toLowerCase().trim(),
      senha,
      nomeLoja,
      cnpj: cnpj || undefined,
      telefone: telefone || undefined
    });

    // Gerar token de verificação de email
    const verificationToken = gerente.generateEmailVerificationToken();
    await gerente.save({ validateBeforeSave: false });

    // Enviar email de verificação (não bloqueia o cadastro)
    try {
      await sendVerificationEmail(gerente.email, verificationToken);
      logger.info('Email de verificação enviado', { email: gerente.email });
    } catch (emailError) {
      logger.error('Erro ao enviar email de verificação', { 
        error: emailError.message, 
        email: gerente.email 
      });
      // Não falha o cadastro se o email não for enviado
    }

    const token = generateToken(gerente._id, 'gerente');

    logger.audit('Novo gerente cadastrado', gerente._id, {
      nome: gerente.nome,
      email: gerente.email,
      nomeLoja: gerente.nomeLoja
    });

    res.status(201).json({
      token,
      gerente: {
        id: gerente._id,
        nome: gerente.nome,
        email: gerente.email,
        nomeLoja: gerente.nomeLoja,
        emailVerificado: gerente.emailVerificado
      },
      message: 'Cadastro realizado com sucesso! Verifique seu email para ativar sua conta.'
    });
  } catch (error) {
    logger.error('Erro no cadastro de gerente', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      message: 'Erro ao cadastrar gerente',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Login de gerente
router.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, senha } = req.body;

    console.log('=== TENTATIVA DE LOGIN ===');
    console.log('Email recebido:', email);
    console.log('Senha recebida:', senha ? 'Sim (oculta)' : 'Não');
    console.log('Email normalizado:', email ? email.toLowerCase().trim() : 'N/A');

    // Validar se email e senha foram fornecidos
    if (!email || !senha) {
      logger.warn('Tentativa de login sem email ou senha');
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar gerente (incluindo campos de bloqueio)
    const emailNormalizado = email.toLowerCase().trim();
    console.log('Buscando gerente com email:', emailNormalizado);
    
    const gerente = await Gerente.findOne({ email: emailNormalizado })
      .select('+tentativasLogin +bloqueadoAte');
    
    console.log('Gerente encontrado:', gerente ? 'Sim' : 'Não');
    
    if (!gerente) {
      logger.warn('Tentativa de login com email inexistente', { email: emailNormalizado });
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Verificar se conta está bloqueada
    if (gerente.bloqueadoAte && gerente.bloqueadoAte > Date.now()) {
      const minutosRestantes = Math.ceil((gerente.bloqueadoAte - Date.now()) / 60000);
      logger.warn('Tentativa de login em conta bloqueada', { 
        email, 
        bloqueadoAte: gerente.bloqueadoAte 
      });
      return res.status(403).json({ 
        message: `Conta temporariamente bloqueada. Tente novamente em ${minutosRestantes} minutos.`
      });
    }

    // Verificar senha
    console.log('Verificando senha...');
    const senhaValida = await gerente.comparePassword(senha);
    console.log('Senha válida:', senhaValida);
    
    if (!senhaValida) {
      // Incrementar tentativas de login
      gerente.tentativasLogin = (gerente.tentativasLogin || 0) + 1;
      
      // Bloquear após 5 tentativas por 30 minutos
      if (gerente.tentativasLogin >= 5) {
        gerente.bloqueadoAte = Date.now() + 30 * 60 * 1000; // 30 minutos
        gerente.tentativasLogin = 0;
        await gerente.save();
        logger.warn('Conta bloqueada após múltiplas tentativas de login falhas', { email });
        return res.status(403).json({ 
          message: 'Muitas tentativas de login falhas. Conta bloqueada por 30 minutos.'
        });
      }
      
      await gerente.save();
      logger.warn('Senha incorreta no login', { email, tentativas: gerente.tentativasLogin });
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Resetar tentativas e atualizar último login
    gerente.tentativasLogin = 0;
    gerente.bloqueadoAte = undefined;
    gerente.ultimoLogin = new Date();
    await gerente.save();

    console.log('Gerando token...');
    const token = generateToken(gerente._id, 'gerente');
    console.log('Token gerado com sucesso');

    logger.audit('Login realizado com sucesso', gerente._id, {
      email: gerente.email,
      ultimoLogin: gerente.ultimoLogin
    });

    console.log('Login bem-sucedido para:', gerente.email);
    
    res.json({
      token,
      gerente: {
        id: gerente._id,
        nome: gerente.nome,
        email: gerente.email,
        nomeLoja: gerente.nomeLoja,
        emailVerificado: gerente.emailVerificado
      }
    });
  } catch (error) {
    console.error('=== ERRO NO LOGIN ===');
    console.error('Erro:', error.message);
    console.error('Stack:', error.stack);
    console.error('Detalhes:', {
      name: error.name,
      code: error.code,
      email: req.body?.email
    });
    
    logger.error('Erro no login', { 
      error: error.message, 
      stack: error.stack,
      email: req.body?.email
    });
    
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Recuperar senha - solicitar reset
router.post('/recuperar-senha', passwordResetLimiter, validate(recuperarSenhaSchema), async (req, res) => {
  try {
    const { email } = req.body;

    const gerente = await Gerente.findOne({ email: email.toLowerCase().trim() });
    
    // Sempre retornar sucesso (por segurança, não revelar se email existe)
    if (!gerente) {
      logger.warn('Tentativa de recuperação de senha com email inexistente', { email });
      return res.json({ 
        message: 'Se o email existir, você receberá um link para redefinir sua senha.' 
      });
    }

    // Gerar token de reset
    const resetToken = gerente.generatePasswordResetToken();
    await gerente.save({ validateBeforeSave: false });

    // Enviar email
    try {
      await sendPasswordResetEmail(gerente.email, resetToken);
      logger.info('Email de recuperação de senha enviado', { email: gerente.email });
      logger.audit('Solicitação de recuperação de senha', gerente._id, {
        email: gerente.email
      });
    } catch (emailError) {
      logger.error('Erro ao enviar email de recuperação', { 
        error: emailError.message, 
        email: gerente.email 
      });
      // Limpar token se email não foi enviado
      gerente.resetSenhaToken = undefined;
      gerente.resetSenhaExpira = undefined;
      await gerente.save({ validateBeforeSave: false });
      
      return res.status(500).json({ 
        message: 'Erro ao enviar email. Tente novamente mais tarde.' 
      });
    }

    res.json({ 
      message: 'Se o email existir, você receberá um link para redefinir sua senha.' 
    });
  } catch (error) {
    logger.error('Erro ao processar recuperação de senha', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      message: 'Erro ao processar solicitação',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Reset de senha - redefinir com token
router.post('/reset-senha', validate(resetSenhaSchema), async (req, res) => {
  try {
    const { token, senha } = req.body;

    // Hash do token para comparação
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar gerente com token válido
    const gerente = await Gerente.findOne({
      resetSenhaToken: hashedToken,
      resetSenhaExpira: { $gt: Date.now() }
    }).select('+resetSenhaToken +resetSenhaExpira');

    if (!gerente) {
      logger.warn('Tentativa de reset de senha com token inválido ou expirado');
      return res.status(400).json({ 
        message: 'Token inválido ou expirado. Solicite um novo link de recuperação.' 
      });
    }

    // Atualizar senha
    gerente.senha = senha;
    gerente.resetSenhaToken = undefined;
    gerente.resetSenhaExpira = undefined;
    gerente.tentativasLogin = 0;
    gerente.bloqueadoAte = undefined;
    await gerente.save();

    logger.audit('Senha redefinida com sucesso', gerente._id, {
      email: gerente.email
    });

    res.json({ 
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.' 
    });
  } catch (error) {
    logger.error('Erro ao resetar senha', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      message: 'Erro ao redefinir senha',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Verificar email
router.get('/verificar-email/:token', async (req, res) => {
  try {
    const { token } = req.params;

    // Hash do token para comparação
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Buscar gerente com token válido
    const gerente = await Gerente.findOne({
      emailVerificacaoToken: hashedToken,
      emailVerificacaoExpira: { $gt: Date.now() }
    }).select('+emailVerificacaoToken +emailVerificacaoExpira');

    if (!gerente) {
      logger.warn('Tentativa de verificação de email com token inválido ou expirado');
      return res.status(400).json({ 
        message: 'Token inválido ou expirado.' 
      });
    }

    // Marcar email como verificado
    gerente.emailVerificado = true;
    gerente.emailVerificacaoToken = undefined;
    gerente.emailVerificacaoExpira = undefined;
    await gerente.save();

    logger.audit('Email verificado', gerente._id, {
      email: gerente.email
    });

    res.json({ 
      message: 'Email verificado com sucesso!' 
    });
  } catch (error) {
    logger.error('Erro ao verificar email', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      message: 'Erro ao verificar email',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Reenviar email de verificação
router.post('/reenviar-verificacao', authLimiter, auth, async (req, res) => {
  try {
    const gerente = await Gerente.findById(req.user.id);

    if (!gerente) {
      return res.status(404).json({ message: 'Gerente não encontrado' });
    }

    if (gerente.emailVerificado) {
      return res.status(400).json({ message: 'Email já verificado' });
    }

    // Gerar novo token
    const verificationToken = gerente.generateEmailVerificationToken();
    await gerente.save({ validateBeforeSave: false });

    // Enviar email
    try {
      await sendVerificationEmail(gerente.email, verificationToken);
      logger.info('Email de verificação reenviado', { email: gerente.email });
    } catch (emailError) {
      logger.error('Erro ao reenviar email de verificação', { 
        error: emailError.message, 
        email: gerente.email 
      });
      return res.status(500).json({ 
        message: 'Erro ao enviar email. Tente novamente mais tarde.' 
      });
    }

    res.json({ 
      message: 'Email de verificação reenviado com sucesso!' 
    });
  } catch (error) {
    logger.error('Erro ao reenviar verificação', { 
      error: error.message, 
      stack: error.stack 
    });
    res.status(500).json({ 
      message: 'Erro ao processar solicitação',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Obter dados do gerente autenticado
router.get('/me', auth, async (req, res) => {
  try {
    const gerente = await Gerente.findById(req.user.id).select('-senha');
    if (!gerente) {
      return res.status(404).json({ message: 'Gerente não encontrado' });
    }
    // Retornar dados do gerente junto com o tipo do token
    res.json({
      ...gerente.toObject(),
      tipo: req.user.tipo || 'gerente' // Tipo do token JWT
    });
  } catch (error) {
    logger.error('Erro ao buscar dados do gerente', { 
      error: error.message, 
      userId: req.user.id 
    });
    res.status(500).json({ message: error.message });
  }
});

// Atualizar perfil do gerente
router.put('/perfil', auth, async (req, res) => {
  try {
    const { nome, email, telefone, nomeLoja, cnpj } = req.body;
    
    // Validações básicas
    if (!nome || !nome.trim()) {
      return res.status(400).json({ message: 'Nome é obrigatório' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }
    if (!nomeLoja || !nomeLoja.trim()) {
      return res.status(400).json({ message: 'Nome da loja é obrigatório' });
    }
    
    // Verificar se o email já está em uso por outro gerente
    const emailNormalizado = email.toLowerCase().trim();
    const emailExistente = await Gerente.findOne({ 
      email: emailNormalizado, 
      _id: { $ne: req.user.id } 
    });
    
    if (emailExistente) {
      return res.status(400).json({ message: 'Este email já está em uso por outra conta' });
    }
    
    // Atualizar dados
    const gerente = await Gerente.findByIdAndUpdate(
      req.user.id,
      {
        nome: nome.trim(),
        email: emailNormalizado,
        telefone: telefone ? telefone.trim() : '',
        nomeLoja: nomeLoja.trim(),
        cnpj: cnpj ? cnpj.trim() : ''
      },
      { new: true, runValidators: true }
    ).select('-senha');
    
    if (!gerente) {
      return res.status(404).json({ message: 'Gerente não encontrado' });
    }
    
    logger.audit('Perfil atualizado', req.user.id, {
      nome: gerente.nome,
      email: gerente.email,
      nomeLoja: gerente.nomeLoja
    });
    
    res.json({ 
      message: 'Perfil atualizado com sucesso',
      gerente: {
        ...gerente.toObject(),
        tipo: req.user.tipo || 'gerente'
      }
    });
  } catch (error) {
    logger.error('Erro ao atualizar perfil', { 
      error: error.message, 
      userId: req.user.id 
    });
    res.status(500).json({ message: error.message });
  }
});

// Alterar senha do gerente
router.put('/alterar-senha', auth, async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    
    // Validações
    if (!senhaAtual) {
      return res.status(400).json({ message: 'Senha atual é obrigatória' });
    }
    if (!novaSenha) {
      return res.status(400).json({ message: 'Nova senha é obrigatória' });
    }
    if (novaSenha.length < 8) {
      return res.status(400).json({ message: 'Nova senha deve ter no mínimo 8 caracteres' });
    }
    
    // Buscar gerente com senha
    const gerente = await Gerente.findById(req.user.id);
    if (!gerente) {
      return res.status(404).json({ message: 'Gerente não encontrado' });
    }
    
    // Verificar senha atual
    const senhaCorreta = await gerente.comparePassword(senhaAtual);
    if (!senhaCorreta) {
      logger.warn('Tentativa de alteração de senha com senha incorreta', { userId: req.user.id });
      return res.status(400).json({ message: 'Senha atual incorreta' });
    }
    
    // Atualizar senha
    gerente.senha = novaSenha;
    await gerente.save();
    
    logger.audit('Senha alterada', req.user.id, {
      email: gerente.email
    });
    
    res.json({ message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Erro ao alterar senha', { 
      error: error.message, 
      userId: req.user.id 
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
