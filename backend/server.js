const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Conectar ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gestao-metas';

// Debug: mostrar se a variável está configurada (sem mostrar senha completa)
console.log('🔍 Verificando configuração MongoDB...');
if (process.env.MONGODB_URI) {
  const uriParts = MONGODB_URI.split('@');
  if (uriParts.length > 1) {
    console.log(`✅ MONGODB_URI encontrada: mongodb+srv://***@${uriParts[1]}`);
  } else {
    console.log(`✅ MONGODB_URI encontrada: ${MONGODB_URI.substring(0, 20)}...`);
  }
} else {
  console.error('❌ MONGODB_URI não encontrada! Usando padrão localhost');
  console.error('💡 Configure a variável MONGODB_URI no Railway:');
  console.error('   Settings → Variables → Add MONGODB_URI');
}

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB conectado com sucesso!');
  console.log(`📦 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('\n❌ ERRO: Não foi possível conectar ao MongoDB!');
  console.error('💡 Possíveis soluções:');
  if (!process.env.MONGODB_URI) {
    console.error('   ⚠️  VARIÁVEL MONGODB_URI NÃO CONFIGURADA!');
    console.error('   1. No Railway: Settings → Variables → Add Variable');
    console.error('   2. Name: MONGODB_URI');
    console.error('   3. Value: mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/gestao-metas');
  } else {
    console.error('   1. Verifique se a string de conexão está correta');
    console.error('   2. Verifique Network Access no MongoDB Atlas (deve permitir 0.0.0.0/0)');
    console.error('   3. Verifique usuário e senha do MongoDB Atlas');
  }
  console.error('\nDetalhes do erro:', err.message);
  process.exit(1);
});

// Middleware de log para debug (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/funcionarios', require('./routes/funcionarios'));
app.use('/api/metas', require('./routes/metas'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Middleware de tratamento de erros global (DEVE vir DEPOIS das rotas)
app.use((err, req, res, next) => {
  console.error('Erro capturado:', err);
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV !== 'production' ? err.message : undefined,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`🌐 Acessível externamente na porta ${PORT}`);
});

