# 📋 Passo a Passo - Deploy do Sistema FlowGest

Este guia vai te ajudar a fazer o deploy do sistema corretamente, passo a passo.

---

## 🔴 PASSO 1: Verificar o Problema Atual

### 1.1 Acesse seu serviço de hosting
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io

### 1.2 Verifique os logs do deploy
- Procure por mensagens de erro
- Veja se há algum erro específico mencionado

### 1.3 Anote os erros encontrados
- Exemplo: "JWT_SECRET não está configurado"
- Exemplo: "Cannot connect to MongoDB"
- Exemplo: "Module not found"

---

## 🟡 PASSO 2: Configurar Variáveis de Ambiente

### 2.1 Gerar JWT_SECRET

**No seu computador (PowerShell ou Terminal):**

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Linux/Mac
openssl rand -base64 32
```

**Copie o resultado** - você vai usar isso no próximo passo.

**Exemplo de resultado:**
```
abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567yz890
```

### 2.2 Adicionar Variáveis no Serviço de Hosting

#### 📦 Railway

1. Acesse https://railway.app
2. Selecione seu projeto
3. Clique em **Settings** (Configurações)
4. Clique em **Variables** (Variáveis)
5. Clique em **+ New Variable** (Nova Variável)

**Adicione cada uma das seguintes variáveis:**

| Nome | Valor | Obrigatório |
|------|-------|-------------|
| `JWT_SECRET` | [cole o valor gerado no passo 2.1] | ✅ SIM |
| `MONGODB_URI` | `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/gestao-metas` | ✅ SIM |
| `NODE_ENV` | `production` | ⚠️ Recomendado |
| `FRONTEND_URL` | `https://seu-frontend.vercel.app` | ⚠️ Se usar CORS |
| `LOG_LEVEL` | `info` | ❌ Opcional |
| `PORT` | (deixe vazio - Railway define automaticamente) | ❌ Opcional |

6. Clique em **Add** para cada variável
7. **IMPORTANTE**: Clique em **Save** ou **Deploy** após adicionar todas

#### 🌐 Render

1. Acesse https://render.com
2. Selecione seu serviço
3. Clique em **Environment** (Ambiente)
4. Clique em **Add Environment Variable** (Adicionar Variável de Ambiente)

**Adicione as mesmas variáveis da tabela acima**

5. Clique em **Save Changes** (Salvar Alterações)

#### 🚀 Fly.io

No terminal do seu computador:

```bash
fly secrets set JWT_SECRET="cole-o-valor-gerado-aqui"
fly secrets set MONGODB_URI="mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/gestao-metas"
fly secrets set NODE_ENV="production"
fly secrets set FRONTEND_URL="https://seu-frontend.vercel.app"
```

---

## 🟢 PASSO 3: Configurar MongoDB

### 3.1 Obter String de Conexão do MongoDB Atlas

1. Acesse https://cloud.mongodb.com
2. Faça login na sua conta
3. Clique no seu **Cluster**
4. Clique em **Connect** (Conectar)
5. Escolha **Connect your application** (Conectar sua aplicação)
6. Copie a string de conexão

**Exemplo:**
```
mongodb+srv://usuario:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 3.2 Substituir a Senha

1. Substitua `<password>` pela sua senha real do MongoDB
2. Adicione o nome do banco no final: `/gestao-metas`

**Resultado final:**
```
mongodb+srv://usuario:minhasenha123@cluster0.xxxxx.mongodb.net/gestao-metas?retryWrites=true&w=majority
```

### 3.3 Liberar Acesso de Rede

1. No MongoDB Atlas, vá em **Network Access** (Acesso de Rede)
2. Clique em **Add IP Address** (Adicionar Endereço IP)
3. Clique em **Allow Access from Anywhere** (Permitir acesso de qualquer lugar)
4. Ou adicione o IP do seu serviço de hosting
5. Clique em **Confirm** (Confirmar)

### 3.4 Adicionar no Serviço de Hosting

1. Volte para o passo 2.2
2. Adicione a variável `MONGODB_URI` com a string completa

---

## 🔵 PASSO 4: Verificar Dependências

### 4.1 Verificar package.json

Certifique-se de que o `backend/package.json` tem todas as dependências:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "joi": "^17.11.0",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "helmet": "^7.1.0",
    "winston": "^3.11.0",
    "morgan": "^1.10.0",
    "nodemailer": "^6.9.7",
    "compression": "^1.7.4",
    "puppeteer": "^21.6.1",
    "exceljs": "^4.4.0",
    "csv-writer": "^1.6.0",
    "node-cron": "^3.0.3"
  }
}
```

### 4.2 Verificar Procfile

O `Procfile` na raiz do projeto deve ter:

```
web: node server-start.js
```

### 4.3 Verificar package.json raiz

O `package.json` na raiz deve ter:

```json
{
  "scripts": {
    "start": "node server-start.js"
  }
}
```

---

## 🟣 PASSO 5: Fazer Deploy

### 5.1 Railway

1. Após adicionar todas as variáveis
2. O Railway vai fazer deploy automaticamente
3. Aguarde alguns minutos
4. Verifique os logs em **Deployments** (Implantações)

### 5.2 Render

1. Após adicionar todas as variáveis
2. Clique em **Manual Deploy** (Deploy Manual)
3. Ou aguarde o deploy automático
4. Verifique os logs em **Logs** (Registros)

### 5.3 Fly.io

```bash
fly deploy
```

---

## 🟠 PASSO 6: Verificar se Funcionou

### 6.1 Testar Health Check

Abra o navegador ou use curl:

```
GET https://seu-backend.railway.app/health
```

**Ou use curl:**
```bash
curl https://seu-backend.railway.app/health
```

**Resposta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2024-12-01T10:00:00.000Z",
  "uptime": 123.45,
  "database": "connected",
  "environment": "production"
}
```

### 6.2 Testar Rota de Teste

```
GET https://seu-backend.railway.app/api/test
```

**Resposta esperada:**
```json
{
  "message": "API funcionando!"
}
```

### 6.3 Verificar Logs

1. Acesse os logs do seu serviço
2. Procure por mensagens como:
   - ✅ "Servidor rodando em http://..."
   - ✅ "MongoDB conectado com sucesso!"
   - ❌ "JWT_SECRET não está configurado"
   - ❌ "Erro ao conectar ao MongoDB"

---

## 🔴 PASSO 7: Resolver Problemas Comuns

### Problema 1: "JWT_SECRET não está configurado"

**Solução:**
1. Volte para o PASSO 2
2. Gere um novo JWT_SECRET
3. Adicione no serviço de hosting
4. Faça deploy novamente

### Problema 2: "Cannot connect to MongoDB"

**Solução:**
1. Verifique se a string de conexão está correta
2. Verifique se o IP está liberado no MongoDB Atlas
3. Verifique se usuário e senha estão corretos
4. Teste a conexão localmente primeiro

### Problema 3: "Module not found"

**Solução:**
1. Verifique se todas as dependências estão no `package.json`
2. O serviço deve instalar automaticamente com `npm install`
3. Verifique os logs de instalação

### Problema 4: "Port already in use"

**Solução:**
1. O serviço de hosting geralmente define a porta automaticamente
2. Não defina a variável `PORT` manualmente
3. Deixe o serviço gerenciar isso

### Problema 5: "CORS error"

**Solução:**
1. Adicione a variável `FRONTEND_URL` com a URL exata do frontend
2. Não inclua barra final (/) no final da URL
3. Exemplo: `https://meu-app.vercel.app` (correto)
4. Exemplo: `https://meu-app.vercel.app/` (errado)

---

## 🟢 PASSO 8: Configurar Email (Opcional)

Se quiser usar recuperação de senha e verificação de email:

### 8.1 Configurar Gmail

1. Acesse https://myaccount.google.com/apppasswords
2. Crie uma "Senha de App"
3. Copie a senha gerada

### 8.2 Adicionar Variáveis

| Nome | Valor | Exemplo |
|------|-------|---------|
| `SMTP_HOST` | `smtp.gmail.com` | - |
| `SMTP_PORT` | `587` | - |
| `SMTP_SECURE` | `false` | - |
| `SMTP_USER` | Seu email Gmail | `seuemail@gmail.com` |
| `SMTP_PASS` | Senha de App gerada | `abcd efgh ijkl mnop` |
| `SMTP_FROM` | Seu email Gmail | `seuemail@gmail.com` |

### 8.3 Testar

1. Faça deploy novamente
2. Tente fazer recuperação de senha
3. Verifique se o email foi enviado

---

## 📝 Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] JWT_SECRET configurado
- [ ] MONGODB_URI configurado
- [ ] NODE_ENV=production configurado
- [ ] FRONTEND_URL configurado (se usar CORS)
- [ ] IP liberado no MongoDB Atlas
- [ ] Health check retorna "OK"
- [ ] Rota /api/test funciona
- [ ] Logs não mostram erros críticos
- [ ] Servidor está rodando
- [ ] Banco de dados está conectado

---

## 🆘 Ainda com Problemas?

### 1. Verifique os Logs

Os logs vão mostrar exatamente o que está errado:
- Railway: **Deployments** → Clique no deploy → **View Logs**
- Render: **Logs** na página do serviço
- Fly.io: `fly logs`

### 2. Teste Localmente Primeiro

```bash
# No seu computador
cd C:\Users\vinicius\Desktop\gerente
npm install
node server-start.js
```

Se funcionar localmente, o problema está na configuração do serviço de hosting.

### 3. Verifique Variáveis de Ambiente

Certifique-se de que:
- Todas as variáveis estão escritas corretamente
- Não há espaços extras
- Valores estão entre aspas se necessário
- JWT_SECRET é uma string longa (32+ caracteres)

### 4. Contate o Suporte

Se nada funcionar:
1. Copie os logs de erro
2. Anote quais variáveis você configurou
3. Entre em contato com o suporte do serviço de hosting

---

## 📞 Links Úteis

- **Railway**: https://railway.app
- **Render**: https://render.com
- **Fly.io**: https://fly.io
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Documentação**: Veja `CONFIGURACAO-DEPLOY.md`

---

## ✅ Próximos Passos Após Deploy Bem-Sucedido

1. **Teste todas as rotas da API**
2. **Configure o frontend para usar a URL do backend**
3. **Teste login e cadastro**
4. **Configure backups automáticos** (se disponível)
5. **Monitore os logs regularmente**

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0

