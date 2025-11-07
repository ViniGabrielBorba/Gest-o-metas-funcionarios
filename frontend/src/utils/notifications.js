// Utilitário para gerenciar notificações do navegador

// Solicitar permissão para notificações
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador não suporta notificações');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Enviar notificação
export const sendNotification = (title, options = {}) => {
  if (!('Notification' in window)) {
    console.log('Notificações não suportadas');
    return;
  }

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // Fechar automaticamente após 5 segundos
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } else if (Notification.permission !== 'denied') {
    // Solicitar permissão
    requestNotificationPermission().then(permitted => {
      if (permitted) {
        sendNotification(title, options);
      }
    });
  }
};

// Notificação quando meta é atingida
export const notifyMetaBatida = (metaMes, excedente) => {
  sendNotification('🎯 Meta Batida!', {
    body: `Parabéns! A meta de ${metaMes} foi atingida! Excedente: R$ ${excedente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    tag: 'meta-batida',
    requireInteraction: true
  });
};

// Notificação de lembrete de tarefas pendentes
export const notifyTarefasPendentes = (quantidade) => {
  sendNotification('📋 Tarefas Pendentes', {
    body: `Você tem ${quantidade} ${quantidade === 1 ? 'tarefa pendente' : 'tarefas pendentes'}`,
    tag: 'tarefas-pendentes'
  });
};

// Notificação genérica
export const notify = (title, message, type = 'info') => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  sendNotification(`${icons[type] || ''} ${title}`, {
    body: message,
    tag: `notification-${type}`
  });
};

