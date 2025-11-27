const express = require('express');
const jwt = require('jsonwebtoken');
const Dono = require('../models/Dono');
const Gerente = require('../models/Gerente');
const Funcionario = require('../models/Funcionario');
const Meta = require('../models/Meta');
const VendaComercial = require('../models/VendaComercial');
const AvaliacaoEstoque = require('../models/AvaliacaoEstoque');
const Agenda = require('../models/Agenda');
const MensagemDono = require('../models/MensagemDono');
const router = express.Router();

const logger = require('../utils/logger');

// Gerar token JWT
const generateToken = (id, tipo = 'gerente') => {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET não está configurado! Não é possível gerar token.');
    throw new Error('JWT_SECRET não está configurado. Configure a variável de ambiente JWT_SECRET.');
  }
  return jwt.sign({ id, tipo }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Middleware de autenticação para dono
const authDono = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    logger.info(`[authDono] Requisição para: ${req.method} ${req.path}`);
    logger.info(`[authDono] Authorization header: ${authHeader ? 'Presente' : 'Ausente'}`);
    
    if (!token) {
      logger.warn('[authDono] Token não fornecido');
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET não está configurado! Autenticação não disponível.');
      return res.status(500).json({ 
        message: 'Erro de configuração do servidor. JWT_SECRET não está configurado.' 
      });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info(`[authDono] Token decodificado: tipo=${decoded.tipo}, id=${decoded.id}`);
    } catch (jwtError) {
      logger.error(`[authDono] Erro ao verificar token:`, jwtError.message);
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
    
    // Verificar se é dono
    if (decoded.tipo !== 'dono') {
      logger.warn(`[authDono] Acesso negado: tipo do token é '${decoded.tipo}', esperado 'dono'`);
      return res.status(403).json({ 
        message: `Acesso negado. Token do tipo '${decoded.tipo}', mas apenas donos podem acessar esta rota.` 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('[authDono] Erro inesperado:', error);
    res.status(401).json({ message: 'Erro de autenticação: ' + error.message });
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

    logger.info(`[Login Dono] Tentativa de login: ${email}`);

    if (!email || !senha) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const dono = await Dono.findOne({ email: emailNormalizado });
    
    if (!dono) {
      logger.warn(`[Login Dono] Dono não encontrado: ${emailNormalizado}`);
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    const senhaValida = await dono.comparePassword(senha);
    if (!senhaValida) {
      logger.warn(`[Login Dono] Senha inválida para: ${emailNormalizado}`);
      return res.status(401).json({ message: 'Email ou senha incorretos' });
    }

    // Gerar token com tipo 'dono' explicitamente
    const token = generateToken(dono._id.toString(), 'dono');
    
    // Verificar se o token foi gerado corretamente (para debug)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info(`[Login Dono] Token gerado com sucesso. Tipo: ${decoded.tipo}, ID: ${decoded.id}`);
    } catch (verifyError) {
      logger.error('[Login Dono] Erro ao verificar token gerado:', verifyError);
    }
    
    logger.info(`[Login Dono] Login bem-sucedido para: ${emailNormalizado}`);

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
    logger.error('[Login Dono] Erro ao fazer login:', error);
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

// Recuperar senha do dono - solicitar email
router.post('/recuperar-senha', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }
    
    const emailNormalizado = email.toLowerCase().trim();
    const dono = await Dono.findOne({ email: emailNormalizado });
    
    if (!dono) {
      // Por segurança, não informamos se o email existe ou não
      return res.json({ message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' });
    }
    
    // Gerar token de reset
    const resetToken = dono.generatePasswordResetToken();
    await dono.save({ validateBeforeSave: false });
    
    // Enviar email
    const { sendPasswordResetEmail } = require('../utils/email');
    const frontendUrl = process.env.FRONTEND_URL || 'https://gest-o-metas-funcionarios-89ed.vercel.app';
    const resetUrl = `${frontendUrl}/recuperar-senha?token=${resetToken}&tipo=dono`;
    
    try {
      await sendPasswordResetEmail(dono.email, resetToken, resetUrl);
      logger.info('Email de recuperação enviado para dono', { email: dono.email });
    } catch (emailError) {
      logger.error('Erro ao enviar email de recuperação para dono', { error: emailError.message });
      // Limpar token se o email falhar
      dono.resetSenhaToken = undefined;
      dono.resetSenhaExpira = undefined;
      await dono.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Erro ao enviar email. Tente novamente.' });
    }
    
    res.json({ message: 'Se o email estiver cadastrado, você receberá um link de recuperação.' });
  } catch (error) {
    logger.error('Erro ao solicitar recuperação de senha do dono', { error: error.message });
    res.status(500).json({ message: error.message });
  }
});

// Redefinir senha do dono
router.post('/reset-senha', async (req, res) => {
  try {
    const { token, senha } = req.body;
    
    if (!token || !senha) {
      return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
    }
    
    if (senha.length < 8) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 8 caracteres' });
    }
    
    // Hash do token para comparar com o banco
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    // Buscar dono com token válido e não expirado
    const dono = await Dono.findOne({
      resetSenhaToken: hashedToken,
      resetSenhaExpira: { $gt: Date.now() }
    }).select('+resetSenhaToken +resetSenhaExpira');
    
    if (!dono) {
      return res.status(400).json({ message: 'Token inválido ou expirado. Solicite um novo link.' });
    }
    
    // Atualizar senha e limpar token
    dono.senha = senha;
    dono.resetSenhaToken = undefined;
    dono.resetSenhaExpira = undefined;
    await dono.save();
    
    logger.audit('Senha do dono redefinida', dono._id, { email: dono.email });
    
    res.json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    logger.error('Erro ao redefinir senha do dono', { error: error.message });
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
          const venda = (func.vendas || []).find(
            v => v && v.mes === mesAtual && v.ano === anoAtual
          );
          // Montar nome completo (nome + sobrenome)
          const nomeCompleto = func.sobrenome && func.sobrenome.trim() !== ''
            ? `${func.nome || ''} ${func.sobrenome}`
            : (func.nome || '');
          return {
            funcionarioId: func._id,
            nome: func.nome || '',
            sobrenome: func.sobrenome || '',
            nomeCompleto: nomeCompleto,
            valor: (venda && venda.valor) ? Number(venda.valor) : 0,
            metaIndividual: (func.metaIndividual) ? Number(func.metaIndividual) : 0
          };
        });

        // Calcular vendas comerciais do mês
        const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
        const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
        
        const vendasComerciais = await VendaComercial.find({
          gerenteId: gerente._id,
          data: {
            $gte: inicioMes,
            $lte: fimMes
          }
        });
        
        const totalVendasComerciais = vendasComerciais.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
        
        // Total de vendas dos funcionários
        const totalVendasFuncionarios = vendasFuncionarios.reduce((sum, v) => sum + v.valor, 0);
        
        // Total geral = vendas dos funcionários + vendas comerciais
        // O meta.totalVendido inclui apenas vendas dos funcionários agora
        const totalGeral = totalVendasFuncionarios + totalVendasComerciais;

        // Calcular percentual esperado baseado no tempo decorrido do mês
        const hoje = new Date();
        const mesAtualSistema = hoje.getMonth() + 1;
        const anoAtualSistema = hoje.getFullYear();
        const isMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
        
        // Calcular dias decorridos
        // Se for o mês atual, usar o dia atual
        // Se for mês futuro, usar 0 (ainda não começou)
        // Se for mês passado, usar o último dia do mês (mês completo)
        const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate(); // Último dia do mês
        let diasDecorridos = 0;
        
        if (isMesAtual) {
          // Mês atual: usar dia atual
          diasDecorridos = hoje.getDate();
        } else if (anoAtual > anoAtualSistema || (anoAtual === anoAtualSistema && mesAtual > mesAtualSistema)) {
          // Mês futuro: ainda não começou
          diasDecorridos = 0;
        } else {
          // Mês passado: usar todos os dias do mês
          diasDecorridos = diasNoMes;
        }
        
        const percentualEsperado = (diasDecorridos / diasNoMes) * 100;
        
        // Percentual atingido
        const percentualAtingido = meta && meta.valor > 0 
          ? (totalGeral / meta.valor) * 100 
          : 0;
        
        // Calcular status da meta considerando o tempo decorrido
        // Se for o mês atual, considerar o percentual esperado
        // Se for mês passado, considerar apenas o percentual total
        
        let statusMeta = 'abaixo'; // 'batida', 'no_prazo', 'no_ritmo', 'abaixo'
        let metaBatida = false;
        
        if (meta && meta.valor > 0) {
          metaBatida = totalGeral >= meta.valor;
          
          if (metaBatida) {
            statusMeta = 'batida';
          } else if (isMesAtual) {
            // Para mês atual, considerar o percentual esperado
            const diferencaPercentual = percentualAtingido - percentualEsperado;
            
            if (diferencaPercentual >= 5) {
              // Está acima do esperado (mais de 5% acima)
              statusMeta = 'no_prazo';
            } else if (diferencaPercentual >= -10) {
              // Está no ritmo esperado (entre -10% e +5%) - situação normal, na média
              statusMeta = 'no_ritmo';
            } else {
              // Está significativamente abaixo do esperado (mais de 10% abaixo)
              statusMeta = 'abaixo';
            }
          } else {
            // Para meses passados, usar classificação simples
            if (percentualAtingido >= 100) {
              statusMeta = 'batida';
            } else if (percentualAtingido >= 70) {
              statusMeta = 'no_prazo';
            } else if (percentualAtingido >= 50) {
              statusMeta = 'no_ritmo';
            } else {
              statusMeta = 'abaixo';
            }
          }
        }

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
          totalVendasFuncionarios, // Vendas dos funcionários
          totalVendasComerciais, // Vendas comerciais
          totalGeral, // Total geral (funcionários + comerciais)
          metaBatida, // Meta batida (100% ou mais)
          statusMeta, // Status detalhado considerando tempo
          percentualAtingido, // Percentual total atingido
          percentualEsperado: isMesAtual ? percentualEsperado : null, // Percentual esperado (apenas mês atual)
          diasDecorridos: isMesAtual ? diasDecorridos : null, // Dias decorridos (apenas mês atual)
          diasNoMes: isMesAtual ? diasNoMes : null, // Total de dias no mês (apenas mês atual)
          topVendedores,
          funcionarios: funcionarios.map(f => ({
            id: f._id,
            nome: f.nome,
            funcao: f.funcao,
            metaIndividual: f.metaIndividual,
            vendasMes: vendasFuncionarios.find(v => v.funcionarioId === f._id.toString())?.valor || 0
          })),
          // Agrupar funcionários por função
          funcionariosPorFuncao: (() => {
            // Função helper para normalizar função (Vendedor e Vendedora são a mesma função)
            const normalizarFuncao = (funcao) => {
              if (!funcao || typeof funcao !== 'string') return 'Sem função';
              // Normalizar Vendedor e Vendedora para "Vendedor"
              if (funcao === 'Vendedora') return 'Vendedor';
              return funcao;
            };

            const agrupados = {};
            funcionarios.forEach(func => {
              try {
                const nomeCompleto = func.sobrenome && func.sobrenome.trim() !== ''
                  ? `${func.nome || ''} ${func.sobrenome}`
                  : (func.nome || '');
                
                const funcaoOriginal = (func.funcao && typeof func.funcao === 'string') ? func.funcao : 'Sem função';
                const funcaoNormalizada = normalizarFuncao(funcaoOriginal);
                
                if (!agrupados[funcaoNormalizada]) {
                  agrupados[funcaoNormalizada] = [];
                }
                
                agrupados[funcaoNormalizada].push({
                  id: func._id,
                  nome: func.nome || '',
                  sobrenome: func.sobrenome || '',
                  nomeCompleto: nomeCompleto,
                  funcao: funcaoOriginal, // Manter função original para exibição individual se necessário
                  telefone: func.telefone || '',
                  email: func.email || '',
                  cpf: func.cpf || '',
                  dataNascimento: func.dataNascimento || null,
                  dataAniversario: func.dataAniversario || null,
                  sexo: func.sexo || '',
                  metaIndividual: func.metaIndividual || 0,
                  chavePix: func.chavePix || ''
                });
              } catch (err) {
                console.error('Erro ao processar funcionário para agrupamento:', func._id, err);
              }
            });
            return agrupados;
          })()
        };
      })
    );

    // Totais gerais
    const totalGeralLojas = dadosLojas.reduce((sum, loja) => sum + loja.totalGeral, 0);
    const totalVendasFuncionariosGeral = dadosLojas.reduce((sum, loja) => sum + loja.totalVendasFuncionarios, 0);
    const totalVendasComerciaisGeral = dadosLojas.reduce((sum, loja) => sum + loja.totalVendasComerciais, 0);
    const totalMetaGeral = dadosLojas.reduce((sum, loja) => sum + loja.metaMes, 0);
    const totalFuncionariosGeral = dadosLojas.reduce((sum, loja) => sum + loja.totalFuncionarios, 0);
    const lojasComMetaBatida = dadosLojas.filter(l => l.metaBatida).length;

    // Top vendedores geral (todas as lojas)
    const todosVendedores = dadosLojas.flatMap(loja => 
      loja.topVendedores.map(v => ({
        funcionarioId: v.funcionarioId,
        nome: v.nome,
        sobrenome: v.sobrenome || '',
        nomeCompleto: v.nomeCompleto || v.nome, // Garantir que nomeCompleto esteja presente
        valor: v.valor,
        metaIndividual: v.metaIndividual,
        loja: loja.nomeLoja
      }))
    ).sort((a, b) => b.valor - a.valor).slice(0, 10);

    res.json({
      resumo: {
        totalLojas: gerentes.length,
        totalFuncionarios: totalFuncionariosGeral,
        totalMetaGeral,
        totalVendidoGeral: totalGeralLojas,
        totalVendasFuncionarios: totalVendasFuncionariosGeral,
        totalVendasComerciais: totalVendasComerciaisGeral,
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
    
    // Calcular vendas comerciais do mês
    const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
    const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
    
    const vendasComerciais = await VendaComercial.find({
      gerenteId: lojaId,
      data: {
        $gte: inicioMes,
        $lte: fimMes
      }
    }).sort({ data: 1 });
    
    const totalVendasComerciais = vendasComerciais.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
    
    // Vendas dos funcionários
    const vendasFuncionarios = funcionarios.map(func => {
      const venda = (func.vendas || []).find(
        v => v && v.mes === mesAtual && v.ano === anoAtual
      );
      return (venda && venda.valor) ? Number(venda.valor) : 0;
    });
    const totalVendasFuncionarios = vendasFuncionarios.reduce((sum, v) => sum + (Number(v) || 0), 0);
    
    // Total geral = vendas funcionários + vendas comerciais
    const totalGeral = totalVendasFuncionarios + totalVendasComerciais;
    
    // Vendas diárias comerciais
    const vendasDiariasComerciais = vendasComerciais.map(v => ({
      data: v.data,
      valor: parseFloat(v.valor) || 0,
      observacao: v.observacao || '',
      tipo: 'comercial'
    }));
    
    // Vendas diárias da loja (legado - mantido para compatibilidade)
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
            // Montar nome completo (nome + sobrenome)
            const nomeCompleto = func.sobrenome && func.sobrenome.trim() !== ''
              ? `${func.nome} ${func.sobrenome}`
              : func.nome;
            vendasDiariasFuncionarios.push({
              funcionarioId: func._id,
              funcionarioNome: func.nome,
              funcionarioNomeCompleto: nomeCompleto,
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
            // Montar nome completo (nome + sobrenome)
            const nomeCompleto = func.sobrenome && func.sobrenome.trim() !== ''
              ? `${func.nome} ${func.sobrenome}`
              : func.nome;
            feedbacks.push({
              funcionarioId: func._id,
              funcionarioNome: func.nome,
              funcionarioNomeCompleto: nomeCompleto,
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
      funcionarios: funcionarios.map(f => {
        // Montar nome completo (nome + sobrenome)
        const nomeCompleto = f.sobrenome && f.sobrenome.trim() !== ''
          ? `${f.nome} ${f.sobrenome}`
          : f.nome;
        return {
          id: f._id,
          nome: f.nome,
          sobrenome: f.sobrenome || '',
          nomeCompleto: nomeCompleto,
          funcao: f.funcao,
          metaIndividual: f.metaIndividual,
          vendasMes: f.vendas.find(v => v.mes === mesAtual && v.ano === anoAtual)?.valor || 0
        };
      }),
      meta,
      totalVendasFuncionarios,
      totalVendasComerciais,
      totalGeral,
      vendasDiariasLoja,
      vendasDiariasComerciais,
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
        
        // Calcular vendas comerciais para cada período
        const inicioMes1 = new Date(Date.UTC(parseInt(ano1), parseInt(mes1) - 1, 1, 0, 0, 0, 0));
        const fimMes1 = new Date(Date.UTC(parseInt(ano1), parseInt(mes1), 0, 23, 59, 59, 999));
        const inicioMes2 = new Date(Date.UTC(parseInt(ano2), parseInt(mes2) - 1, 1, 0, 0, 0, 0));
        const fimMes2 = new Date(Date.UTC(parseInt(ano2), parseInt(mes2), 0, 23, 59, 59, 999));
        
        const vendasComerciais1 = await VendaComercial.find({
          gerenteId: gerente._id,
          data: { $gte: inicioMes1, $lte: fimMes1 }
        });
        const vendasComerciais2 = await VendaComercial.find({
          gerenteId: gerente._id,
          data: { $gte: inicioMes2, $lte: fimMes2 }
        });
        
        const totalVendasComerciais1 = vendasComerciais1.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
        const totalVendasComerciais2 = vendasComerciais2.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
        
        // Vendas dos funcionários para cada período
        const vendasFunc1 = funcionarios.map(func => {
          const venda = (func.vendas || []).find(v => v && v.mes === parseInt(mes1) && v.ano === parseInt(ano1));
          return (venda && venda.valor) ? Number(venda.valor) : 0;
        });
        const vendasFunc2 = funcionarios.map(func => {
          const venda = (func.vendas || []).find(v => v && v.mes === parseInt(mes2) && v.ano === parseInt(ano2));
          return (venda && venda.valor) ? Number(venda.valor) : 0;
        });
        
        const totalVendasFunc1 = vendasFunc1.reduce((sum, v) => sum + v, 0);
        const totalVendasFunc2 = vendasFunc2.reduce((sum, v) => sum + v, 0);
        
        // Total geral = vendas funcionários + vendas comerciais
        const vendas1 = totalVendasFunc1 + totalVendasComerciais1;
        const vendas2 = totalVendasFunc2 + totalVendasComerciais2;
        
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
    const anoAtual = ano ? parseInt(ano, 10) : new Date().getFullYear();
    
    // Validar tipo
    if (tipo && tipo !== 'mensal' && tipo !== 'trimestral') {
      return res.status(400).json({ message: 'Tipo inválido. Use "mensal" ou "trimestral"' });
    }
    
    // Validar ano
    if (isNaN(anoAtual) || anoAtual < 2020 || anoAtual > 2100) {
      return res.status(400).json({ message: 'Ano inválido' });
    }
    
    const tipoEvolucao = tipo || 'mensal'; // Default para mensal
    
    logger.info(`Buscando evolução ${tipoEvolucao} para ano ${anoAtual}`);
    
    const gerentes = await Gerente.find().select('nome nomeLoja');
    
    if (!gerentes || gerentes.length === 0) {
      return res.json({ evolucao: [] });
    }
    
    const evolucao = await Promise.all(
      gerentes.map(async (gerente) => {
        try {
          const dados = [];
          
          const funcionarios = await Funcionario.find({ gerenteId: gerente._id });
          
          if (tipoEvolucao === 'mensal') {
            for (let mes = 1; mes <= 12; mes++) {
              try {
                const meta = await Meta.findOne({ gerenteId: gerente._id, mes, ano: anoAtual });
                
                // Calcular vendas comerciais
                const inicioMes = new Date(Date.UTC(anoAtual, mes - 1, 1, 0, 0, 0, 0));
                const fimMes = new Date(Date.UTC(anoAtual, mes, 0, 23, 59, 59, 999));
                
                let totalVendasComerciais = 0;
                try {
                  const vendasComerciais = await VendaComercial.find({
                    gerenteId: gerente._id,
                    data: { $gte: inicioMes, $lte: fimMes }
                  });
                  totalVendasComerciais = vendasComerciais.reduce((sum, v) => {
                    const valor = parseFloat(v.valor);
                    return sum + (isNaN(valor) ? 0 : valor);
                  }, 0);
                } catch (err) {
                  logger.error(`Erro ao buscar vendas comerciais para loja ${gerente.nomeLoja}, mês ${mes}:`, err);
                  totalVendasComerciais = 0;
                }
                
                // Vendas dos funcionários
                const vendasFunc = funcionarios.map(func => {
                  if (!func.vendas || !Array.isArray(func.vendas)) return 0;
                  const venda = func.vendas.find(v => v && v.mes === mes && v.ano === anoAtual);
                  const valor = (venda && venda.valor) ? Number(venda.valor) : 0;
                  return isNaN(valor) ? 0 : valor;
                });
                const totalVendasFunc = vendasFunc.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
                
                // Total geral
                const total = totalVendasFunc + totalVendasComerciais;
                
                dados.push({
                  periodo: `${mes}/${anoAtual}`,
                  mes,
                  vendas: isNaN(total) ? 0 : total,
                  meta: meta && meta.valor ? (isNaN(parseFloat(meta.valor)) ? 0 : parseFloat(meta.valor)) : 0
                });
              } catch (err) {
                logger.error(`Erro ao processar mês ${mes} para loja ${gerente.nomeLoja}:`, err);
                // Continuar com os outros meses mesmo se um falhar
              }
            }
          } else if (tipoEvolucao === 'trimestral') {
            for (let trimestre = 1; trimestre <= 4; trimestre++) {
              try {
                let totalVendas = 0;
                let totalMeta = 0;
                const meses = [
                  (trimestre - 1) * 3 + 1,
                  (trimestre - 1) * 3 + 2,
                  (trimestre - 1) * 3 + 3
                ];
                
                for (const mes of meses) {
                  try {
                    const meta = await Meta.findOne({ gerenteId: gerente._id, mes, ano: anoAtual });
                    
                    // Calcular vendas comerciais
                    const inicioMes = new Date(Date.UTC(anoAtual, mes - 1, 1, 0, 0, 0, 0));
                    const fimMes = new Date(Date.UTC(anoAtual, mes, 0, 23, 59, 59, 999));
                    
                    let totalVendasComerciais = 0;
                    try {
                      const vendasComerciais = await VendaComercial.find({
                        gerenteId: gerente._id,
                        data: { $gte: inicioMes, $lte: fimMes }
                      });
                      totalVendasComerciais = vendasComerciais.reduce((sum, v) => {
                        const valor = parseFloat(v.valor);
                        return sum + (isNaN(valor) ? 0 : valor);
                      }, 0);
                    } catch (err) {
                      logger.error(`Erro ao buscar vendas comerciais para loja ${gerente.nomeLoja}, mês ${mes}:`, err);
                    }
                    
                    // Vendas dos funcionários
                    const vendasFunc = funcionarios.map(func => {
                      if (!func.vendas || !Array.isArray(func.vendas)) return 0;
                      const venda = func.vendas.find(v => v && v.mes === mes && v.ano === anoAtual);
                      const valor = (venda && venda.valor) ? Number(venda.valor) : 0;
                      return isNaN(valor) ? 0 : valor;
                    });
                    const totalVendasFunc = vendasFunc.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
                    
                    // Total geral
                    totalVendas += totalVendasFunc + totalVendasComerciais;
                    totalMeta += meta && meta.valor ? (isNaN(parseFloat(meta.valor)) ? 0 : parseFloat(meta.valor)) : 0;
                  } catch (err) {
                    logger.error(`Erro ao processar mês ${mes} do trimestre ${trimestre} para loja ${gerente.nomeLoja}:`, err);
                  }
                }
                
                dados.push({
                  periodo: `T${trimestre}/${anoAtual}`,
                  trimestre,
                  vendas: isNaN(totalVendas) ? 0 : totalVendas,
                  meta: isNaN(totalMeta) ? 0 : totalMeta
                });
              } catch (err) {
                logger.error(`Erro ao processar trimestre ${trimestre} para loja ${gerente.nomeLoja}:`, err);
              }
            }
          }
          
          return {
            loja: gerente.nomeLoja || 'Loja sem nome',
            dados: dados.filter(d => d && d.periodo) // Filtrar dados inválidos
          };
        } catch (err) {
          logger.error(`Erro ao processar loja ${gerente.nomeLoja}:`, err);
          return {
            loja: gerente.nomeLoja || 'Loja sem nome',
            dados: []
          };
        }
      })
    );

    // Filtrar lojas sem dados
    const evolucaoFiltrada = evolucao.filter(loja => loja.dados && loja.dados.length > 0);

    logger.info(`Evolução calculada: ${evolucaoFiltrada.length} lojas com dados`);
    
    res.json({ evolucao: evolucaoFiltrada });
  } catch (error) {
    logger.error('Erro ao buscar dados de evolução:', error);
    res.status(500).json({ 
      message: error.message || 'Erro ao buscar dados de evolução',
      error: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
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
      const funcionarios = await Funcionario.find({ gerenteId: gerente._id });
      
      // Calcular vendas comerciais
      const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
      const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
      const vendasComerciais = await VendaComercial.find({
        gerenteId: gerente._id,
        data: { $gte: inicioMes, $lte: fimMes }
      });
      const totalVendasComerciais = vendasComerciais.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
      
      // Vendas dos funcionários
      const vendasFunc = funcionarios.map(func => {
        const venda = (func.vendas || []).find(v => v && v.mes === mesAtual && v.ano === anoAtual);
        return (venda && venda.valor) ? Number(venda.valor) : 0;
      });
      const totalVendasFunc = vendasFunc.reduce((sum, v) => sum + v, 0);
      
      // Total geral = vendas funcionários + vendas comerciais
      const totalGeral = totalVendasFunc + totalVendasComerciais;
      
      // Calcular status da meta considerando o tempo decorrido (mesma lógica do dashboard)
      if (meta && meta.valor > 0) {
        const hoje = new Date();
        const mesAtualSistema = hoje.getMonth() + 1;
        const anoAtualSistema = hoje.getFullYear();
        const isMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
        
        // Calcular dias decorridos
        const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
        let diasDecorridos = 0;
        
        if (isMesAtual) {
          diasDecorridos = hoje.getDate();
        } else if (anoAtual > anoAtualSistema || (anoAtual === anoAtualSistema && mesAtual > mesAtualSistema)) {
          diasDecorridos = 0;
        } else {
          diasDecorridos = diasNoMes;
        }
        
        const percentualEsperado = diasDecorridos > 0 ? (diasDecorridos / diasNoMes) * 100 : 0;
        const percentualAtingido = (totalGeral / meta.valor) * 100;
        const diferencaPercentual = percentualAtingido - percentualEsperado;
        
        // Determinar status da meta
        let statusMeta = 'abaixo';
        if (totalGeral >= meta.valor) {
          statusMeta = 'batida';
        } else if (isMesAtual) {
          if (diferencaPercentual >= 5) {
            statusMeta = 'no_prazo';
          } else if (diferencaPercentual >= -10) {
            statusMeta = 'no_ritmo';
          } else {
            statusMeta = 'abaixo';
          }
        } else {
          if (percentualAtingido >= 100) {
            statusMeta = 'batida';
          } else if (percentualAtingido >= 70) {
            statusMeta = 'no_prazo';
          } else if (percentualAtingido >= 50) {
            statusMeta = 'no_ritmo';
          } else {
            statusMeta = 'abaixo';
          }
        }
        
        // Gerar alertas baseados no status
        if (statusMeta === 'batida') {
          alertas.push({
            tipo: 'sucesso',
            loja: gerente.nomeLoja,
            mensagem: `Meta batida! ${percentualAtingido.toFixed(1)}% atingido`,
            valor: totalGeral,
            meta: meta.valor
          });
        } else if (statusMeta === 'abaixo') {
          // Apenas mostrar alerta quando realmente estiver abaixo do esperado
          const mensagem = isMesAtual && diasDecorridos > 0
            ? `Meta abaixo do esperado: ${percentualAtingido.toFixed(1)}% (esperado: ${percentualEsperado.toFixed(1)}%)`
            : `Meta abaixo do esperado: ${percentualAtingido.toFixed(1)}%`;
          alertas.push({
            tipo: 'alerta',
            loja: gerente.nomeLoja,
            mensagem: mensagem,
            valor: totalGeral,
            meta: meta.valor
          });
        }
        // Não mostrar alerta para "no_prazo" ou "no_ritmo" - são situações normais
      }
      
      // Funcionários sem vendas - apenas vendedores
      const funcoesVendaAlertas = ['Vendedor', 'Vendedora', 'Vendedor Online'];
      const funcionariosSemVendas = funcionarios.filter(f => {
        // Apenas verificar funcionários com função de venda
        if (!f.funcao || !funcoesVendaAlertas.includes(f.funcao)) return false;
        const v = (f.vendas || []).find(v => v && v.mes === mesAtual && v.ano === anoAtual);
        return !v || (Number(v.valor) || 0) === 0;
      });
      
      if (funcionariosSemVendas.length > 0) {
        alertas.push({
          tipo: 'info',
          loja: gerente.nomeLoja,
          mensagem: `${funcionariosSemVendas.length} funcionário(s) sem vendas registradas`,
          funcionarios: funcionariosSemVendas.map(f => {
            // Montar nome completo (nome + sobrenome)
            return f.sobrenome && f.sobrenome.trim() !== ''
              ? `${f.nome} ${f.sobrenome}`
              : f.nome;
          })
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
        
        // Calcular vendas comerciais
        const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
        const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
        const vendasComerciais = await VendaComercial.find({
          gerenteId: gerente._id,
          data: { $gte: inicioMes, $lte: fimMes }
        });
        const totalVendasComerciais = vendasComerciais.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
        
        // Vendas dos funcionários
        const vendasFunc = funcionarios.map(func => {
          const venda = (func.vendas || []).find(v => v && v.mes === mesAtual && v.ano === anoAtual);
          return (venda && venda.valor) ? Number(venda.valor) : 0;
        });
        const totalVendasFunc = vendasFunc.reduce((sum, v) => sum + v, 0);
        
        // Total geral = vendas funcionários + vendas comerciais
        const totalGeral = totalVendasFunc + totalVendasComerciais;
        
        // Calcular percentual de funcionários que bateram a meta individual
        const funcoesVenda = ['Vendedor', 'Vendedora', 'Vendedor Online'];
        let funcionariosComMeta = 0;
        let funcionariosBateramMeta = 0;
        
        funcionarios.forEach(func => {
          // Considerar apenas funcionários de vendas
          if (func.funcao && funcoesVenda.includes(func.funcao)) {
            const metaIndividual = Number(func.metaIndividual) || 0;
            if (metaIndividual > 0) {
              funcionariosComMeta++;
              const venda = (func.vendas || []).find(v => v && v.mes === mesAtual && v.ano === anoAtual);
              const valorVenda = (venda && venda.valor) ? Number(venda.valor) : 0;
              if (valorVenda >= metaIndividual) {
                funcionariosBateramMeta++;
              }
            }
          }
        });
        
        const percentualBateramMeta = funcionariosComMeta > 0 
          ? (funcionariosBateramMeta / funcionariosComMeta) * 100 
          : 0;
        
        const vendasPorFuncionario = funcionarios.length > 0 ? totalGeral / funcionarios.length : 0;
        const taxaConversao = meta && meta.valor > 0 ? (totalGeral / meta.valor) * 100 : 0;
        
        return {
          loja: gerente.nomeLoja,
          percentualBateramMeta: Math.round(percentualBateramMeta * 100) / 100,
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

    // Nota: Os dias decorridos e restantes serão calculados por loja,
    // considerando se estamos visualizando o mês atual ou um mês passado/futuro

    const gerentes = await Gerente.find();
    
    const previsoes = await Promise.all(
      gerentes.map(async (gerente) => {
        const meta = await Meta.findOne({ gerenteId: gerente._id, mes: mesAtual, ano: anoAtual });
        const funcionarios = await Funcionario.find({ gerenteId: gerente._id });
        
        // Calcular vendas comerciais
        const inicioMes = new Date(Date.UTC(anoAtual, mesAtual - 1, 1, 0, 0, 0, 0));
        const fimMes = new Date(Date.UTC(anoAtual, mesAtual, 0, 23, 59, 59, 999));
        const vendasComerciais = await VendaComercial.find({
          gerenteId: gerente._id,
          data: { $gte: inicioMes, $lte: fimMes }
        });
        const totalVendasComerciais = vendasComerciais.reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
        
        // Vendas dos funcionários
        const vendasFunc = funcionarios.map(func => {
          const venda = (func.vendas || []).find(v => v && v.mes === mesAtual && v.ano === anoAtual);
          return (venda && venda.valor) ? Number(venda.valor) : 0;
        });
        const totalVendasFunc = vendasFunc.reduce((sum, v) => sum + v, 0);
        
        // Total geral = vendas funcionários + vendas comerciais
        const vendasAteHoje = totalVendasFunc + totalVendasComerciais;
        
        // Buscar vendas diárias para cálculo estatístico
        const vendasDiarias = [];
        
        // Vendas comerciais diárias
        vendasComerciais.forEach(v => {
          const vDate = new Date(v.data);
          if (vDate.getUTCMonth() + 1 === mesAtual && vDate.getUTCFullYear() === anoAtual) {
            vendasDiarias.push({ dia: vDate.getUTCDate(), valor: parseFloat(v.valor) || 0 });
          }
        });
        
        // Vendas diárias dos funcionários
        funcionarios.forEach(f => {
          if (f.vendasDiarias) {
            f.vendasDiarias.forEach(v => {
              const vDate = new Date(v.data);
              if (vDate.getUTCMonth() + 1 === mesAtual && vDate.getUTCFullYear() === anoAtual) {
                vendasDiarias.push({ dia: vDate.getUTCDate(), valor: v.valor });
              }
            });
          }
        });
        
        // Agrupar vendas por dia
        const vendasPorDia = {};
        vendasDiarias.forEach(v => {
          if (!vendasPorDia[v.dia]) {
            vendasPorDia[v.dia] = 0;
          }
          vendasPorDia[v.dia] += v.valor;
        });
        
        const vendasOrdenadas = Object.keys(vendasPorDia)
          .map(dia => ({ dia: parseInt(dia), valor: vendasPorDia[dia] }))
          .sort((a, b) => a.dia - b.dia);
        
        // Verificar se estamos no mês atual e calcular dias corretamente
        const hoje = new Date();
        const mesAtualSistema = hoje.getMonth() + 1;
        const anoAtualSistema = hoje.getFullYear();
        const isMesAtual = mesAtual === mesAtualSistema && anoAtual === anoAtualSistema;
        
        // Calcular total de dias no mês
        const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
        
        // Calcular dias decorridos corretamente
        let diasDecorridos = 0;
        if (isMesAtual) {
          // Mês atual: usar dia atual
          diasDecorridos = hoje.getDate();
        } else if (anoAtual > anoAtualSistema || (anoAtual === anoAtualSistema && mesAtual > mesAtualSistema)) {
          // Mês futuro: ainda não começou
          diasDecorridos = 0;
        } else {
          // Mês passado: usar todos os dias do mês
          diasDecorridos = diasNoMes;
        }
        
        // Recalcular dias restantes baseado nos dias decorridos corretos
        const diasRestantesCorretos = diasNoMes - diasDecorridos;
        
        // Método 1: Média Simples
        // IMPORTANTE: Dividir pelo número de dias decorridos no mês, NÃO pelo número de dias com vendas
        // Isso evita inflacionar a média quando há poucos dias com vendas registradas
        const mediaSimples = diasDecorridos > 0 
          ? vendasAteHoje / diasDecorridos 
          : 0;
        const previsaoSimples = vendasAteHoje + (mediaSimples * diasRestantesCorretos);
        
        // Método 2: Média Móvel (últimos 7 dias)
        let mediaMovel = mediaSimples;
        if (vendasOrdenadas.length >= 7) {
          const ultimos7Dias = vendasOrdenadas.slice(-7);
          mediaMovel = ultimos7Dias.reduce((sum, v) => sum + v.valor, 0) / 7;
        }
        const previsaoMediaMovel = vendasAteHoje + (mediaMovel * diasRestantesCorretos);
        
        // Método 3: Regressão Linear
        let previsaoRegressao = previsaoSimples;
        let tendencia = 0;
        if (vendasOrdenadas.length >= 3) {
          // Usar os dias reais (não índices) para regressão linear
          const n = vendasOrdenadas.length;
          let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;
          
          vendasOrdenadas.forEach((venda) => {
            const x = venda.dia; // Usar o dia real do mês, não o índice
            const y = venda.valor;
            somaX += x;
            somaY += y;
            somaXY += x * y;
            somaX2 += x * x;
          });
          
          const b = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
          const a = (somaY - b * somaX) / n;
          tendencia = b;
          
          // Calcular projeção para os dias restantes
          let projecaoRegressao = 0;
          const ultimoDiaComVenda = Math.max(...vendasOrdenadas.map(v => v.dia));
          
          for (let i = 1; i <= diasRestantesCorretos; i++) {
            const diaProjecao = ultimoDiaComVenda + i;
            const valorProjecao = a + b * diaProjecao;
            projecaoRegressao += Math.max(0, valorProjecao);
          }
          previsaoRegressao = vendasAteHoje + projecaoRegressao;
        }
        
        // Combinar métodos
        let projecaoTotal = previsaoSimples;
        if (vendasOrdenadas.length >= 7) {
          projecaoTotal = (
            previsaoRegressao * 0.4 +
            previsaoMediaMovel * 0.3 +
            previsaoSimples * 0.3
          );
        } else if (vendasOrdenadas.length >= 3) {
          projecaoTotal = (
            previsaoRegressao * 0.5 +
            previsaoSimples * 0.5
          );
        }
        
        // Calcular confiança
        let confianca = 50;
        if (vendasOrdenadas.length >= 15) confianca = 85;
        else if (vendasOrdenadas.length >= 10) confianca = 75;
        else if (vendasOrdenadas.length >= 7) confianca = 65;
        else if (vendasOrdenadas.length >= 3) confianca = 55;
        
        // Ajustar confiança baseado na variabilidade
        if (vendasOrdenadas.length >= 3) {
          const valores = vendasOrdenadas.map(v => v.valor);
          const media = valores.reduce((sum, v) => sum + v, 0) / valores.length;
          const variacao = valores.reduce((sum, v) => sum + Math.pow(v - media, 2), 0) / valores.length;
          const desvioPadrao = Math.sqrt(variacao);
          const coeficienteVariacao = media > 0 ? (desvioPadrao / media) : 1;
          
          if (coeficienteVariacao < 0.2) confianca += 10;
          else if (coeficienteVariacao > 0.5) confianca -= 10;
        }
        
        // Melhorar lógica de tendência: considerar desempenho relativo, não apenas inclinação
        let tendenciaFinal = 'estavel';
        if (vendasOrdenadas.length >= 3) {
          // Calcular desempenho esperado para o tempo decorrido
          const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
          const percentualTempoDecorrido = diasDecorridos > 0 ? (diasDecorridos / diasNoMes) * 100 : 0;
          const percentualVendasAteHoje = meta && meta.valor > 0 ? (vendasAteHoje / meta.valor) * 100 : 0;
          const percentualProjecao = meta && meta.valor > 0 ? (projecaoTotal / meta.valor) * 100 : 0;
          
          // Critério 1: Comparar vendas até hoje com o esperado para o tempo decorrido
          const diferencaPercentual = percentualVendasAteHoje - percentualTempoDecorrido;
          
          // Critério 2: Projeção em relação à meta
          const projecaoAcimaMeta = percentualProjecao >= 100;
          
          // Critério 3: Inclinação da regressão (tendência)
          const tendenciaPositiva = tendencia > 0;
          
          // Decisão combinada: se está acima do esperado E projeta acima da meta OU tendência positiva forte
          if ((diferencaPercentual > 5 && projecaoAcimaMeta) || (tendenciaPositiva && diferencaPercentual > 0)) {
            tendenciaFinal = 'crescimento';
          } else if ((diferencaPercentual < -5) || (tendencia < 0 && percentualProjecao < 90)) {
            tendenciaFinal = 'declinio';
          } else {
            tendenciaFinal = 'estavel';
          }
        } else {
          // Com poucos dados, usar apenas comparação com esperado
          const diasNoMes = new Date(anoAtual, mesAtual, 0).getDate();
          const percentualTempoDecorrido = diasDecorridos > 0 ? (diasDecorridos / diasNoMes) * 100 : 0;
          const percentualVendasAteHoje = meta && meta.valor > 0 ? (vendasAteHoje / meta.valor) * 100 : 0;
          const diferencaPercentual = percentualVendasAteHoje - percentualTempoDecorrido;
          
          if (diferencaPercentual > 5) {
            tendenciaFinal = 'crescimento';
          } else if (diferencaPercentual < -5) {
            tendenciaFinal = 'declinio';
          } else {
            tendenciaFinal = 'estavel';
          }
        }
        
        return {
          loja: gerente.nomeLoja,
          vendasAteHoje,
          mediaDiaria: mediaMovel,
          diasRestantes: diasRestantesCorretos,
          diasDecorridos: diasDecorridos,
          projecaoTotal,
          meta: meta ? meta.valor : 0,
          percentualConfianca: Math.min(95, Math.max(30, confianca)),
          previsaoMeta: meta && meta.valor > 0 ? (projecaoTotal / meta.valor) * 100 : 0,
          tendencia: tendenciaFinal
        };
      })
    );

    res.json({ previsoes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

