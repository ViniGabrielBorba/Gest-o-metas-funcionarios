const rateLimit = require('express-rate-limit');

// Rate limiter para autenticação (login/cadastro)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    message: 'Muitas tentativas de acesso. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // não contar requisições bem-sucedidas
  handler: (req, res) => {
    res.status(429).json({
      message: 'Muitas tentativas de acesso. Tente novamente em 15 minutos.',
      retryAfter: '15 minutos'
    });
  }
});

// Rate limiter geral para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requisições por IP
  message: {
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para recuperação de senha
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 tentativas por IP por hora
  message: {
    message: 'Muitas tentativas de recuperação de senha. Tente novamente em 1 hora.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter para criação de recursos (funcionários, metas, etc)
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // máximo 50 criações por IP por hora
  message: {
    message: 'Muitas requisições de criação. Tente novamente em alguns minutos.',
    retryAfter: '1 hora'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authLimiter,
  apiLimiter,
  passwordResetLimiter,
  createLimiter
};

