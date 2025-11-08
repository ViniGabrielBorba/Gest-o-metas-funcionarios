/**
 * Utilitário para paginação de resultados
 */

/**
 * Cria opções de paginação a partir da query string
 * @param {Object} query - Query string da requisição (req.query)
 * @param {Object} options - Opções padrão
 * @returns {Object} Objeto com skip, limit, page, pageSize
 */
const getPaginationOptions = (query, options = {}) => {
  const defaultPageSize = options.defaultPageSize || 10;
  const maxPageSize = options.maxPageSize || 100;
  
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(maxPageSize, Math.max(1, parseInt(query.pageSize) || defaultPageSize));
  
  const skip = (page - 1) * pageSize;
  
  return {
    page,
    pageSize,
    skip,
    limit: pageSize
  };
};

/**
 * Cria resposta paginada
 * @param {Array} data - Dados da página atual
 * @param {Number} total - Total de documentos
 * @param {Object} pagination - Opções de paginação
 * @returns {Object} Resposta paginada
 */
const createPaginationResponse = (data, total, pagination) => {
  const { page, pageSize } = pagination;
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

/**
 * Middleware para adicionar paginação à requisição
 */
const paginationMiddleware = (options = {}) => {
  return (req, res, next) => {
    req.pagination = getPaginationOptions(req.query, options);
    next();
  };
};

module.exports = {
  getPaginationOptions,
  createPaginationResponse,
  paginationMiddleware
};

