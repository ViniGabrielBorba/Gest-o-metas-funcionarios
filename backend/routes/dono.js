const express = require('express');
const jwt = require('jsonwebtoken');
const Dono = require('../models/Dono');
const Gerente = require('../models/Gerente');
const Funcionario = require('../models/Funcionario');
const Meta = require('../models/Meta');
const AvaliacaoEstoque = require('../models/AvaliacaoEstoque');
const Agenda = require('../models/Agenda');
const MensagemDono = require('../models/MensagemDono');
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

        // Vendas do mês dos funcionários (para ranking e exibição)
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

        // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
        // Não precisamos somar novamente para evitar duplicação
        const totalGeral = meta ? (meta.totalVendido || 0) : 0;
        const totalVendasFuncionarios = vendasFuncionarios.reduce((sum, v) => sum + v.valor, 0);

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
          totalVendidoLoja: totalGeral, // Mantido para compatibilidade
          totalVendasFuncionarios, // Apenas para referência (já incluído em totalGeral)
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
    const meta = await Meta.findOne({ gerenteId: lojaId, mes: mesAtual, ano: anoAtual });
    
    // Vendas diárias da loja
    const vendasDiariasLoja = meta && meta.vendasDiarias ? meta.vendasDiarias
      .filter(v => {
        const vDate = new Date(v.data);
        return vDate.getUTCMonth() + 1 === mesAtual && vDate.getUTCFullYear() === anoAtual;
      })
      .map(v => ({
        data: v.data,
        valor: v.valor,
        observacao: v.observacao
      }))
      .sort((a, b) => new Date(a.data) - new Date(b.data)) : [];

    // Vendas diárias dos funcionários
    const vendasDiariasFuncionarios = [];
    funcionarios.forEach(func => {
      if (func.vendasDiarias) {
        func.vendasDiarias.forEach(v => {
          const vDate = new Date(v.data);
          if (vDate.getUTCMonth() + 1 === mesAtual && vDate.getUTCFullYear() === anoAtual) {
            vendasDiariasFuncionarios.push({
              funcionarioId: func._id,
              funcionarioNome: func.nome,
              data: v.data,
              valor: v.valor,
              observacao: v.observacao
            });
          }
        });
      }
    });
    vendasDiariasFuncionarios.sort((a, b) => new Date(a.data) - new Date(b.data));

    // Avaliações de estoque
    const avaliacoesEstoque = await AvaliacaoEstoque.find({ gerenteId: lojaId })
      .sort({ data: -1 })
      .limit(10);

    // Feedback dos funcionários (observações do gerente)
    const feedbacks = [];
    funcionarios.forEach(func => {
      if (func.observacoesGerente) {
        func.observacoesGerente.forEach(obs => {
          if (obs.mes === mesAtual && obs.ano === anoAtual) {
            feedbacks.push({
              funcionarioId: func._id,
              funcionarioNome: func.nome,
              observacao: obs.observacao,
              dataAtualizacao: obs.dataAtualizacao
            });
          }
        });
      }
    });

    // Histórico de metas (últimos 6 meses)
    const historicoMetas = await Meta.find({ gerenteId: lojaId })
      .sort({ ano: -1, mes: -1 })
      .limit(6);

    res.json({
      gerente: {
        id: gerente._id,
        nome: gerente.nome,
        nomeLoja: gerente.nomeLoja,
        email: gerente.email,
        cnpj: gerente.cnpj,
        telefone: gerente.telefone
      },
      funcionarios: funcionarios.map(f => ({
        id: f._id,
        nome: f.nome,
        funcao: f.funcao,
        metaIndividual: f.metaIndividual,
        vendasMes: f.vendas.find(v => v.mes === mesAtual && v.ano === anoAtual)?.valor || 0
      })),
      meta,
      vendasDiariasLoja,
      vendasDiariasFuncionarios,
      avaliacoesEstoque,
      feedbacks,
      historicoMetas,
      mes: mesAtual,
      ano: anoAtual
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Comparação de períodos
router.get('/dashboard/comparacao', authDono, async (req, res) => {
  try {
    const { mes1, ano1, mes2, ano2 } = req.query;
    if (!mes1 || !ano1 || !mes2 || !ano2) {
      return res.status(400).json({ message: 'Parâmetros de período obrigatórios' });
    }

    const gerentes = await Gerente.find().select('nome nomeLoja');
    
    const comparacao = await Promise.all(
      gerentes.map(async (gerente) => {
        const meta1 = await Meta.findOne({ gerenteId: gerente._id, mes: parseInt(mes1), ano: parseInt(ano1) });
        const meta2 = await Meta.findOne({ gerenteId: gerente._id, mes: parseInt(mes2), ano: parseInt(ano2) });
        
        const funcionarios = await Funcionario.find({ gerenteId: gerente._id });
        
        // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
        // Vendas período 1
        const vendas1 = meta1 ? (meta1.totalVendido || 0) : 0;
        
        // Vendas período 2
        const vendas2 = meta2 ? (meta2.totalVendido || 0) : 0;
        
        const diferenca = vendas2 - vendas1;
        const percentualVariacao = vendas1 > 0 ? ((diferenca / vendas1) * 100) : 0;
        
        return {
          loja: gerente.nomeLoja,
          periodo1: { mes: parseInt(mes1), ano: parseInt(ano1), vendas: vendas1, meta: meta1 ? meta1.valor : 0 },
          periodo2: { mes: parseInt(mes2), ano: parseInt(ano2), vendas: vendas2, meta: meta2 ? meta2.valor : 0 },
          diferenca,
          percentualVariacao
        };
      })
    );

    res.json({ comparacao });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Evolução mensal/trimestral
router.get('/dashboard/evolucao', authDono, async (req, res) => {
  try {
    const { tipo, ano } = req.query; // tipo: 'mensal' ou 'trimestral'
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();
    
    const gerentes = await Gerente.find().select('nome nomeLoja');
    
    const evolucao = await Promise.all(
      gerentes.map(async (gerente) => {
        const dados = [];
        
        if (tipo === 'mensal') {
          for (let mes = 1; mes <= 12; mes++) {
            const meta = await Meta.findOne({ gerenteId: gerente._id, mes, ano: anoAtual });
            // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
            const total = meta ? (meta.totalVendido || 0) : 0;
            
            dados.push({
              periodo: `${mes}/${anoAtual}`,
              mes,
              vendas: total,
              meta: meta ? meta.valor : 0
            });
          }
        } else if (tipo === 'trimestral') {
          for (let trimestre = 1; trimestre <= 4; trimestre++) {
            let totalVendas = 0;
            let totalMeta = 0;
            const meses = [
              (trimestre - 1) * 3 + 1,
              (trimestre - 1) * 3 + 2,
              (trimestre - 1) * 3 + 3
            ];
            
            for (const mes of meses) {
              const meta = await Meta.findOne({ gerenteId: gerente._id, mes, ano: anoAtual });
              // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
              totalVendas += meta ? (meta.totalVendido || 0) : 0;
              totalMeta += meta ? meta.valor : 0;
            }
            
            dados.push({
              periodo: `T${trimestre}/${anoAtual}`,
              trimestre,
              vendas: totalVendas,
              meta: totalMeta
            });
          }
        }
        
        return {
          loja: gerente.nomeLoja,
          dados
        };
      })
    );

    res.json({ evolucao });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Alertas e notificações
router.get('/alertas', authDono, async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    const gerentes = await Gerente.find();
    const alertas = [];

    for (const gerente of gerentes) {
      const meta = await Meta.findOne({ gerenteId: gerente._id, mes: mesAtual, ano: anoAtual });
      // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
      const totalGeral = meta ? (meta.totalVendido || 0) : 0;
      
      // Meta batida
      if (meta && totalGeral >= meta.valor) {
        alertas.push({
          tipo: 'sucesso',
          loja: gerente.nomeLoja,
          mensagem: `Meta batida! ${((totalGeral / meta.valor) * 100).toFixed(1)}% atingido`,
          valor: totalGeral,
          meta: meta.valor
        });
      }
      
      // Meta abaixo (menos de 70%)
      if (meta && meta.valor > 0 && (totalGeral / meta.valor) < 0.7) {
        alertas.push({
          tipo: 'alerta',
          loja: gerente.nomeLoja,
          mensagem: `Meta abaixo do esperado: ${((totalGeral / meta.valor) * 100).toFixed(1)}%`,
          valor: totalGeral,
          meta: meta.valor
        });
      }
      
      // Funcionários sem vendas
      const funcionariosSemVendas = funcionarios.filter(f => {
        const v = f.vendas.find(v => v.mes === mesAtual && v.ano === anoAtual);
        return !v || v.valor === 0;
      });
      
      if (funcionariosSemVendas.length > 0) {
        alertas.push({
          tipo: 'info',
          loja: gerente.nomeLoja,
          mensagem: `${funcionariosSemVendas.length} funcionário(s) sem vendas registradas`,
          funcionarios: funcionariosSemVendas.map(f => f.nome)
        });
      }
    }

    res.json({ alertas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Métricas avançadas
router.get('/metricas', authDono, async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    const gerentes = await Gerente.find();
    
    const metricas = await Promise.all(
      gerentes.map(async (gerente) => {
        const funcionarios = await Funcionario.find({ gerenteId: gerente._id });
        const meta = await Meta.findOne({ gerenteId: gerente._id, mes: mesAtual, ano: anoAtual });
        
        // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
        const totalGeral = meta ? (meta.totalVendido || 0) : 0;
        
        // Contar vendas diárias para calcular ticket médio
        // Ticket médio = valor médio por transação (venda diária registrada)
        let quantidadeVendas = 0;
        let totalVerificacao = 0; // Para validar que a soma bate com totalGeral
        
        // Vendas diretas da loja
        if (meta && meta.vendasDiarias) {
          meta.vendasDiarias.forEach(v => {
            const vDate = new Date(v.data);
            if (vDate.getUTCMonth() + 1 === mesAtual && vDate.getUTCFullYear() === anoAtual) {
              quantidadeVendas++;
              totalVerificacao += parseFloat(v.valor) || 0;
            }
          });
        }
        
        // Vendas dos funcionários
        funcionarios.forEach(f => {
          if (f.vendasDiarias) {
            f.vendasDiarias.forEach(v => {
              const vDate = new Date(v.data);
              if (vDate.getUTCMonth() + 1 === mesAtual && vDate.getUTCFullYear() === anoAtual) {
                quantidadeVendas++;
                totalVerificacao += parseFloat(v.valor) || 0;
              }
            });
          }
        });
        
        // Validar se a soma das vendas diárias bate com o totalGeral (com pequena tolerância para arredondamentos)
        // Se houver diferença significativa, usar a soma verificada
        const diferenca = Math.abs(totalGeral - totalVerificacao);
        const totalParaCalcular = diferenca > 0.01 ? totalVerificacao : totalGeral;
        
        // Ticket médio = total de vendas / quantidade de transações
        // Se não houver vendas, retornar 0
        const ticketMedio = quantidadeVendas > 0 ? totalParaCalcular / quantidadeVendas : 0;
        const vendasPorFuncionario = funcionarios.length > 0 ? totalGeral / funcionarios.length : 0;
        const taxaConversao = meta && meta.valor > 0 ? (totalGeral / meta.valor) * 100 : 0;
        
        return {
          loja: gerente.nomeLoja,
          ticketMedio: Math.round(ticketMedio * 100) / 100, // Arredondar para 2 casas decimais
          quantidadeTransacoes: quantidadeVendas, // Informação para debug
          vendasPorFuncionario: Math.round(vendasPorFuncionario * 100) / 100,
          taxaConversao: Math.round(taxaConversao * 100) / 100,
          totalFuncionarios: funcionarios.length,
          totalVendas: totalGeral,
          meta: meta ? meta.valor : 0
        };
      })
    );

    res.json({ metricas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Agenda de todas as lojas
router.get('/agenda', authDono, async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    const gerentes = await Gerente.find().select('nome nomeLoja');
    
    const startDate = new Date(Date.UTC(anoAtual, mesAtual - 1, 1));
    const endDate = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));

    const eventos = [];
    
    for (const gerente of gerentes) {
      const agenda = await Agenda.findOne({ gerenteId: gerente._id });
      
      if (agenda && agenda.eventos) {
        agenda.eventos.forEach(evento => {
          const eventDate = new Date(evento.data);
          if (eventDate >= startDate && eventDate <= endDate) {
            eventos.push({
              ...evento.toObject(),
              loja: gerente.nomeLoja,
              gerenteNome: gerente.nome
            });
          }
        });
      }
    }

    eventos.sort((a, b) => new Date(a.data) - new Date(b.data));

    res.json({ eventos });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enviar mensagem para gerente
router.post('/mensagens', authDono, async (req, res) => {
  try {
    const { gerenteId, assunto, mensagem } = req.body;

    if (!gerenteId || !assunto || !mensagem) {
      return res.status(400).json({ message: 'Gerente, assunto e mensagem são obrigatórios' });
    }

    const mensagemNova = await MensagemDono.create({
      donoId: req.user.id,
      gerenteId,
      assunto,
      mensagem
    });

    res.status(201).json(mensagemNova);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Listar mensagens enviadas
router.get('/mensagens', authDono, async (req, res) => {
  try {
    const mensagens = await MensagemDono.find({ donoId: req.user.id })
      .populate('gerenteId', 'nome nomeLoja email')
      .sort({ createdAt: -1 });

    res.json(mensagens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Previsão de vendas (projeção)
router.get('/previsao', authDono, async (req, res) => {
  try {
    const { mes, ano } = req.query;
    const mesAtual = mes ? parseInt(mes) : new Date().getMonth() + 1;
    const anoAtual = ano ? parseInt(ano) : new Date().getFullYear();

    const hoje = new Date();
    const diaAtual = hoje.getDate();
    const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
    const diasRestantes = diasNoMes - diaAtual;

    const gerentes = await Gerente.find();
    
    const previsoes = await Promise.all(
      gerentes.map(async (gerente) => {
        const meta = await Meta.findOne({ gerenteId: gerente._id, mes: mesAtual, ano: anoAtual });
        // O meta.totalVendido já inclui vendas diretas da loja + vendas dos funcionários
        const vendasAteHoje = meta ? (meta.totalVendido || 0) : 0;
        
        // Calcular média diária
        const mediaDiaria = diaAtual > 0 ? vendasAteHoje / diaAtual : 0;
        
        // Projeção para o resto do mês
        const projecaoRestoMes = mediaDiaria * diasRestantes;
        const projecaoTotal = vendasAteHoje + projecaoRestoMes;
        
        // Percentual de confiança baseado em dias decorridos
        const percentualConfianca = diaAtual >= 15 ? 85 : diaAtual >= 7 ? 70 : 50;
        
        return {
          loja: gerente.nomeLoja,
          vendasAteHoje,
          mediaDiaria,
          diasRestantes,
          projecaoTotal,
          meta: meta ? meta.valor : 0,
          percentualConfianca,
          previsaoMeta: meta && meta.valor > 0 ? (projecaoTotal / meta.valor) * 100 : 0
        };
      })
    );

    res.json({ previsoes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

