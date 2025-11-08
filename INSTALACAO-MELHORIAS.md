# 🚀 Guia de Instalação das Melhorias

Este guia explica como instalar e configurar todas as melhorias implementadas no sistema FlowGest.

## 📋 Pré-requisitos

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB (local ou Atlas)

## 🔧 Instalação

### 1. Instalar Dependências

```bash
npm install
```

Isso instalará todas as novas dependências adicionadas:
- `joi` - Validação de dados
- `express-rate-limit` - Rate limiting
- `helmet` - Segurança HTTP
- `winston` - Logging
- `nodemailer` - Envio de emails
- `exceljs` - Exportação Excel
- `csv-writer` - Exportação CSV
- `jest` - Testes
- E outras...

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Obrigatórias
JWT_SECRET=sua-chave-secreta-aqui
MONGODB_URI=mongodb://localhost:27017/gestao-metas

# Opcionais (mas recomendadas)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha
SMTP_FROM=seu-email@gmail.com
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=info
NODE_ENV=development
```

#### Gerar JWT_SECRET seguro:

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. Configurar Email (Opcional)

Para usar recuperação de senha e verificação de email, configure o SMTP:

#### Gmail:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app
```

**Nota**: Para Gmail, você precisa criar uma "Senha de App" em https://myaccount.google.com/apppasswords

#### SendGrid:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=sua-api-key-sendgrid
```

### 4. Iniciar o Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

### 5. Verificar se está funcionando

```bash
# Health check
curl http://localhost:5000/health

# Deve retornar:
# {
#   "status": "OK",
#   "timestamp": "...",
#   "uptime": ...,
#   "database": "connected",
#   "environment": "development"
# }
```

## 🧪 Testes

### Executar Testes

```bash
# Todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Com coverage
npm run test:coverage
```

### Configurar Banco de Testes

Crie um arquivo `.env.test`:

```env
JWT_SECRET=test-secret-key
MONGODB_URI_TEST=mongodb://localhost:27017/gestao-metas-test
NODE_ENV=test
```

## 📊 Funcionalidades

### 1. Recuperação de Senha

**Solicitar recuperação:**
```bash
POST /api/auth/recuperar-senha
{
  "email": "usuario@example.com"
}
```

**Redefinir senha:**
```bash
POST /api/auth/reset-senha
{
  "token": "token-do-email",
  "senha": "NovaSenha123!@#"
}
```

### 2. Verificação de Email

**Verificar email:**
```bash
GET /api/auth/verificar-email/:token
```

**Reenviar verificação:**
```bash
POST /api/auth/reenviar-verificacao
Authorization: Bearer SEU_TOKEN
```

### 3. Backup

**Criar backup:**
```bash
POST /api/backup/create
Authorization: Bearer SEU_TOKEN
```

**Listar backups:**
```bash
GET /api/backup/list
Authorization: Bearer SEU_TOKEN
```

**Restaurar backup:**
```bash
POST /api/backup/restore
Authorization: Bearer SEU_TOKEN
{
  "backupDir": "./backups/backup-2024-12-01T10-00-00-000Z"
}
```

### 4. Exportação de Dados

**Exportar funcionários para Excel:**
```bash
GET /api/export/funcionarios/excel
Authorization: Bearer SEU_TOKEN
```

**Exportar funcionários para CSV:**
```bash
GET /api/export/funcionarios/csv
Authorization: Bearer SEU_TOKEN
```

**Exportar vendas para Excel:**
```bash
GET /api/export/vendas/excel?mes=12&ano=2024
Authorization: Bearer SEU_TOKEN
```

### 5. Paginação

**Listar funcionários com paginação:**
```bash
GET /api/funcionarios?page=1&pageSize=20&search=nome&funcao=Vendedor
Authorization: Bearer SEU_TOKEN
```

## 🔍 Logs

Os logs são salvos em `backend/logs/`:

- `error.log` - Apenas erros
- `combined.log` - Todos os logs
- `exceptions.log` - Exceções não tratadas
- `rejections.log` - Promises rejeitadas

## 📦 Backups

Os backups são salvos em `backend/backups/`:

```
backups/
  backup-2024-12-01T10-00-00-000Z/
    metadata.json
    gerentes.json
    funcionarios.json
    metas.json
    ...
```

## ⚠️ Problemas Comuns

### 1. JWT_SECRET não configurado

**Erro**: `JWT_SECRET não está configurado!`

**Solução**: Adicione `JWT_SECRET` no arquivo `.env`

### 2. Email não está sendo enviado

**Causa**: SMTP não configurado ou credenciais inválidas

**Solução**: 
- Verifique as configurações SMTP no `.env`
- Em desenvolvimento, emails são apenas logados
- Verifique os logs em `backend/logs/combined.log`

### 3. Erro ao criar backup

**Causa**: Permissões de escrita ou diretório não existe

**Solução**: 
- Verifique permissões do diretório `backend/backups/`
- O diretório será criado automaticamente na primeira execução

### 4. Testes falhando

**Causa**: Banco de testes não configurado

**Solução**: 
- Crie arquivo `.env.test`
- Configure `MONGODB_URI_TEST`
- Execute `npm test`

## 🚀 Deploy

### Variáveis de Ambiente para Produção

Certifique-se de configurar todas as variáveis de ambiente no seu provedor de hosting:

- `JWT_SECRET` (obrigatório)
- `MONGODB_URI` (obrigatório)
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` (opcional, mas recomendado)
- `FRONTEND_URL` (obrigatório se usar CORS)
- `NODE_ENV=production`

### Railway/Render/Fly.io

Adicione as variáveis de ambiente no painel do provedor.

## 📚 Documentação Adicional

- [MELHORIAS-IMPLEMENTADAS.md](./MELHORIAS-IMPLEMENTADAS.md) - Detalhes das melhorias
- [MELHORIAS-SUGERIDAS.md](./MELHORIAS-SUGERIDAS.md) - Lista completa de melhorias

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs em `backend/logs/`
2. Verifique o health check: `GET /health`
3. Verifique as variáveis de ambiente
4. Consulte a documentação das melhorias

---

**Última atualização**: Dezembro 2024

