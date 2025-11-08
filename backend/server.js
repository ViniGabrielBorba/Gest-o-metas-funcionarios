// Carregar dotenv primeiro
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Tentar carregar módulos opcionais com fallback
let helmet, compression, morgan, logger, apiLimiter;

try {
  helmet = require('helmet');
  compression = require('compression');
  morgan = require('morgan');
  logger = require('./utils/logger');
  apiLimiter = require('./utils/rateLimiter').apiLimiter;
} catch (error) {
  console.error('Erro ao carregar módulos:', error.message);
  // Criar logger básico se falhar
  logger = {
    info: (...args) => console.log('[INFO]', ...args),
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    audit: () => {}
  };
  // Criar rate limiter básico se falhar
  apiLimiter = (req, res, next) => next();
}

// Segurança - Helmet (se disponível)
if (helmet) {
  try {
    app.use(helmet({
      contentSecurityPolicy: false, // Desabilitar CSP para permitir gráficos
      crossOriginEmbedderPolicy: false
    }));
  } catch (error) {
    logger.warn('Helmet não pôde ser configurado:', error.message);
  }
}

// Compressão de respostas (se disponível)
if (compression) {
  try {
    app.use(compression());
  } catch (error) {
    logger.warn('Compression não pôde ser configurado:', error.message);
  }
}

// Logging HTTP (se disponível)
if (morgan) {
  try {
    if (process.env.NODE_ENV === 'production') {
      app.use(morgan('combined', {
        stream: {
          write: (message) => logger.info(message.trim())
        }
      }));
    } else {
      app.use(morgan('dev'));
    }
  } catch (error) {
    logger.warn('Morgan não pôde ser configurado:', error.message);
  }
}

// Middleware CORS - permitir múltiplas origens
const getAllowedOrigins = () => {
  const origins = [];
  
  // Adicionar FRONTEND_URL se configurada
  if (process.env.FRONTEND_URL) {
    const url = process.env.FRONTEND_URL.replace(/\/$/, '');
    origins.push(url);
    // Também adicionar versões com/sem www
    if (!url.includes('www.')) {
      origins.push(url.replace('https://', 'https://www.'));
    }
  }
  
  // Adicionar origens do Vercel (padrão)
  origins.push('https://gest-o-metas-funcionarios-89ed.vercel.app');
  
  // Permitir todas as origens do Vercel (*.vercel.app)
  // Em produção, você pode querer ser mais específico
  if (process.env.NODE_ENV === 'production') {
    // Permitir todas as origens do Vercel
    return origins.length > 0 ? origins : '*';
  }
  
  // Em desenvolvimento, permitir tudo
  return origins.length > 0 ? origins : '*';
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Se não há origem (ex: requisições de mobile, Postman), permitir
    if (!origin) return callback(null, true);
    
    // Se está configurado como '*', permitir tudo
    if (allowedOrigins === '*') {
      logger.info('CORS: Permitindo todas as origens');
      return callback(null, true);
    }
    
    // Normalizar origem removendo barra final
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    // Verificar se a origem normalizada está na lista
    if (Array.isArray(allowedOrigins) && allowedOrigins.includes(normalizedOrigin)) {
      logger.info(`CORS: Permitindo origem: ${normalizedOrigin}`);
      callback(null, true);
    } else if (Array.isArray(allowedOrigins) && normalizedOrigin.includes('.vercel.app')) {
      // Permitir qualquer subdomínio do Vercel
      logger.info(`CORS: Permitindo origem Vercel: ${normalizedOrigin}`);
      callback(null, true);
    } else {
      logger.warn(`CORS: Origem bloqueada: ${normalizedOrigin}`);
      logger.warn(`CORS: Origens permitidas: ${JSON.stringify(allowedOrigins)}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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

// Rotas (com tratamento de erro)
const loadRoute = (path, routeName) => {
  try {
    return require(path);
  } catch (error) {
    logger.error(`Erro ao carregar rota ${routeName}:`, error.message);
    // Retornar router vazio para não quebrar o servidor
    const express = require('express');
    const router = express.Router();
    router.all('*', (req, res) => {
      res.status(500).json({ 
        message: `Rota ${routeName} não está disponível: ${error.message}` 
      });
    });
    return router;
  }
};

app.use('/api/auth', loadRoute('./routes/auth', 'auth'));
app.use('/api/dono', loadRoute('./routes/dono', 'dono'));
app.use('/api/funcionarios', loadRoute('./routes/funcionarios', 'funcionarios'));
app.use('/api/metas', loadRoute('./routes/metas', 'metas'));
app.use('/api/dashboard', loadRoute('./routes/dashboard', 'dashboard'));
app.use('/api/estoque', loadRoute('./routes/estoque', 'estoque'));
app.use('/api/agenda', loadRoute('./routes/agenda', 'agenda'));
app.use('/api/backup', loadRoute('./routes/backup', 'backup'));
app.use('/api/export', loadRoute('./routes/export', 'export'));

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

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack
  });
  // Não encerrar o processo, apenas logar
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', {
    reason: reason?.message || reason,
    stack: reason?.stack
  });
  // Não encerrar o processo, apenas logar
});

// Iniciar servidor apenas se não estiver em modo de teste
if (process.env.NODE_ENV !== 'test') {
  try {
    app.listen(PORT, HOST, () => {
      logger.info(`Servidor rodando em http://${HOST}:${PORT}`, {
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || 'development'
      });
    }).on('error', (error) => {
      logger.error('Erro ao iniciar servidor:', {
        error: error.message,
        port: PORT,
        host: HOST
      });
      // Tentar porta alternativa se a porta padrão estiver ocupada
      if (error.code === 'EADDRINUSE') {
        const altPort = parseInt(PORT) + 1;
        logger.warn(`Porta ${PORT} em uso, tentando ${altPort}...`);
        app.listen(altPort, HOST, () => {
          logger.info(`Servidor rodando em http://${HOST}:${altPort}`, {
            port: altPort,
            host: HOST
          });
        });
      }
    });
  } catch (error) {
    logger.error('Erro fatal ao iniciar servidor:', {
      error: error.message,
      stack: error.stack
    });
    // Não fazer exit(1) - deixar o processo continuar para ver o erro
  }
}

// Exportar app para testes
module.exports = app;

