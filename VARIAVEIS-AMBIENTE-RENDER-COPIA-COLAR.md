# 📋 Variáveis de Ambiente para Render - Copiar e Colar

## 🔑 Variáveis para Copiar

### **1. MONGODB_URI** ⚠️ **OBRIGATÓRIA**

**Key (Nome):**
```
MONGODB_URI
```

**Value (Valor):**
```
mongodb+srv://gerente:SvkOGD74ezyUzpb6@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

**⚠️ IMPORTANTE:** 
- Substitua `SvkOGD74ezyUzpb6` pela sua senha real do MongoDB Atlas se diferente
- Mantenha o resto exatamente como está

---

### **2. JWT_SECRET** ⚠️ **OBRIGATÓRIA**

**Key (Nome):**
```
JWT_SECRET
```

**Value (Valor):**
```
secret_key_gestao_metas_producao_2024
```

---

### **3. NODE_ENV** ✅ **RECOMENDADA**

**Key (Nome):**
```
NODE_ENV
```

**Value (Valor):**
```
production
```

---

### **4. FRONTEND_URL** ⚠️ **OPCIONAL** (Mas Recomendada)

**Key (Nome):**
```
FRONTEND_URL
```

**Value (Valor):**
```
https://gest-o-metas-funcionarios-89ed.vercel.app
```

**⚠️ IMPORTANTE:** 
- Substitua pela URL real do seu frontend no Vercel
- **SEM barra no final!**

---

## 📝 Como Adicionar no Render

### **Passo a Passo:**

1. **Acesse:** https://render.com
2. **Faça login**
3. **Clique no seu Web Service**
4. **Vá em "Settings"**
5. **Role até "Environment Variables"**
6. **Para cada variável:**
   - Clique em **"Add Environment Variable"**
   - **Key:** Cole o nome (ex: `MONGODB_URI`)
   - **Value:** Cole o valor completo
   - Clique em **"Save"**

---

## ✅ Checklist Completo

Adicione estas variáveis **na ordem**:

- [ ] **MONGODB_URI** = `mongodb+srv://gerente:SvkOGD74ezyUzpb6@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0`
- [ ] **JWT_SECRET** = `secret_key_gestao_metas_producao_2024`
- [ ] **NODE_ENV** = `production`
- [ ] **FRONTEND_URL** = `https://gest-o-metas-funcionarios-89ed.vercel.app` (ou sua URL do Vercel)

---

## 🔍 Verificar se Está Correto

### **No Render:**

1. **Settings** → **Environment Variables**
2. Você deve ver todas as 4 variáveis listadas
3. Verifique se os valores estão corretos (sem espaços extras)

### **Nos Logs:**

Após fazer deploy, nos logs você deve ver:
```
🔍 Verificando configuração MongoDB...
✅ MONGODB_URI encontrada: mongodb+srv://***@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
✅ MongoDB conectado com sucesso!
```

---

## 🆘 Se Não Funcionar

### **Verificar Senha do MongoDB:**

1. Acesse: https://cloud.mongodb.com
2. Vá em **Database Access**
3. Verifique a senha do usuário `gerente`
4. Se a senha for diferente, atualize `MONGODB_URI` com a senha correta

### **Verificar URL do Frontend:**

1. Acesse: https://vercel.com
2. Vá no seu projeto
3. Copie a URL principal (ex: `https://seu-app.vercel.app`)
4. Use essa URL em `FRONTEND_URL` (sem barra no final)

---

## 📋 Tabela Resumida

| Key | Value | Obrigatória? |
|-----|-------|--------------|
| `MONGODB_URI` | `mongodb+srv://gerente:SvkOGD74ezyUzpb6@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0` | ✅ SIM |
| `JWT_SECRET` | `secret_key_gestao_metas_producao_2024` | ✅ SIM |
| `NODE_ENV` | `production` | ⚠️ Recomendada |
| `FRONTEND_URL` | `https://gest-o-metas-funcionarios-89ed.vercel.app` | ⚠️ Opcional |

---

## 💡 Dica

**Copie e cole diretamente** - não digite manualmente para evitar erros de digitação!

---

**Depois de adicionar todas as variáveis, o Render vai fazer redeploy automaticamente!** 🎉

