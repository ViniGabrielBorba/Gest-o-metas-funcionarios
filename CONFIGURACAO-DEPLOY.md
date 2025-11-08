# ⚙️ Configuração para Deploy

Este documento explica como configurar as variáveis de ambiente necessárias para o deploy do sistema.

## 🔴 Variáveis Obrigatórias

### 1. JWT_SECRET (OBRIGATÓRIO)

**O que é:** Chave secreta para assinar tokens JWT. Sem ela, o sistema não funcionará.

**Como gerar:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Onde configurar:**
- Railway: Settings → Variables → Add Variable
- Render: Environment → Add Environment Variable
- Fly.io: `fly secrets set JWT_SECRET="sua-chave-aqui"`
- Vercel: Settings → Environment Variables

**Exemplo:**
```
JWT_SECRET=abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567yz
```

### 2. MONGODB_URI (OBRIGATÓRIO)

**O que é:** String de conexão do MongoDB.

**Formato:**
```
mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/gestao-metas?retryWrites=true&w=majority
```

**Onde obter:**
1. Acesse MongoDB Atlas
2. Clique em "Connect"
3. Escolha "Connect your application"
4. Copie a string de conexão
5. Substitua `<password>` pela sua senha

## 🟡 Variáveis Recomendadas

### 3. NODE_ENV

**Valor:** `production`

**Onde configurar:** Mesmos lugares acima

### 4. FRONTEND_URL

**O que é:** URL do frontend para configurar CORS.

**Exemplo:**
```
FRONTEND_URL=https://seu-app.vercel.app
```

### 5. PORT

**O que é:** Porta onde o servidor irá rodar.

**Valor padrão:** `5000`

**Nota:** A maioria dos serviços de hosting configura isso automaticamente.

### 6. LOG_LEVEL

**Valor:** `info` ou `error`

**Padrão:** `info`

## 🟢 Variáveis Opcionais (Email)

### 7. SMTP_HOST

**Exemplo:** `smtp.gmail.com` ou `smtp.sendgrid.net`

### 8. SMTP_PORT

**Valor:** `587` (geralmente)

### 9. SMTP_USER

**Exemplo:** `seu-email@gmail.com` ou `apikey` (para SendGrid)

### 10. SMTP_PASS

**Exemplo:** Senha do email ou API key do SendGrid

### 11. SMTP_FROM

**Exemplo:** `seu-email@gmail.com`

### 12. SMTP_SECURE

**Valor:** `false` (para porta 587) ou `true` (para porta 465)

## 📋 Checklist de Configuração

Antes de fazer deploy, verifique:

- [ ] JWT_SECRET configurado
- [ ] MONGODB_URI configurado
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL configurado (se usar CORS)
- [ ] SMTP configurado (se usar emails)

## 🚀 Deploy em Diferentes Plataformas

### Railway

1. Acesse seu projeto no Railway
2. Vá em Settings → Variables
3. Adicione cada variável:
   - Name: `JWT_SECRET`
   - Value: `sua-chave-gerada`
4. Clique em "Add"
5. Repita para todas as variáveis

### Render

1. Acesse seu serviço no Render
2. Vá em Environment
3. Clique em "Add Environment Variable"
4. Adicione cada variável:
   - Key: `JWT_SECRET`
   - Value: `sua-chave-gerada`
5. Clique em "Save Changes"

### Fly.io

```bash
fly secrets set JWT_SECRET="sua-chave-gerada"
fly secrets set MONGODB_URI="sua-string-de-conexao"
fly secrets set NODE_ENV="production"
fly secrets set FRONTEND_URL="https://seu-app.vercel.app"
```

### Vercel

1. Acesse seu projeto no Vercel
2. Vá em Settings → Environment Variables
3. Adicione cada variável:
   - Key: `JWT_SECRET`
   - Value: `sua-chave-gerada`
   - Environment: Production, Preview, Development
4. Clique em "Save"

## 🔍 Verificar Configuração

Após configurar, verifique se está tudo certo:

1. Faça deploy
2. Acesse o endpoint de health check:
   ```
   GET https://seu-backend.railway.app/health
   ```
3. Deve retornar:
   ```json
   {
     "status": "OK",
     "timestamp": "...",
     "uptime": ...,
     "database": "connected",
     "environment": "production"
   }
   ```

## ⚠️ Problemas Comuns

### Erro: "JWT_SECRET não está configurado"

**Solução:** Adicione a variável JWT_SECRET nas variáveis de ambiente do seu serviço de hosting.

### Erro: "Cannot connect to MongoDB"

**Solução:** 
1. Verifique se MONGODB_URI está correto
2. Verifique se o IP está liberado no MongoDB Atlas (0.0.0.0/0)
3. Verifique se usuário e senha estão corretos

### Erro: "CORS error"

**Solução:** Configure FRONTEND_URL com a URL exata do seu frontend (sem barra final).

### Erro: "Email não está sendo enviado"

**Solução:** 
1. Verifique se SMTP_HOST, SMTP_USER, SMTP_PASS estão configurados
2. Para Gmail, use "Senha de App" (não a senha normal)
3. Verifique se a porta está correta (587 para TLS, 465 para SSL)

## 📞 Suporte

Se tiver problemas:
1. Verifique os logs do servidor
2. Verifique o health check endpoint
3. Verifique se todas as variáveis estão configuradas
4. Consulte a documentação do serviço de hosting

---

**Última atualização**: Dezembro 2024

