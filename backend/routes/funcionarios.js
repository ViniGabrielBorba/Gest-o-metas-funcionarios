const express = require('express');
const Funcionario = require('../models/Funcionario');
const Meta = require('../models/Meta');
const auth = require('../middleware/auth');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Listar todos os funcionários da loja do gerente
router.get('/', async (req, res) => {
  try {
    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter funcionário por ID
router.get('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar novo funcionário
router.post('/', async (req, res) => {
  try {
    const { nome, sexo, idade, funcao, dataAniversario, metaIndividual } = req.body;

    const funcionario = await Funcionario.create({
      gerenteId: req.user.id,
      nome,
      sexo,
      idade,
      funcao,
      dataAniversario: new Date(dataAniversario),
      metaIndividual,
      vendas: []
    });

    res.status(201).json(funcionario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Atualizar funcionário
router.put('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findOneAndUpdate(
      { _id: req.params.id, gerenteId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Adicionar/atualizar venda mensal de um funcionário (mantido para compatibilidade)
router.post('/:id/vendas', async (req, res) => {
  try {
    const { mes, ano, valor } = req.body;

    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Verificar se já existe venda para esse mês/ano
    const vendaIndex = funcionario.vendas.findIndex(
      v => v.mes === mes && v.ano === ano
    );

    if (vendaIndex >= 0) {
      funcionario.vendas[vendaIndex].valor = valor;
    } else {
      funcionario.vendas.push({ mes, ano, valor });
    }

    await funcionario.save();
    res.json(funcionario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Adicionar venda diária
router.post('/:id/vendas-diarias', async (req, res) => {
  try {
    const { data, valor, observacao } = req.body;

    if (!data || valor === undefined || valor === null) {
      return res.status(400).json({ message: 'Data e valor são obrigatórios' });
    }

    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    // Normalizar data (remover horas, manter apenas data)
    // Usar UTC para evitar problemas de timezone
    // Garantir que a data está no formato correto
    let dataVenda;
    if (typeof data === 'string' && data.includes('-')) {
      const partes = data.split('-');
      if (partes.length === 3) {
        const ano = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10);
        const dia = parseInt(partes[2], 10);
        // Usar UTC para criar a data - garante que dia/mês/ano sejam preservados
        dataVenda = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0)); // Usar meio-dia UTC para evitar problemas de timezone
      } else {
        dataVenda = new Date(data);
        // Se já é uma data, normalizar para meio-dia UTC do mesmo dia
        const ano = dataVenda.getUTCFullYear();
        const mes = dataVenda.getUTCMonth();
        const dia = dataVenda.getUTCDate();
        dataVenda = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
      }
    } else {
      dataVenda = new Date(data);
      const ano = dataVenda.getUTCFullYear();
      const mes = dataVenda.getUTCMonth();
      const dia = dataVenda.getUTCDate();
      dataVenda = new Date(Date.UTC(ano, mes, dia, 12, 0, 0, 0));
    }
    
    // Validar se a data é válida
    if (isNaN(dataVenda.getTime())) {
      return res.status(400).json({ message: 'Data inválida' });
    }

    // Log para debug (mostrar data que será salva)
    console.log(`Salvando venda - Data recebida: ${data}, Data normalizada: ${dataVenda.toISOString()}, Data local: ${dataVenda.getDate()}/${dataVenda.getMonth() + 1}/${dataVenda.getFullYear()}`);

    // Inicializar vendasDiarias se não existir
    if (!funcionario.vendasDiarias) {
      funcionario.vendasDiarias = [];
    }

    // Sempre adicionar nova venda diária (permitir múltiplas vendas no mesmo dia)
    funcionario.vendasDiarias.push({
      data: dataVenda,
      valor: parseFloat(valor),
      observacao: observacao || ''
    });

    // Calcular total do mês atual e atualizar vendas mensais
    const mesVenda = dataVenda.getUTCMonth() + 1;
    const anoVenda = dataVenda.getUTCFullYear();
    
    const vendasDoMes = (funcionario.vendasDiarias || []).filter(v => {
      const vDate = new Date(v.data);
      // Usar UTC para comparar corretamente
      return vDate.getUTCMonth() === dataVenda.getUTCMonth() && 
             vDate.getUTCFullYear() === dataVenda.getUTCFullYear();
    });
    
    const totalMes = vendasDoMes.reduce((sum, v) => sum + v.valor, 0);

    // Atualizar ou criar registro mensal
    const vendaMensalIndex = funcionario.vendas.findIndex(
      v => v.mes === mesVenda && v.ano === anoVenda
    );

    if (vendaMensalIndex >= 0) {
      funcionario.vendas[vendaMensalIndex].valor = totalMes;
    } else {
      funcionario.vendas.push({ mes: mesVenda, ano: anoVenda, valor: totalMes });
    }

    await funcionario.save();

    // Atualizar meta da loja com o total de vendas dos funcionários
    await atualizarMetaLoja(req.user.id, mesVenda, anoVenda);

    res.json(funcionario);
  } catch (error) {
    console.error('Erro ao adicionar venda diária:', error);
    res.status(500).json({ message: error.message });
  }
});

// Função auxiliar para atualizar a meta da loja com base nas vendas dos funcionários
async function atualizarMetaLoja(gerenteId, mes, ano) {
  try {
    // Buscar todos os funcionários do gerente
    const funcionarios = await Funcionario.find({ gerenteId });

    // Calcular total de vendas diárias de todos os funcionários no mês/ano
    let totalVendasFuncionarios = 0;
    
    funcionarios.forEach(funcionario => {
      if (funcionario.vendasDiarias && funcionario.vendasDiarias.length > 0) {
        funcionario.vendasDiarias.forEach(venda => {
          const vDate = new Date(venda.data);
          const vDateNormalizada = new Date(vDate.getFullYear(), vDate.getMonth(), vDate.getDate());
          
          // Verificar se a venda é do mês/ano especificado
          if (vDateNormalizada.getMonth() + 1 === mes && vDateNormalizada.getFullYear() === ano) {
            totalVendasFuncionarios += venda.valor || 0;
          }
        });
      }
    });

    // Buscar ou criar meta da loja para o mês/ano
    let meta = await Meta.findOne({
      gerenteId,
      mes,
      ano
    });

    if (meta) {
      // Calcular total de vendas diárias diretas da loja (se houver)
      let totalVendasLojaDiretas = 0;
      if (meta.vendasDiarias && meta.vendasDiarias.length > 0) {
        meta.vendasDiarias.forEach(venda => {
          const vDate = new Date(venda.data);
          const vDateNormalizada = new Date(vDate.getFullYear(), vDate.getMonth(), vDate.getDate());
          
          // Verificar se a venda é do mês/ano especificado
          if (vDateNormalizada.getMonth() + 1 === mes && vDateNormalizada.getFullYear() === ano) {
            totalVendasLojaDiretas += venda.valor || 0;
          }
        });
      }

      // Total vendido = vendas dos funcionários + vendas diretas da loja
      meta.totalVendido = totalVendasFuncionarios + totalVendasLojaDiretas;
      await meta.save();
      console.log(`Meta da loja atualizada - Mês: ${mes}/${ano}, Funcionários: R$ ${totalVendasFuncionarios.toFixed(2)}, Loja: R$ ${totalVendasLojaDiretas.toFixed(2)}, Total: R$ ${meta.totalVendido.toFixed(2)}`);
    } else {
      // Se não existe meta, criar uma (mas sem valor definido ainda)
      // O usuário precisará criar a meta primeiro
      console.log(`Meta da loja não encontrada para ${mes}/${ano}. Crie a meta primeiro na seção de Metas.`);
    }
  } catch (error) {
    console.error('Erro ao atualizar meta da loja:', error);
    // Não lançar erro para não quebrar o salvamento da venda
  }
}

// Obter vendas diárias de um funcionário
router.get('/:id/vendas-diarias', async (req, res) => {
  try {
    const { mes, ano } = req.query;
    
    const funcionario = await Funcionario.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    let vendasDiarias = funcionario.vendasDiarias || [];

    // Filtrar por mês/ano se fornecido
    if (mes && ano) {
      const mesNum = parseInt(mes);
      const anoNum = parseInt(ano);
      vendasDiarias = vendasDiarias.filter(v => {
        const vDate = new Date(v.data);
        // Usar UTC para comparar corretamente
        return vDate.getUTCMonth() + 1 === mesNum && vDate.getUTCFullYear() === anoNum;
      });
    }

    // Ordenar por data (mais recente primeiro)
    vendasDiarias.sort((a, b) => new Date(b.data) - new Date(a.data));

    res.json(vendasDiarias);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deletar funcionário
router.delete('/:id', async (req, res) => {
  try {
    const funcionario = await Funcionario.findOneAndDelete({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!funcionario) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    res.json({ message: 'Funcionário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

