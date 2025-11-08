const ExcelJS = require('exceljs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
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
 * Exportar dados para CSV
 */
const exportToCSV = async (data, headers, filename = 'export.csv') => {
  try {
    const csvWriter = createCsvWriter({
      path: filename,
      header: headers.map(header => ({
        id: header.key,
        title: header.label
      }))
    });

    await csvWriter.writeRecords(data);
    logger.info('CSV exportado com sucesso', { filename, records: data.length });
    return filename;
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

