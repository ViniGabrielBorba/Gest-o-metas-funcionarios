const nodemailer = require('nodemailer');
const logger = require('./logger');

// Configurar transporter de email
const createTransporter = () => {
  // Se tiver configuração SMTP, usar
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true', // true para 465, false para outras portas
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  
  // Se não tiver configuração, usar Ethereal (apenas para desenvolvimento)
  // Em produção, deve configurar SMTP
  logger.warn('SMTP não configurado. Emails não serão enviados em produção.');
  return null;
};

const transporter = createTransporter();

// Função para enviar email
const sendEmail = async (options) => {
  if (!transporter) {
    logger.warn('Tentativa de enviar email mas SMTP não está configurado', options);
    // Em desenvolvimento, apenas logar
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Email simulado (SMTP não configurado):', {
        to: options.to,
        subject: options.subject,
        text: options.text
      });
      return { messageId: 'simulated-email' };
    }
    throw new Error('Serviço de email não configurado');
  }
  
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
    
    logger.info('Email enviado com sucesso', {
      to: options.to,
      subject: options.subject,
      messageId: info.messageId
    });
    
    return info;
  } catch (error) {
    logger.error('Erro ao enviar email', {
      error: error.message,
      to: options.to,
      subject: options.subject
    });
    throw error;
  }
};

// Template de email para recuperação de senha
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-senha?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Recuperação de Senha</h1>
        </div>
        <div class="content">
          <p>Olá,</p>
          <p>Você solicitou a recuperação de senha para sua conta no FlowGest.</p>
          <p>Clique no botão abaixo para redefinir sua senha:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </p>
          <p>Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          <p><strong>Este link expira em 1 hora.</strong></p>
          <p>Se você não solicitou esta recuperação de senha, ignore este email.</p>
        </div>
        <div class="footer">
          <p>Este é um email automático, não responda.</p>
          <p>&copy; ${new Date().getFullYear()} FlowGest - Sistema de Gestão de Metas</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Recuperação de Senha
    
    Você solicitou a recuperação de senha para sua conta no FlowGest.
    
    Clique no link abaixo para redefinir sua senha:
    ${resetUrl}
    
    Este link expira em 1 hora.
    
    Se você não solicitou esta recuperação de senha, ignore este email.
  `;
  
  return sendEmail({
    to: email,
    subject: 'Recuperação de Senha - FlowGest',
    text,
    html
  });
};

// Template de email para verificação de email
const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verificar-email?token=${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 5px 5px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verificação de Email</h1>
        </div>
        <div class="content">
          <p>Olá,</p>
          <p>Bem-vindo ao FlowGest!</p>
          <p>Para ativar sua conta, por favor verifique seu email clicando no botão abaixo:</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verificar Email</a>
          </p>
          <p>Ou copie e cole o link abaixo no seu navegador:</p>
          <p style="word-break: break-all; color: #667eea;">${verifyUrl}</p>
          <p><strong>Este link expira em 24 horas.</strong></p>
        </div>
        <div class="footer">
          <p>Este é um email automático, não responda.</p>
          <p>&copy; ${new Date().getFullYear()} FlowGest - Sistema de Gestão de Metas</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
    Verificação de Email
    
    Bem-vindo ao FlowGest!
    
    Para ativar sua conta, por favor verifique seu email clicando no link abaixo:
    ${verifyUrl}
    
    Este link expira em 24 horas.
  `;
  
  return sendEmail({
    to: email,
    subject: 'Verifique seu email - FlowGest',
    text,
    html
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendVerificationEmail
};

