const express = require('express');
const Meta = require('../models/Meta');
const Funcionario = require('../models/Funcionario');
const auth = require('../middleware/auth');
const router = express.Router();

// Todos os endpoints precisam de autenticação
router.use(auth);

// Listar todas as metas da loja
router.get('/', async (req, res) => {
  try {
    const metas = await Meta.find({ gerenteId: req.user.id }).sort({ ano: -1, mes: -1 });
    res.json(metas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Obter meta de um mês específico
router.get('/:mes/:ano', async (req, res) => {
  try {
    const { mes, ano } = req.params;
    const meta = await Meta.findOne({
      gerenteId: req.user.id,
      mes: parseInt(mes),
      ano: parseInt(ano)
    });

    if (!meta) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    res.json(meta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Criar ou atualizar meta mensal
router.post('/', async (req, res) => {
  try {
    const { mes, ano, valor } = req.body;

    // Garantir que mes, ano e valor são números válidos
    const mesNum = parseInt(mes, 10);
    const anoNum = parseInt(ano, 10);
    const valorNum = parseFloat(valor);

    if (isNaN(mesNum) || isNaN(anoNum) || isNaN(valorNum)) {
      return res.status(400).json({ 
        message: 'Mês, ano e valor devem ser números válidos' 
      });
    }

    if (mesNum < 1 || mesNum > 12) {
      return res.status(400).json({ message: 'Mês deve estar entre 1 e 12' });
    }

    if (valorNum < 0) {
      return res.status(400).json({ message: 'Valor deve ser maior ou igual a zero' });
    }

    const meta = await Meta.findOneAndUpdate(
      { gerenteId: req.user.id, mes: mesNum, ano: anoNum },
      { gerenteId: req.user.id, mes: mesNum, ano: anoNum, valor: valorNum },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(meta);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Meta já existe para este mês/ano' });
    }
    console.error('Erro ao criar/atualizar meta:', error);
    res.status(500).json({ message: error.message });
  }
});

// Adicionar venda diária da loja
router.post('/:id/vendas-diarias', async (req, res) => {
  try {
    const { data, valor, observacao } = req.body;

    if (!data || valor === undefined || valor === null) {
      return res.status(400).json({ message: 'Data e valor são obrigatórios' });
    }

    const meta = await Meta.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!meta) {
      return res.status(404).json({ message: 'Meta não encontrada' });
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

    // Inicializar vendasDiarias se não existir
    if (!meta.vendasDiarias) {
      meta.vendasDiarias = [];
    }

    // Sempre adicionar nova venda diária (permitir múltiplas vendas no mesmo dia)
    meta.vendasDiarias.push({
      data: dataVenda,
      valor: parseFloat(valor),
      observacao: observacao || ''
    });

    console.log(`Venda adicionada à meta ${meta._id}. Total de vendas: ${meta.vendasDiarias.length}`);
    console.log(`Data da venda: ${dataVenda.toISOString()}, Valor: ${valor}`);

    // Calcular total de vendas diretas da loja no mês
    // IMPORTANTE: Usar o mês/ano da META, não da venda, para garantir consistência
    const mesMeta = parseInt(meta.mes, 10);
    const anoMeta = parseInt(meta.ano, 10);
    
    console.log(`Mês/Ano da meta: ${mesMeta}/${anoMeta}`);
    console.log(`Data da venda salva: ${dataVenda.toISOString()}`);
    
    // Verificar se a venda está no mesmo mês/ano da meta
    const mesVenda = dataVenda.getUTCMonth() + 1;
    const anoVenda = dataVenda.getUTCFullYear();
    console.log(`Mês/Ano extraído da venda: ${mesVenda}/${anoVenda}`);
    
    // Filtrar vendas do mês/ano da META (não da venda individual)
    const vendasDiretasLoja = meta.vendasDiarias.filter(v => {
      const vDate = new Date(v.data);
      // Usar UTC para comparar corretamente
      const mesV = vDate.getUTCMonth() + 1;
      const anoV = vDate.getUTCFullYear();
      const corresponde = mesV === mesMeta && anoV === anoMeta;
      console.log(`Venda: ${vDate.toISOString()} -> ${mesV}/${anoV} corresponde? ${corresponde}`);
      return corresponde;
    });
    
    console.log(`Vendas diretas da loja no mês ${mesVenda}/${anoVenda}: ${vendasDiretasLoja.length}`);
    
    const totalVendasDiretasLoja = vendasDiretasLoja.reduce((sum, v) => sum + v.valor, 0);
    console.log(`Total vendas diretas da loja: R$ ${totalVendasDiretasLoja}`);

    // Calcular total de vendas dos funcionários no mesmo mês/ano da META
    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });
    let totalVendasFuncionarios = 0;
    
    funcionarios.forEach(funcionario => {
      if (funcionario.vendasDiarias && funcionario.vendasDiarias.length > 0) {
        funcionario.vendasDiarias.forEach(venda => {
          const vDate = new Date(venda.data);
          // Usar UTC para comparar corretamente
          const mesV = vDate.getUTCMonth() + 1;
          const anoV = vDate.getUTCFullYear();
          // Comparar com mês/ano da META, não da venda individual
          if (mesV === mesMeta && anoV === anoMeta) {
            totalVendasFuncionarios += venda.valor || 0;
          }
        });
      }
    });

    console.log(`Total vendas funcionários: R$ ${totalVendasFuncionarios}`);

    // Total vendido = vendas diretas da loja + vendas dos funcionários
    meta.totalVendido = totalVendasDiretasLoja + totalVendasFuncionarios;
    console.log(`Total vendido atualizado: R$ ${meta.totalVendido}`);

    await meta.save();
    
    // Recarregar a meta do banco para garantir que temos os dados mais recentes
    const metaAtualizada = await Meta.findById(meta._id);
    console.log(`Meta recarregada. Total de vendas diárias: ${metaAtualizada.vendasDiarias.length}`);
    
    res.json(metaAtualizada);
  } catch (error) {
    console.error('Erro ao adicionar venda diária da loja:', error);
    res.status(500).json({ message: error.message });
  }
});

// Editar venda diária da loja
router.put('/:id/vendas-diarias/:vendaId', async (req, res) => {
  try {
    const { valor, observacao, data } = req.body;

    const meta = await Meta.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!meta) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    if (!meta.vendasDiarias || meta.vendasDiarias.length === 0) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    // Encontrar a venda pelo ID
    const vendaIndex = meta.vendasDiarias.findIndex(
      v => v._id.toString() === req.params.vendaId
    );

    if (vendaIndex === -1) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }

    // Atualizar a venda
    if (valor !== undefined) {
      meta.vendasDiarias[vendaIndex].valor = parseFloat(valor);
    }
    if (observacao !== undefined) {
      meta.vendasDiarias[vendaIndex].observacao = observacao;
    }
    if (data) {
      // Normalizar data usando UTC
      let dataVenda;
      if (typeof data === 'string' && data.includes('-')) {
        const partes = data.split('-');
        if (partes.length === 3) {
          const ano = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10);
          const dia = parseInt(partes[2], 10);
          dataVenda = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0));
        } else {
          dataVenda = new Date(data);
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
      meta.vendasDiarias[vendaIndex].data = dataVenda;
    }

    // Recalcular total de vendas diretas da loja no mês
    const vendaAtualizada = meta.vendasDiarias[vendaIndex];
    const mesVenda = new Date(vendaAtualizada.data).getUTCMonth() + 1;
    const anoVenda = new Date(vendaAtualizada.data).getUTCFullYear();
    
    const vendasDiretasLoja = meta.vendasDiarias.filter(v => {
      const vDate = new Date(v.data);
      return vDate.getUTCMonth() + 1 === mesVenda && 
             vDate.getUTCFullYear() === anoVenda;
    });
    
    const totalVendasDiretasLoja = vendasDiretasLoja.reduce((sum, v) => sum + v.valor, 0);

    // Calcular total de vendas dos funcionários no mesmo mês
    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });
    let totalVendasFuncionarios = 0;
    
    funcionarios.forEach(funcionario => {
      if (funcionario.vendasDiarias && funcionario.vendasDiarias.length > 0) {
        funcionario.vendasDiarias.forEach(venda => {
          const vDate = new Date(venda.data);
          if (vDate.getUTCMonth() + 1 === mesVenda && vDate.getUTCFullYear() === anoVenda) {
            totalVendasFuncionarios += venda.valor || 0;
          }
        });
      }
    });

    // Total vendido = vendas diretas da loja + vendas dos funcionários
    meta.totalVendido = totalVendasDiretasLoja + totalVendasFuncionarios;

    await meta.save();
    res.json(meta);
  } catch (error) {
    console.error('Erro ao editar venda diária da loja:', error);
    res.status(500).json({ message: error.message });
  }
});

// Obter vendas diárias de uma meta (incluindo vendas dos funcionários)
router.get('/:id/vendas-diarias', async (req, res) => {
  try {
    console.log('Buscando histórico de vendas para meta:', req.params.id);
    console.log('Gerente ID:', req.user.id);
    
    const meta = await Meta.findOne({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!meta) {
      console.log('Meta não encontrada');
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    console.log('Meta encontrada:', { mes: meta.mes, ano: meta.ano, valor: meta.valor });

    // Garantir que mes e ano são números válidos
    const mesMeta = parseInt(meta.mes, 10);
    const anoMeta = parseInt(meta.ano, 10);

    console.log('Mês e ano convertidos:', { mesMeta, anoMeta });

    if (isNaN(mesMeta) || isNaN(anoMeta)) {
      console.error('Meta com dados inválidos:', { mes: meta.mes, ano: meta.ano, tipoMes: typeof meta.mes, tipoAno: typeof meta.ano });
      return res.status(400).json({ 
        message: `Meta com dados inválidos. Mês: ${meta.mes}, Ano: ${meta.ano}` 
      });
    }

    // Buscar todas as vendas diárias dos funcionários do mês/ano da meta
    console.log('Buscando funcionários do gerente...');
    const funcionarios = await Funcionario.find({ gerenteId: req.user.id });
    console.log(`Encontrados ${funcionarios.length} funcionários`);
    
    // Agrupar vendas por data
    const vendasPorData = {};
    
    // Vendas diretas da loja
    console.log('=== PROCESSANDO VENDAS DIRETAS DA LOJA ===');
    console.log('Meta mês/ano:', `${mesMeta}/${anoMeta}`);
    console.log('Meta tem vendas diárias:', meta.vendasDiarias ? 'Sim' : 'Não');
    console.log('Total de vendas diárias:', meta.vendasDiarias?.length || 0);
    
    if (meta.vendasDiarias && meta.vendasDiarias.length > 0) {
      console.log(`Processando ${meta.vendasDiarias.length} vendas diárias da loja...`);
      
      meta.vendasDiarias.forEach((venda, index) => {
        try {
          const vDate = new Date(venda.data);
          if (isNaN(vDate.getTime())) {
            console.error(`Venda ${index} tem data inválida:`, venda.data);
            return;
          }
          // Usar UTC para extrair componentes corretamente
          const ano = vDate.getUTCFullYear();
          const mes = vDate.getUTCMonth() + 1;
          const dia = vDate.getUTCDate();
          
          console.log(`Venda ${index + 1}:`, {
            dataOriginal: venda.data,
            dataProcessada: vDate.toISOString(),
            ano,
            mes,
            dia,
            valor: venda.valor,
            vendaId: venda._id ? venda._id.toString() : 'Sem ID',
            corresponde: mes === mesMeta && ano === anoMeta
          });
          
          // Verificar se é do mês/ano da meta
          if (mes === mesMeta && ano === anoMeta) {
            const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            console.log(`Venda ${index + 1} corresponde! Data key: ${dataKey}`);
            
            if (!vendasPorData[dataKey]) {
              vendasPorData[dataKey] = {
                data: new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0)),
                vendasLoja: [],
                vendasFuncionarios: [],
                total: 0
              };
              console.log(`Criando entrada para dia ${dataKey}`);
            }
            const valorVenda = parseFloat(venda.valor) || 0;
            vendasPorData[dataKey].vendasLoja.push({
              tipo: 'loja',
              vendaId: venda._id ? venda._id.toString() : '',
              valor: valorVenda,
              observacao: (venda.observacao || '').toString()
            });
            vendasPorData[dataKey].total += valorVenda;
            console.log(`Venda ${index + 1} adicionada ao dia ${dataKey}. Total do dia: R$ ${vendasPorData[dataKey].total}`);
          } else {
            console.log(`Venda ${index + 1} NÃO corresponde (${mes}/${ano} vs ${mesMeta}/${anoMeta})`);
          }
        } catch (err) {
          console.error(`Erro ao processar venda ${index}:`, err);
        }
      });
      
      console.log(`Total de dias com vendas da loja: ${Object.keys(vendasPorData).length}`);
    } else {
      console.log('Meta não tem vendas diárias');
    }
    
    // Vendas dos funcionários
    console.log('Processando vendas dos funcionários...');
    funcionarios.forEach((funcionario, funcIndex) => {
      if (funcionario.vendasDiarias && funcionario.vendasDiarias.length > 0) {
        console.log(`Funcionário ${funcionario.nome} tem ${funcionario.vendasDiarias.length} vendas`);
        funcionario.vendasDiarias.forEach((venda, vendaIndex) => {
          try {
            const vDate = new Date(venda.data);
            if (isNaN(vDate.getTime())) {
              console.error(`Venda ${vendaIndex} do funcionário ${funcionario.nome} tem data inválida:`, venda.data);
              return;
            }
            // Usar UTC para extrair componentes corretamente
            const ano = vDate.getUTCFullYear();
            const mes = vDate.getUTCMonth() + 1;
            const dia = vDate.getUTCDate();
            
            // Verificar se é do mês/ano da meta
            if (mes === mesMeta && ano === anoMeta) {
              const dataKey = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
              if (!vendasPorData[dataKey]) {
                vendasPorData[dataKey] = {
                  data: new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0)),
                  vendasLoja: [],
                  vendasFuncionarios: [],
                  total: 0
                };
              }
              const valorVendaFunc = parseFloat(venda.valor) || 0;
              vendasPorData[dataKey].vendasFuncionarios.push({
                tipo: 'funcionario',
                funcionarioNome: funcionario.nome || 'Funcionário sem nome',
                funcionarioId: funcionario._id ? funcionario._id.toString() : '',
                vendaId: venda._id ? venda._id.toString() : '',
                valor: valorVendaFunc,
                observacao: (venda.observacao || '').toString()
              });
              vendasPorData[dataKey].total += valorVendaFunc;
            }
          } catch (err) {
            console.error(`Erro ao processar venda ${vendaIndex} do funcionário ${funcionario.nome}:`, err);
          }
        });
      }
    });

    // Converter para array e ordenar por data (mais recente primeiro)
    // Garantir que as datas sejam serializadas corretamente
    const vendasAgrupadas = Object.values(vendasPorData)
      .map(dia => ({
        ...dia,
        data: dia.data.toISOString() // Converter data para string ISO
      }))
      .sort((a, b) => {
        try {
          return new Date(b.data) - new Date(a.data);
        } catch (e) {
          return 0;
        }
      });

    // Calcular totais de forma segura
    let totalVendasFuncionarios = 0;
    try {
      totalVendasFuncionarios = funcionarios.reduce((sum, func) => {
        if (func.vendasDiarias && Array.isArray(func.vendasDiarias)) {
          return sum + func.vendasDiarias.filter(v => {
            try {
              if (!v || !v.data) return false;
              const vDate = new Date(v.data);
              if (isNaN(vDate.getTime())) return false;
              // Usar UTC para comparar corretamente
              return vDate.getUTCMonth() + 1 === mesMeta && vDate.getUTCFullYear() === anoMeta;
            } catch (e) {
              return false;
            }
          }).reduce((s, v) => s + (parseFloat(v.valor) || 0), 0);
        }
        return sum;
      }, 0);
    } catch (e) {
      console.error('Erro ao calcular total de vendas dos funcionários:', e);
    }

    let totalVendasLoja = 0;
    try {
      if (meta.vendasDiarias && Array.isArray(meta.vendasDiarias)) {
        totalVendasLoja = meta.vendasDiarias.filter(v => {
          try {
            if (!v || !v.data) return false;
            const vDate = new Date(v.data);
            if (isNaN(vDate.getTime())) return false;
            // Usar UTC para comparar corretamente
            return vDate.getUTCMonth() + 1 === mesMeta && vDate.getUTCFullYear() === anoMeta;
          } catch (e) {
            return false;
          }
        }).reduce((sum, v) => sum + (parseFloat(v.valor) || 0), 0);
      }
    } catch (e) {
      console.error('Erro ao calcular total de vendas da loja:', e);
    }

    // Preparar resposta
    const resposta = {
      vendasAgrupadas: vendasAgrupadas || [],
      resumo: {
        totalVendasFuncionarios: totalVendasFuncionarios || 0,
        totalVendasLoja: totalVendasLoja || 0,
        totalGeral: parseFloat(meta.totalVendido) || 0
      }
    };

    console.log('Retornando histórico de vendas:', {
      totalDias: resposta.vendasAgrupadas.length,
      resumo: resposta.resumo
    });

    res.json(resposta);
  } catch (error) {
    console.error('Erro ao buscar vendas diárias:', error);
    console.error('Stack trace:', error.stack);
    console.error('Detalhes do erro:', {
      message: error.message,
      name: error.name,
      metaId: req.params.id,
      gerenteId: req.user?.id
    });
    
    // Retornar resposta vazia ao invés de erro para não quebrar o frontend
    res.json({ 
      vendasAgrupadas: [],
      resumo: {
        totalVendasFuncionarios: 0,
        totalVendasLoja: 0,
        totalGeral: 0
      }
    });
  }
});

// Deletar meta
router.delete('/:id', async (req, res) => {
  try {
    const meta = await Meta.findOneAndDelete({
      _id: req.params.id,
      gerenteId: req.user.id
    });

    if (!meta) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    res.json({ message: 'Meta deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

