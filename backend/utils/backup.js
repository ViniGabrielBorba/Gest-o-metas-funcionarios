const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Criar backup do banco de dados
 */
const createBackup = async (outputDir = './backups') => {
  try {
    // Criar diretório de backups se não existir
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(outputDir, `backup-${timestamp}`);
    fs.mkdirSync(backupDir, { recursive: true });

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const backupData = {
      timestamp: new Date().toISOString(),
      database: mongoose.connection.name,
      collections: []
    };

    // Fazer backup de cada coleção
    for (const collection of collections) {
      const collectionName = collection.name;
      
      // Pular coleções do sistema
      if (collectionName.startsWith('system.')) {
        continue;
      }

      const data = await db.collection(collectionName).find({}).toArray();
      
      // Salvar dados em arquivo JSON
      const filePath = path.join(backupDir, `${collectionName}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

      backupData.collections.push({
        name: collectionName,
        count: data.length,
        file: `${collectionName}.json`
      });

      logger.info(`Backup da coleção ${collectionName} criado`, {
        collection: collectionName,
        documents: data.length
      });
    }

    // Salvar metadata do backup
    const metadataPath = path.join(backupDir, 'metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(backupData, null, 2), 'utf8');

    logger.info('Backup criado com sucesso', {
      backupDir,
      collections: backupData.collections.length,
      totalDocuments: backupData.collections.reduce((sum, col) => sum + col.count, 0)
    });

    return {
      success: true,
      backupDir,
      metadata: backupData
    };
  } catch (error) {
    logger.error('Erro ao criar backup', { error: error.message, stack: error.stack });
    throw error;
  }
};

/**
 * Restaurar backup do banco de dados
 */
const restoreBackup = async (backupDir) => {
  try {
    if (!fs.existsSync(backupDir)) {
      throw new Error('Diretório de backup não encontrado');
    }

    const metadataPath = path.join(backupDir, 'metadata.json');
    if (!fs.existsSync(metadataPath)) {
      throw new Error('Arquivo de metadata não encontrado');
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const db = mongoose.connection.db;

    // Restaurar cada coleção
    for (const collection of metadata.collections) {
      const filePath = path.join(backupDir, collection.file);
      
      if (!fs.existsSync(filePath)) {
        logger.warn(`Arquivo de backup não encontrado: ${collection.file}`);
        continue;
      }

      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Limpar coleção existente
      await db.collection(collection.name).deleteMany({});

      // Inserir dados do backup
      if (data.length > 0) {
        await db.collection(collection.name).insertMany(data);
      }

      logger.info(`Coleção ${collection.name} restaurada`, {
        collection: collection.name,
        documents: data.length
      });
    }

    logger.info('Backup restaurado com sucesso', {
      backupDir,
      collections: metadata.collections.length
    });

    return {
      success: true,
      restoredCollections: metadata.collections.length
    };
  } catch (error) {
    logger.error('Erro ao restaurar backup', { error: error.message, stack: error.stack });
    throw error;
  }
};

/**
 * Listar backups disponíveis
 */
const listBackups = (backupDir = './backups') => {
  try {
    if (!fs.existsSync(backupDir)) {
      return [];
    }

    const backups = fs.readdirSync(backupDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('backup-'))
      .map(dirent => {
        const backupPath = path.join(backupDir, dirent.name);
        const metadataPath = path.join(backupPath, 'metadata.json');

        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          return {
            name: dirent.name,
            path: backupPath,
            timestamp: metadata.timestamp,
            collections: metadata.collections.length,
            totalDocuments: metadata.collections.reduce((sum, col) => sum + col.count, 0)
          };
        }

        return {
          name: dirent.name,
          path: backupPath,
          timestamp: dirent.name.replace('backup-', '').replace(/-/g, ':').slice(0, -5),
          collections: 0,
          totalDocuments: 0
        };
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return backups;
  } catch (error) {
    logger.error('Erro ao listar backups', { error: error.message });
    return [];
  }
};

/**
 * Deletar backup antigo
 */
const deleteBackup = (backupDir) => {
  try {
    if (fs.existsSync(backupDir)) {
      fs.rmSync(backupDir, { recursive: true, force: true });
      logger.info('Backup deletado', { backupDir });
      return { success: true };
    }
    return { success: false, message: 'Backup não encontrado' };
  } catch (error) {
    logger.error('Erro ao deletar backup', { error: error.message });
    throw error;
  }
};

/**
 * Limpar backups antigos (manter apenas os N mais recentes)
 */
const cleanOldBackups = (backupDir = './backups', keepCount = 10) => {
  try {
    const backups = listBackups(backupDir);
    
    if (backups.length <= keepCount) {
      return { deleted: 0, kept: backups.length };
    }

    const toDelete = backups.slice(keepCount);
    let deleted = 0;

    for (const backup of toDelete) {
      try {
        deleteBackup(backup.path);
        deleted++;
      } catch (error) {
        logger.error('Erro ao deletar backup', { backup: backup.name, error: error.message });
      }
    }

    logger.info('Backups antigos limpos', {
      deleted,
      kept: keepCount,
      total: backups.length
    });

    return { deleted, kept: keepCount };
  } catch (error) {
    logger.error('Erro ao limpar backups antigos', { error: error.message });
    throw error;
  }
};

module.exports = {
  createBackup,
  restoreBackup,
  listBackups,
  deleteBackup,
  cleanOldBackups
};

