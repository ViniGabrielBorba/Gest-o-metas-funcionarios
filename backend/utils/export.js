const ExcelJS = require('exceljs');
const logger = require('./logger');

/**
 * Exportar dados para Excel
 */
const exportToExcel = async (data, headers, filename = 'export.xlsx') => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados');

    // Adicionar cabeçalhos
    worksheet.columns = headers.map(header => ({
      header: header.label,
      key: header.key,
      width: header.width || 15
    }));

    // Estilizar cabeçalhos
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Adicionar dados
    data.forEach(item => {
      worksheet.addRow(item);
    });

    // Auto-filtrar
    worksheet.autoFilter = {
      from: 'A1',
      to: { row: 1, column: headers.length }
    };

    return workbook;
  } catch (error) {
    logger.error('Erro ao exportar para Excel', { error: error.message });
    throw error;
  }
};

/**
 * Exportar dados para CSV (geração manual - mais leve)
 */
const exportToCSV = (data, headers) => {
  try {
    // Gerar CSV manualmente (não precisa de biblioteca pesada)
    const csvHeaders = headers.map(h => h.label || h.key).join(',');
    const csvRows = data.map(row => {
      return headers.map(h => {
        const value = row[h.key];
        // Escapar valores que contêm vírgula ou aspas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value !== null && value !== undefined ? value : '';
      }).join(',');
    });
    
    return csvHeaders + '\n' + csvRows.join('\n');
  } catch (error) {
    logger.error('Erro ao exportar para CSV', { error: error.message });
    throw error;
  }
};

/**
 * Formatar dados para exportação
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

module.exports = {
  exportToExcel,
  exportToCSV,
  formatDate,
  formatCurrency,
  formatNumber
};

