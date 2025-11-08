#!/usr/bin/env node

/**
 * Wrapper seguro para iniciar o servidor
 * Captura erros e garante que o processo não encerre inesperadamente
 */

// Capturar erros não tratados ANTES de qualquer coisa
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  console.error('Stack:', error.stack);
  // Não encerrar - apenas logar
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason?.message || reason);
  if (reason?.stack) {
    console.error('Stack:', reason.stack);
  }
  // Não encerrar - apenas logar
});

// Tentar iniciar o servidor
try {
  require('./backend/server.js');
  console.log('✅ Servidor iniciado com sucesso');
} catch (error) {
  console.error('❌ Erro ao iniciar servidor:', error.message);
  console.error('Stack:', error.stack);
  // Não fazer exit(1) - deixar o processo mostrar o erro
  // O processo irá encerrar naturalmente se não houver nada rodando
}

