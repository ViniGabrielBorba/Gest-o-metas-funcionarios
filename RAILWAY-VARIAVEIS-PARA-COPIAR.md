# 🚀 Variáveis de Ambiente para Copiar no Railway

## ⚡ CONFIGURAÇÃO RÁPIDA

Copie e cole estas variáveis no Railway → Variables:

---

### **Variável 1: MONGODB_URI**

**Name:** `MONGODB_URI`

**Value:** 
```
mongodb+srv://gerente:SUA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

⚠️ **IMPORTANTE:** Substitua `SUA_SENHA_AQUI` pela sua senha real do MongoDB Atlas.

---

### **Variável 2: JWT_SECRET**

**Name:** `JWT_SECRET`

**Value:**
```
secret_key_gestao_metas_producao_2024
```

---

### **Variável 3: NODE_ENV**

**Name:** `NODE_ENV`

**Value:**
```
production
```

---

### **Variável 4: FRONTEND_URL** (Opcional - configure depois)

**Name:** `FRONTEND_URL`

**Value:** 
```
https://seu-app.vercel.app
```

⚠️ **Configure esta variável depois que fizer o deploy do frontend no Vercel.**

---

## 📋 Como Adicionar no Railway

1. **Acesse:** https://railway.app
2. **Abra seu projeto**
3. **Clique em "Variables"** (menu lateral)
4. **Para cada variável:**
   - Clique em **"+ New Variable"** ou **"Add Variable"**
   - Cole o **Name** e **Value** acima
   - Clique em **"Add"** ou **"Save"**
5. **Aguarde o Railway reiniciar automaticamente**

---

## ✅ Verificar se Funcionou

Após adicionar as variáveis, verifique os logs:

1. No Railway, clique em **"Deployments"** ou **"Logs"**
2. Você deve ver:
   ```
   🔍 Verificando configuração MongoDB...
   ✅ MONGODB_URI encontrada: mongodb+srv://***@cluster0.gbemu6i.mongodb.net/...
   ✅ MongoDB conectado com sucesso!
   📦 Database: gestao-metas
   ```

---

## 🆘 Se a Senha Não Funcionar

Para configurar a senha:

1. **Acesse MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
2. **Vá em "Database Access"**
3. **Encontre o usuário "gerente"**
4. **Clique nos três pontos (...) → "Edit"**
5. **Crie uma nova senha** (ou use a atual se souber)
6. **Substitua na string acima** onde está `SUA_SENHA_AQUI`

**Exemplo com nova senha:**
```
mongodb+srv://gerente:NOVA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

---

## 🔒 Verificar Network Access

Antes de testar, certifique-se:

1. **MongoDB Atlas → "Network Access"**
2. **Deve ter:** `0.0.0.0/0` (Allow Access from Anywhere)
3. **Se não tiver, adicione:**
   - Clique em **"Add IP Address"**
   - Selecione **"Allow Access from Anywhere"**
   - Clique em **"Confirm"**

---

## 📝 Resumo das Variáveis

| Nome | Valor |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://gerente:SUA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0` |
| `JWT_SECRET` | `secret_key_gestao_metas_producao_2024` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://seu-app.vercel.app` (configure depois) |

---

**Pronto! Depois de adicionar essas variáveis, o Railway deve conectar ao MongoDB automaticamente!** 🎉

