// Setup para testes
require('dotenv').config({ path: '.env.test' });

// Configurar variáveis de ambiente para testes
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/gestao-metas-test';

