const winston = require('winston');
const path = require('path');

// Criar diretório de logs se não existir
const fs = require('fs');
const logDir = path.join(__dirname, '../logs');

try {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
} catch (error) {
  // Se não conseguir criar o diretório, continuar sem logs em arquivo
  console.warn('Aviso: Não foi possível criar diretório de logs:', error.message);
}

// Formato de log personalizado
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para console (mais legível)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Criar logger
const loggerTransports = [];

// Adicionar transporte de arquivo apenas se o diretório existir
try {
  if (fs.existsSync(logDir)) {
    loggerTransports.push(
      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5
      }),
      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880, // 5MB
        maxFiles: 5
      })
    );
  }
} catch (error) {
  // Continuar sem logs em arquivo se houver erro
  console.warn('Aviso: Logs em arquivo desabilitados:', error.message);
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'gestao-metas-api' },
  transports: loggerTransports.length > 0 ? loggerTransports : [
    // Fallback: apenas console se não conseguir criar arquivos
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  exceptionHandlers: loggerTransports.length > 0 ? [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ] : [
    new winston.transports.Console({
      format: consoleFormat
    })
  ],
  rejectionHandlers: loggerTransports.length > 0 ? [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ] : [
    new winston.transports.Console({
      format: consoleFormat
    })
  ]
});

// Se não estiver em produção, também logar no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
} else {
  // Em produção, também logar no console mas sem cores
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }));
}

// Helper para logar requisições HTTP
logger.http = (req, res, responseTime) => {
  const message = `${req.method} ${req.originalUrl} ${res.statusCode}`;
  const metadata = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  };
  
  if (res.statusCode >= 500) {
    logger.error(message, metadata);
  } else if (res.statusCode >= 400) {
    logger.warn(message, metadata);
  } else {
    logger.info(message, metadata);
  }
};

// Helper para logar ações de auditoria
logger.audit = (action, userId, details = {}) => {
  logger.info('Audit Log', {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

module.exports = logger;

