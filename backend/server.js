const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./utils/logger');
const { apiLimiter } = require('./utils/rateLimiter');

const app = express();

// Segurança - Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitar CSP para permitir gráficos
  crossOriginEmbedderPolicy: false
}));

// Compressão de respostas
app.use(compression());

// Logging HTTP
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
} else {
  app.use(morgan('dev'));
}

// Middleware CORS - normalizar URL removendo barra final
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL.replace(/\/$/, '')] // Remove barra final se existir
  : '*';

app.use(cors({
  origin: (origin, callback) => {
    // Se não há origem (ex: requisições de mobile, Postman), permitir
    if (!origin) return callback(null, true);
    
    // Se está configurado como '*', permitir tudo
    if (allowedOrigins === '*') return callback(null, true);
    
    // Normalizar origem removendo barra final
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Verificar se a origem normalizada está na lista
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting geral
app.use('/api', apiLimiter);

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestao-metas';

// Verificar configurações críticas
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET não está configurado! Sistema não funcionará corretamente.');
  logger.error('Configure a variável JWT_SECRET nas variáveis de ambiente.');
  logger.warn('⚠️  ATENÇÃO: JWT_SECRET não configurado. O servidor iniciará, mas autenticação não funcionará.');
  // Não fazer exit(1) para permitir que o servidor inicie e mostre o erro claramente
  // O middleware de auth irá tratar isso adequadamente
}

// Debug: mostrar se a variável está configurada (sem mostrar senha completa)
logger.info('Verificando configuração MongoDB...');
if (process.env.MONGODB_URI) {
  const uriParts = MONGODB_URI.split('@');
  if (uriParts.length > 1) {
    logger.info(`MONGODB_URI encontrada: mongodb+srv://***@${uriParts[1]}`);
  } else {
    logger.info(`MONGODB_URI encontrada: ${MONGODB_URI.substring(0, 20)}...`);
  }
} else {
  logger.warn('MONGODB_URI não encontrada! Usando padrão localhost');
  logger.warn('Configure a variável MONGODB_URI nas variáveis de ambiente');
}

// Conectar ao MongoDB (com retry automático)
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
})
.then(() => {
  logger.info('MongoDB conectado com sucesso!', { database: mongoose.connection.name });
})
.catch(err => {
  logger.error('Erro ao conectar ao MongoDB!', { error: err.message });
  logger.error('Possíveis soluções:', {
    mongodbUri: !process.env.MONGODB_URI ? 'Variável não configurada' : 'Configurada',
    message: 'Verifique Network Access no MongoDB Atlas'
  });
  
  // Não fazer exit(1) - permite que o servidor inicie mesmo sem MongoDB
  // O servidor pode tentar reconectar depois
});

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  
  const statusCode = health.database === 'connected' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/dono', require('./routes/dono'));
app.use('/api/funcionarios', require('./routes/funcionarios'));
app.use('/api/metas', require('./routes/metas'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/estoque', require('./routes/estoque'));
app.use('/api/agenda', require('./routes/agenda'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/export', require('./routes/export'));

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Middleware de tratamento de erros global (DEVE vir DEPOIS das rotas)
app.use((err, req, res, next) => {
  logger.error('Erro capturado no middleware de erro', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Iniciar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, HOST, () => {
    logger.info(`Servidor rodando em http://${HOST}:${PORT}`, {
      port: PORT,
      host: HOST,
      environment: process.env.NODE_ENV || 'development'
    });
  });
}

// Exportar app para testes
module.exports = app;

