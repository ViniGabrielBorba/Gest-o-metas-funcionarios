# 🚀 Deploy no Fly.io - Passos Rápidos

## ✅ Arquivos Já Configurados

Todos os arquivos necessários já foram criados e configurados:

- ✅ `fly.toml` - Configuração do Fly.io
- ✅ `Dockerfile` - Build da imagem Docker
- ✅ `.dockerignore` - Ignora arquivos desnecessários
- ✅ `package.json` - Com script `start` configurado

---

## 📋 Passos para Fazer Deploy

### **Opção 1: Via Dashboard do Fly.io (MAIS FÁCIL)**

1. **Acesse:** https://fly.io/dashboard
2. **Clique no seu app** (`gest-o-metas-funcionarios`)
3. **Clique em "Deploy"** ou **"Deploy latest commit"**
4. **Aguarde 2-5 minutos**
5. **Verifique os logs** para ver se funcionou

### **Opção 2: Via CLI (se tiver instalado)**

```powershell
# No diretório do projeto
cd C:\Users\vinicius\Desktop\gerente

# Fazer login (se ainda não fez)
flyctl auth login

# Fazer deploy
flyctl deploy
```

---

## 🔧 Configurar Variáveis de Ambiente

⚠️ **IMPORTANTE:** Configure as variáveis antes de fazer deploy!

### **Via Dashboard:**

1. No Fly.io Dashboard, vá em seu app
2. Clique em **"Secrets"** ou **"Environment Variables"**
3. Adicione cada variável:

| Nome | Valor |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://gerente:SUA_SENHA@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0` |
| `JWT_SECRET` | `secret_key_gestao_metas_producao_2024` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://seu-app.vercel.app` |

### **Via CLI:**

```powershell
flyctl secrets set MONGODB_URI="mongodb+srv://gerente:SUA_SENHA@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0"
flyctl secrets set JWT_SECRET="secret_key_gestao_metas_producao_2024"
flyctl secrets set NODE_ENV="production"
flyctl secrets set FRONTEND_URL="https://seu-app.vercel.app"
```

---

## ✅ Verificar se Funcionou

1. **Após o deploy, verifique a URL:**
   - No dashboard: `https://gest-o-metas-funcionarios.fly.dev`
   - Ou veja em "Settings" → "Hostname"

2. **Teste o backend:**
   - Acesse: `https://gest-o-metas-funcionarios.fly.dev/api/test`
   - Deve aparecer: `{"message":"API funcionando!"}`

3. **Verifique os logs:**
   - No dashboard, clique em "Logs"
   - Deve aparecer: `🚀 Servidor rodando na porta 8080`
   - E: `✅ MongoDB conectado com sucesso!`

---

## 🆘 Se Der Erro

### **Erro: "manifest.json not found"**

Já foi corrigido! Os arquivos estão corretos agora.

### **Erro: "Cannot connect to MongoDB"**

- Verifique se `MONGODB_URI` está configurada corretamente
- Verifique Network Access no MongoDB Atlas (0.0.0.0/0)

### **Erro no build**

- Verifique os logs no dashboard
- Certifique-se que o `package.json` está na raiz
- Certifique-se que `backend/server.js` existe

---

## 📝 Checklist Final

- [ ] Arquivos configurados (`fly.toml`, `Dockerfile`, `.dockerignore`)
- [ ] Variáveis de ambiente configuradas (`MONGODB_URI`, `JWT_SECRET`, etc.)
- [ ] Deploy realizado
- [ ] URL do backend obtida
- [ ] Teste `/api/test` funcionando
- [ ] Logs mostram "MongoDB conectado"
- [ ] `REACT_APP_API_URL` atualizado no Vercel

---

## 🎯 Próximo Passo

Depois que o backend estiver funcionando:

1. **Copie a URL do backend:** `https://gest-o-metas-funcionarios.fly.dev`
2. **No Vercel:**
   - Vá em Settings → Environment Variables
   - Atualize `REACT_APP_API_URL` para: `https://gest-o-metas-funcionarios.fly.dev/api`
3. **Faça novo deploy no Vercel** (ou aguarde deploy automático)

---

**Tudo está pronto! Agora é só fazer o deploy no dashboard do Fly.io!** 🚀

