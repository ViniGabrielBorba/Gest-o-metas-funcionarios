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

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB conectado com sucesso!');
  console.log(`📦 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('\n❌ ERRO: Não foi possível conectar ao MongoDB!');
  console.error('💡 Possíveis soluções:');
  console.error('   1. Certifique-se de que o MongoDB está instalado e rodando');
  console.error('   2. Ou use MongoDB Atlas (cloud gratuito)');
  console.error('   3. Atualize a variável MONGODB_URI no arquivo .env\n');
  console.error('Detalhes do erro:', err.message);
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
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

