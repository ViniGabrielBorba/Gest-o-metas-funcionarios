const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Gerente = require('../models/Gerente');

describe('Auth Routes', () => {
  beforeAll(async () => {
    // Conectar ao banco de testes
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/gestao-metas-test');
    }
  });

  afterAll(async () => {
    // Limpar banco de testes
    await Gerente.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/cadastro', () => {
    it('deve cadastrar um novo gerente com dados válidos', async () => {
      const response = await request(app)
        .post('/api/auth/cadastro')
        .send({
          nome: 'Teste Gerente',
          email: 'teste@example.com',
          senha: 'Senha123!@#',
          nomeLoja: 'Loja Teste',
          cnpj: '12345678000190',
          telefone: '11999999999'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.gerente).toHaveProperty('nome', 'Teste Gerente');
      expect(response.body.gerente).toHaveProperty('email', 'teste@example.com');
    });

    it('não deve cadastrar com email duplicado', async () => {
      await request(app)
        .post('/api/auth/cadastro')
        .send({
          nome: 'Teste Gerente 2',
          email: 'teste2@example.com',
          senha: 'Senha123!@#',
          nomeLoja: 'Loja Teste 2'
        });

      const response = await request(app)
        .post('/api/auth/cadastro')
        .send({
          nome: 'Teste Gerente 3',
          email: 'teste2@example.com',
          senha: 'Senha123!@#',
          nomeLoja: 'Loja Teste 3'
        });

      expect(response.status).toBe(400);
    });

    it('não deve cadastrar com senha fraca', async () => {
      const response = await request(app)
        .post('/api/auth/cadastro')
        .send({
          nome: 'Teste Gerente',
          email: 'teste3@example.com',
          senha: '123',
          nomeLoja: 'Loja Teste'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('deve fazer login com credenciais válidas', async () => {
      // Criar gerente primeiro
      await request(app)
        .post('/api/auth/cadastro')
        .send({
          nome: 'Teste Login',
          email: 'login@example.com',
          senha: 'Senha123!@#',
          nomeLoja: 'Loja Login'
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          senha: 'Senha123!@#'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.gerente).toHaveProperty('email', 'login@example.com');
    });

    it('não deve fazer login com credenciais inválidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          senha: 'SenhaErrada123!@#'
        });

      expect(response.status).toBe(401);
    });
  });
});

