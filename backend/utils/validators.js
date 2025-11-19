const Joi = require('joi');

// Validação de email
const emailSchema = Joi.string().email().required().messages({
  'string.email': 'Email inválido',
  'string.empty': 'Email é obrigatório',
  'any.required': 'Email é obrigatório'
});

// Validação de senha forte (mínimo 8 caracteres, 1 maiúscula, 1 número, 1 caractere especial)
const senhaSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .required()
  .messages({
    'string.min': 'Senha deve ter no mínimo 8 caracteres',
    'string.pattern.base': 'Senha deve conter pelo menos: 1 letra maiúscula, 1 número e 1 caractere especial (@$!%*?&)',
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  });

// Validação de senha (versão mais simples para recuperação)
const senhaSimplesSchema = Joi.string()
  .min(8)
  .required()
  .messages({
    'string.min': 'Senha deve ter no mínimo 8 caracteres',
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  });

// Validação de CNPJ brasileiro
const validarCNPJ = (cnpj) => {
  if (!cnpj) return true; // CNPJ é opcional
  
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]+/g, '');
  
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;
  
  // Validação dos dígitos verificadores
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(0)) return false;
  
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  
  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(1)) return false;
  
  return true;
};

const cnpjSchema = Joi.string()
  .allow('', null)
  .custom((value, helpers) => {
    // Se vazio ou null, é válido (campo opcional)
    if (!value || value.trim() === '') {
      return value;
    }
    // Validar CNPJ apenas se preenchido
    if (!validarCNPJ(value)) {
      return helpers.error('string.cnpj');
    }
    return value;
  })
  .messages({
    'string.cnpj': 'CNPJ inválido'
  });

// Validação de telefone brasileiro
const telefoneSchema = Joi.string()
  .allow('', null)
  .custom((value, helpers) => {
    // Se vazio ou null, é válido (campo opcional)
    if (!value || value.trim() === '') {
      return value;
    }
    // Validar formato apenas se preenchido
    const pattern = /^(\d{10,11}|\(\d{2}\)\s?\d{4,5}-?\d{4})$/;
    if (!pattern.test(value)) {
      return helpers.error('string.pattern.base');
    }
    return value;
  })
  .messages({
    'string.pattern.base': 'Telefone inválido. Use formato: (11) 98765-4321 ou 11987654321'
  });

// Schema de validação para cadastro de gerente
const cadastroGerenteSchema = Joi.object({
  nome: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nome deve ter no mínimo 3 caracteres',
    'string.max': 'Nome deve ter no máximo 100 caracteres',
    'string.empty': 'Nome é obrigatório',
    'any.required': 'Nome é obrigatório'
  }),
  email: emailSchema,
  senha: senhaSchema,
  nomeLoja: Joi.string().min(3).max(100).required().messages({
    'string.min': 'Nome da loja deve ter no mínimo 3 caracteres',
    'string.max': 'Nome da loja deve ter no máximo 100 caracteres',
    'string.empty': 'Nome da loja é obrigatório',
    'any.required': 'Nome da loja é obrigatório'
  }),
  cnpj: cnpjSchema,
  telefone: telefoneSchema
});

// Schema de validação para login
const loginSchema = Joi.object({
  email: emailSchema,
  senha: Joi.string().required().messages({
    'string.empty': 'Senha é obrigatória',
    'any.required': 'Senha é obrigatória'
  })
});

// Schema de validação para recuperação de senha
const recuperarSenhaSchema = Joi.object({
  email: emailSchema
});

// Schema de validação para reset de senha
const resetSenhaSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Token é obrigatório',
    'any.required': 'Token é obrigatório'
  }),
  senha: senhaSimplesSchema
});

// Schema de validação para funcionário
const funcionarioSchema = Joi.object({
  nome: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Nome deve ter no mínimo 2 caracteres',
    'string.max': 'Nome deve ter no máximo 50 caracteres',
    'string.empty': 'Nome é obrigatório',
    'any.required': 'Nome é obrigatório'
  }),
  sobrenome: Joi.string().max(50).allow('', null).default('').optional().custom((value, helpers) => {
    // Se o valor foi fornecido e não está vazio, deve ter pelo menos 2 caracteres
    // Se for null ou undefined, converter para string vazia
    if (value === null || value === undefined) {
      return '';
    }
    const valorString = String(value).trim();
    if (valorString.length > 0 && valorString.length < 2) {
      return helpers.error('string.min');
    }
    return valorString;
  }).messages({
    'string.min': 'Sobrenome deve ter no mínimo 2 caracteres se fornecido',
    'string.max': 'Sobrenome deve ter no máximo 50 caracteres'
  }),
  sexo: Joi.string().valid('Masculino', 'Feminino', 'Outro').required().messages({
    'any.only': 'Sexo deve ser Masculino, Feminino ou Outro',
    'any.required': 'Sexo é obrigatório'
  }),
  idade: Joi.number().integer().min(16).max(100).required().messages({
    'number.min': 'Idade mínima é 16 anos',
    'number.max': 'Idade máxima é 100 anos',
    'number.base': 'Idade deve ser um número',
    'any.required': 'Idade é obrigatória'
  }),
  funcao: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Função deve ter no mínimo 2 caracteres',
    'string.max': 'Função deve ter no máximo 50 caracteres',
    'string.empty': 'Função é obrigatória',
    'any.required': 'Função é obrigatória'
  }),
  dataAniversario: Joi.date().required().messages({
    'date.base': 'Data de aniversário inválida',
    'any.required': 'Data de aniversário é obrigatória'
  }),
  dataNascimento: Joi.date().allow(null, '').optional().messages({
    'date.base': 'Data de nascimento inválida'
  }),
  cpf: Joi.string().max(14).allow('', null).optional().pattern(/^[\d.-]*$/).messages({
    'string.max': 'CPF deve ter no máximo 14 caracteres',
    'string.pattern.base': 'CPF deve conter apenas números, pontos e hífens'
  }),
  telefone: telefoneSchema,
  email: Joi.string().email().allow('', null).optional().messages({
    'string.email': 'Email inválido'
  }),
  chavePix: Joi.string().max(100).allow('', null).optional().messages({
    'string.max': 'Chave PIX deve ter no máximo 100 caracteres'
  }),
  metaIndividual: Joi.number().min(0).required().messages({
    'number.min': 'Meta individual deve ser maior ou igual a zero',
    'number.base': 'Meta individual deve ser um número',
    'any.required': 'Meta individual é obrigatória'
  })
});

// Schema de validação para venda diária
const vendaDiariaSchema = Joi.object({
  data: Joi.date().required().messages({
    'date.base': 'Data inválida',
    'any.required': 'Data é obrigatória'
  }),
  valor: Joi.number().min(0).required().messages({
    'number.min': 'Valor deve ser maior ou igual a zero',
    'number.base': 'Valor deve ser um número',
    'any.required': 'Valor é obrigatório'
  }),
  observacao: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Observação deve ter no máximo 500 caracteres'
  })
});

// Schema de validação para meta
const metaSchema = Joi.object({
  mes: Joi.number().integer().min(1).max(12).required().messages({
    'number.min': 'Mês deve estar entre 1 e 12',
    'number.max': 'Mês deve estar entre 1 e 12',
    'number.base': 'Mês deve ser um número',
    'any.required': 'Mês é obrigatório'
  }),
  ano: Joi.number().integer().min(2000).max(2100).required().messages({
    'number.min': 'Ano inválido',
    'number.max': 'Ano inválido',
    'number.base': 'Ano deve ser um número',
    'any.required': 'Ano é obrigatório'
  }),
  valor: Joi.number().min(0).required().messages({
    'number.min': 'Valor deve ser maior ou igual a zero',
    'number.base': 'Valor deve ser um número',
    'any.required': 'Valor é obrigatório'
  })
});

// Middleware de validação
const validate = (schema) => {
  return (req, res, next) => {
    // Apenas adicionar sobrenome se o schema for de funcionário
    // Não adicionar para login, recuperação de senha, etc.
    const isFuncionarioSchema = schema === funcionarioSchema;
    if (isFuncionarioSchema && req.body && !('sobrenome' in req.body)) {
      req.body.sobrenome = '';
    }
    
    console.log('=== VALIDAÇÃO ===');
    console.log('Schema:', schema.constructor.name || 'Desconhecido');
    console.log('Body recebido:', { 
      email: req.body?.email ? 'Presente' : 'Ausente',
      senha: req.body?.senha ? 'Presente' : 'Ausente',
      sobrenome: req.body?.sobrenome ? 'Presente' : 'Ausente'
    });
    
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: isFuncionarioSchema ? false : true // Remover campos desconhecidos apenas para schemas não-funcionário
    });
    
    if (error) {
      console.error('=== ERRO DE VALIDAÇÃO ===');
      console.error('Erros:', error.details);
      
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      // Se for erro de validação de email, mostrar mensagem mais clara
      const emailError = errors.find(e => e.field === 'email');
      const senhaError = errors.find(e => e.field === 'senha');
      
      let message = 'Dados inválidos';
      if (emailError) {
        message = emailError.message;
      } else if (senhaError) {
        message = senhaError.message;
      } else if (errors.length > 0) {
        message = errors[0].message;
      }
      
      return res.status(400).json({
        message: message,
        errors: errors
      });
    }
    
    // Garantir que sobrenome sempre esteja presente no valor validado (apenas para funcionário)
    if (isFuncionarioSchema && !('sobrenome' in value)) {
      value.sobrenome = '';
    }
    
    req.body = value;
    next();
  };
};

module.exports = {
  validate,
  cadastroGerenteSchema,
  loginSchema,
  recuperarSenhaSchema,
  resetSenhaSchema,
  funcionarioSchema,
  vendaDiariaSchema,
  metaSchema,
  validarCNPJ,
  emailSchema,
  senhaSchema
};

