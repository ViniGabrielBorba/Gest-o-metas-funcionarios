const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verificar se JWT_SECRET está configurado (não lançar erro no carregamento do módulo)
// O erro será tratado nas funções que usam JWT_SECRET

const auth = (req, res, next) => {
  try {
    // Verificar se JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET não está configurado! Autenticação não disponível.');
      return res.status(500).json({ 
        message: 'Erro de configuração do servidor. JWT_SECRET não está configurado.' 
      });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Tentativa de acesso sem token', { ip: req.ip, path: req.path });
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Log de auditoria para ações importantes
    if (req.method !== 'GET') {
      logger.audit('Acesso autorizado', decoded.id, {
        method: req.method,
        path: req.path,
        tipo: decoded.tipo
      });
    }
    
    next();
  } catch (error) {
    logger.warn('Token inválido ou expirado', { 
      error: error.message, 
      ip: req.ip, 
      path: req.path 
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado. Faça login novamente.' });
    }
    
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar se é gerente (não dono)
const authGerente = (req, res, next) => {
  try {
    // Verificar se JWT_SECRET está configurado
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET não está configurado! Autenticação não disponível.');
      return res.status(500).json({ 
        message: 'Erro de configuração do servidor. JWT_SECRET não está configurado.' 
      });
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Tentativa de acesso sem token em rota de gerente', { 
        ip: req.ip, 
        path: req.path 
      });
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Se for dono, negar acesso
    if (decoded.tipo === 'dono') {
      logger.warn('Tentativa de acesso de dono em rota de gerente', { 
        userId: decoded.id, 
        path: req.path 
      });
      return res.status(403).json({ message: 'Acesso negado. Use a área do dono.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.warn('Token inválido em rota de gerente', { 
      error: error.message, 
      ip: req.ip, 
      path: req.path 
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado. Faça login novamente.' });
    }
    
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = auth;
module.exports.authGerente = authGerente;







