const express = require('express');
const jwt = require('jsonwebtoken');
const Dono = require('../models/Dono');
const Gerente = require('../models/Gerente');
const Funcionario = require('../models/Funcionario');
const Meta = require('../models/Meta');
const router = express.Router();

// Gerar token JWT
const generateToken = (id, tipo = 'gerente') => {
  return jwt.sign({ id, tipo }, process.env.JWT_SECRET || 'secret_key_gestao_metas', {
    expiresIn: '30d'
  });
};

// Middleware de autenticação para dono
const authDono = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_gestao_metas');
    
    // Verificar se é dono
    if (decoded.tipo !== 'dono') {
      return res.status(403).json({ message: 'Acesso negado. Apenas donos podem acessar.' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Cadastro de dono
router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Verificar se email já existe
    const donoExistente = await Dono.findOne({ email });
    if (donoExistente) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criar novo dono
    const dono = await Dono.create({
      nome,
      email,
      senha,
      tipo: 'dono'
    });

    const token = generateToken(dono._id, 'dono');

    res.status(201).json({
      token,
      dono: {
        id: dono._id,
        nome: dono.nome,
        email: dono.email,
        tipo: 'dono'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login de dono
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const dono = await Dono.findOne({ email: email.toLowerCase().trim() });
    if (!dono) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const senhaValida = await dono.comparePassword(senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const token = generateToken(dono._id, 'dono');

    res.json({
      token,
      dono: {
        id: dono._id,
        nome: dono.nome,
        email: dono.email,
        tipo: 'dono'
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter dados do dono autenticado
router.get('/me', authDono, async (req, res) => {
  try {
    const dono = await Dono.findById(req.user.id).select('-senha');
    if (!dono) {
      return res.status(404).json({ message: 'Dono não encontrado' });
    }
    res.json(dono);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard do dono - dados agregados de todas as lojas
router.get('/dashboard', authDono, async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    // Buscar todos os gerentes (lojas)
    const gerentes = await Gerente.find().select('nome nomeLoja email');

    // Agregar dados de todas as lojas
    const dadosLojas = await Promise.all(
      gerentes.map(async (gerente) => {
        // Funcionários da loja
        const funcionarios = await Funcionario.find({ gerenteId: gerente._id });
        
        // Meta do mês
        const meta = await Meta.findOne({
          gerenteId: gerente._id,
          mes: mesAtual,
          ano: anoAtual
        });

        // Vendas do mês dos funcionários
        const vendasFuncionarios = funcionarios.map(func => {
          const venda = func.vendas.find(
            v => v.mes === mesAtual && v.ano === anoAtual
          );
          return {
            funcionarioId: func._id,
            nome: func.nome,
            valor: venda ? venda.valor : 0,
            metaIndividual: func.metaIndividual
          };
        });

        const totalVendasFuncionarios = vendasFuncionarios.reduce((sum, v) => sum + v.valor, 0);
        const totalVendidoLoja = meta ? (meta.totalVendido || 0) : 0;
        const totalGeral = totalVendasFuncionarios + totalVendidoLoja;

        // Top vendedores
        const topVendedores = [...vendasFuncionarios]
          .sort((a, b) => b.valor - a.valor)
          .filter(v => v.valor > 0)
          .slice(0, 5);

        return {
          gerenteId: gerente._id,
          nomeLoja: gerente.nomeLoja,
          nomeGerente: gerente.nome,
          emailGerente: gerente.email,
          totalFuncionarios: funcionarios.length,
          metaMes: meta ? meta.valor : 0,
          totalVendidoLoja,
          totalVendasFuncionarios,
          totalGeral,
          metaBatida: meta ? totalGeral >= meta.valor : false,
          percentualAtingido: meta && meta.valor > 0 
            ? (totalGeral / meta.valor) * 100 
            : 0,
          topVendedores,
          funcionarios: funcionarios.map(f => ({
            id: f._id,
            nome: f.nome,
            funcao: f.funcao,
            metaIndividual: f.metaIndividual,
            vendasMes: vendasFuncionarios.find(v => v.funcionarioId === f._id.toString())?.valor || 0
          }))
        };
      })
    );

    // Totais gerais
    const totalGeralLojas = dadosLojas.reduce((sum, loja) => sum + loja.totalGeral, 0);
    const totalMetaGeral = dadosLojas.reduce((sum, loja) => sum + loja.metaMes, 0);
    const totalFuncionariosGeral = dadosLojas.reduce((sum, loja) => sum + loja.totalFuncionarios, 0);
    const lojasComMetaBatida = dadosLojas.filter(l => l.metaBatida).length;

    // Top vendedores geral (todas as lojas)
    const todosVendedores = dadosLojas.flatMap(loja => 
      loja.topVendedores.map(v => ({
        ...v,
        loja: loja.nomeLoja
      }))
    ).sort((a, b) => b.valor - a.valor).slice(0, 10);

    res.json({
      resumo: {
        totalLojas: gerentes.length,
        totalFuncionarios: totalFuncionariosGeral,
        totalMetaGeral,
        totalVendidoGeral: totalGeralLojas,
        lojasComMetaBatida,
        percentualGeral: totalMetaGeral > 0 
          ? (totalGeralLojas / totalMetaGeral) * 100 
          : 0
      },
      lojas: dadosLojas,
      topVendedoresGeral: todosVendedores
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listar todas as lojas
router.get('/lojas', authDono, async (req, res) => {
  try {
    const gerentes = await Gerente.find().select('nome nomeLoja email cnpj telefone createdAt');
    res.json(gerentes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter dados detalhados de uma loja específica
router.get('/lojas/:lojaId', authDono, async (req, res) => {
  try {
    const { lojaId } = req.params;
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    const gerente = await Gerente.findById(lojaId);
    if (!gerente) {
      return res.status(404).json({ message: 'Loja não encontrada' });
    }

    const funcionarios = await Funcionario.find({ gerenteId: lojaId });
    const metas = await Meta.find({ gerenteId: lojaId, mes: mesAtual, ano: anoAtual });
    const meta = metas[0] || null;

    res.json({
      gerente: {
        id: gerente._id,
        nome: gerente.nome,
        nomeLoja: gerente.nomeLoja,
        email: gerente.email,
        cnpj: gerente.cnpj,
        telefone: gerente.telefone
      },
      funcionarios,
      meta,
      mes: mesAtual,
      ano: anoAtual
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

