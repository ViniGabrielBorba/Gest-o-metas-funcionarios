# 🔐 Variáveis de Ambiente Completas para Deploy

## 📋 Todas as Variáveis que Você Precisa Configurar

### ✅ 1. JWT_SECRET (OBRIGATÓRIO)

**Gerar:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Exemplo de valor gerado:**
```
abc123xyz789def456ghi012jkl345mno678pqr901stu234vwx567yz890
```

**Adicionar no serviço:**
- **Name**: `JWT_SECRET`
- **Value**: [cole o valor gerado acima]

---

### ✅ 2. MONGODB_URI (OBRIGATÓRIO)

**URI Completa:**
```
mongodb+srv://gerente:uPAO9DrzGPKU1DDq@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority
```

**Adicionar no serviço:**
- **Name**: `MONGODB_URI`
- **Value**: [cole a URI acima]

**⚠️ IMPORTANTE:**
- Libere o acesso de rede no MongoDB Atlas:
  1. Acesse https://cloud.mongodb.com
  2. Vá em **Network Access**
  3. Clique em **Add IP Address**
  4. Clique em **Allow Access from Anywhere**
  5. Clique em **Confirm**

---

### ⚠️ 3. NODE_ENV (RECOMENDADO)

**Valor:**
```
production
```

**Adicionar no serviço:**
- **Name**: `NODE_ENV`
- **Value**: `production`

---

### ⚠️ 4. FRONTEND_URL (SE USAR CORS)

**Valor:**
```
https://seu-frontend.vercel.app
```

**Adicionar no serviço:**
- **Name**: `FRONTEND_URL`
- **Value**: [URL do seu frontend, SEM barra final]

**Exemplo:**
- ✅ Correto: `https://meu-app.vercel.app`
- ❌ Errado: `https://meu-app.vercel.app/`

---

### ❌ 5. LOG_LEVEL (OPCIONAL)

**Valor:**
```
info
```

**Adicionar no serviço:**
- **Name**: `LOG_LEVEL`
- **Value**: `info`

---

## 📦 Como Adicionar no Railway

1. Acesse https://railway.app
2. Selecione seu projeto
3. Clique em **Settings** (Configurações)
4. Clique em **Variables** (Variáveis)
5. Para cada variável:
   - Clique em **+ New Variable**
   - **Name**: [nome da variável]
   - **Value**: [valor da variável]
   - Clique em **Add**
6. Clique em **Save** ou **Deploy**

---

## 🌐 Como Adicionar no Render

1. Acesse https://render.com
2. Selecione seu serviço
3. Clique em **Environment** (Ambiente)
4. Para cada variável:
   - Clique em **Add Environment Variable**
   - **Key**: [nome da variável]
   - **Value**: [valor da variável]
   - Clique em **Add**
5. Clique em **Save Changes**

---

## 🚀 Como Adicionar no Fly.io

No terminal do seu computador:

```bash
fly secrets set JWT_SECRET="cole-o-valor-gerado-aqui"
fly secrets set MONGODB_URI="mongodb+srv://gerente:uPAO9DrzGPKU1DDq@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority"
fly secrets set NODE_ENV="production"
fly secrets set FRONTEND_URL="https://seu-frontend.vercel.app"
```

---

## ✅ Checklist

Antes de fazer deploy, verifique:

- [ ] JWT_SECRET gerado e adicionado
- [ ] MONGODB_URI adicionada (com senha correta)
- [ ] Acesso de rede liberado no MongoDB Atlas
- [ ] NODE_ENV=production adicionado
- [ ] FRONTEND_URL adicionado (se usar CORS)
- [ ] Todas as variáveis salvas

---

## 🔍 Verificar se Funcionou

Após configurar e fazer deploy:

1. **Teste o Health Check:**
   ```
   GET https://seu-backend.railway.app/health
   ```

   **Deve retornar:**
   ```json
   {
     "status": "OK",
     "database": "connected"
   }
   ```

2. **Teste a Rota de Teste:**
   ```
   GET https://seu-backend.railway.app/api/test
   ```

   **Deve retornar:**
   ```json
   {
     "message": "API funcionando!"
   }
   ```

3. **Verifique os Logs:**
   - Procure por: "✅ MongoDB conectado com sucesso!"
   - Procure por: "🚀 Servidor rodando em http://..."

---

## 🆘 Problemas Comuns

### Erro: "JWT_SECRET não está configurado"
- **Solução**: Gere um novo JWT_SECRET e adicione no serviço

### Erro: "Cannot connect to MongoDB"
- **Solução**: 
  1. Verifique se a senha está correta
  2. Verifique se o acesso de rede está liberado
  3. Verifique se a URI está correta

### Erro: "CORS error"
- **Solução**: Adicione FRONTEND_URL com a URL exata (sem barra final)

---

## 📞 Ainda com Problemas?

1. Verifique os logs do servidor
2. Teste a conexão MongoDB localmente
3. Verifique se todas as variáveis estão configuradas
4. Consulte os guias:
   - `PASSO-A-PASSO-DEPLOY.md`
   - `CONFIGURAR-MONGODB-URI.md`
   - `CONFIGURACAO-DEPLOY.md`

---

**Última atualização**: Dezembro 2024

