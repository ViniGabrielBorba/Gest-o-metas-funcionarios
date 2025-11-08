const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createBackup, restoreBackup, listBackups, deleteBackup, cleanOldBackups } = require('../utils/backup');
const logger = require('../utils/logger');

// Todas as rotas precisam de autenticação
router.use(auth);

// Criar backup
router.post('/create', async (req, res) => {
  try {
    logger.audit('Backup criado', req.user.id, {
      tipo: req.user.tipo
    });

    const result = await createBackup();
    res.json({
      message: 'Backup criado com sucesso',
      ...result
    });
  } catch (error) {
    logger.error('Erro ao criar backup', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao criar backup',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Listar backups
router.get('/list', async (req, res) => {
  try {
    const backups = listBackups();
    res.json({
      backups,
      count: backups.length
    });
  } catch (error) {
    logger.error('Erro ao listar backups', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao listar backups',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Restaurar backup
router.post('/restore', async (req, res) => {
  try {
    const { backupDir } = req.body;

    if (!backupDir) {
      return res.status(400).json({
        message: 'Diretório de backup é obrigatório'
      });
    }

    logger.audit('Backup restaurado', req.user.id, {
      backupDir,
      tipo: req.user.tipo
    });

    const result = await restoreBackup(backupDir);
    res.json({
      message: 'Backup restaurado com sucesso',
      ...result
    });
  } catch (error) {
    logger.error('Erro ao restaurar backup', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao restaurar backup',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Deletar backup
router.delete('/:backupName', async (req, res) => {
  try {
    const { backupName } = req.params;
    const path = require('path');
    const backupDir = path.join('./backups', backupName);

    logger.audit('Backup deletado', req.user.id, {
      backupName,
      tipo: req.user.tipo
    });

    const result = deleteBackup(backupDir);
    res.json({
      message: 'Backup deletado com sucesso',
      ...result
    });
  } catch (error) {
    logger.error('Erro ao deletar backup', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao deletar backup',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Limpar backups antigos
router.post('/clean', async (req, res) => {
  try {
    const { keepCount = 10 } = req.body;

    logger.audit('Backups antigos limpos', req.user.id, {
      keepCount,
      tipo: req.user.tipo
    });

    const result = cleanOldBackups('./backups', keepCount);
    res.json({
      message: 'Backups antigos limpos com sucesso',
      ...result
    });
  } catch (error) {
    logger.error('Erro ao limpar backups antigos', {
      error: error.message,
      userId: req.user.id
    });
    res.status(500).json({
      message: 'Erro ao limpar backups antigos',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

module.exports = router;

