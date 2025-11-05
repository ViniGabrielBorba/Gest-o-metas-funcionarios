# 🔧 Atualizar MONGODB_URI no Render com a Nova Senha

## ✅ String de Conexão Completa

Com a senha `SvkOGD74ezyUzpb6`, a string de conexão fica:

```
mongodb+srv://gerente:SvkOGD74ezyUzpb6@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

---

## 📋 Passo a Passo para Atualizar no Render

### **1. Acessar Environment Variables**

1. No Render, vá em seu **Web Service** (`sistema-gestao-backend`)
2. No menu lateral ou no topo, clique em **"Environment"** ou **"Environment Variables"**

---

### **2. Encontrar e Editar MONGODB_URI**

1. Na lista de variáveis, encontre **`MONGODB_URI`**
2. Clique nos **três pontos (...)** ou no botão **"Edit"** ao lado dela
3. **OU** clique em **"Add Environment Variable"** se não existir ainda

---

### **3. Atualizar o Valor**

**Key:** `MONGODB_URI`

**Value:** Cole esta string completa:
```
mongodb+srv://gerente:SvkOGD74ezyUzpb6@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

⚠️ **IMPORTANTE:** Copie a string completa acima, incluindo tudo!

---

### **4. Salvar**

1. Clique em **"Save"** ou **"Update"** ou **"Add"**
2. O Render vai fazer **redeploy automático** (ou você verá um botão para fazer deploy manual)

---

### **5. Aguardar Redeploy**

1. Aguarde 2-3 minutos
2. Você pode ver o progresso em **"Events"** ou **"Logs"**

---

### **6. Verificar se Funcionou**

1. Vá em **"Logs"** no Render
2. Você deve ver:
   ```
   🔍 Verificando configuração MongoDB...
   ✅ MONGODB_URI encontrada: mongodb+srv://***@cluster0.gbemu6i.mongodb.net/...
   ✅ MongoDB conectado com sucesso!
   📦 Database: gestao-metas
   🚀 Servidor rodando na porta 8080
   ```

3. **Teste a API:**
   - Acesse: `https://sua-url.onrender.com/api/test`
   - Deve aparecer: `{"message":"API funcionando!"}`

---

## ✅ Checklist

- [ ] Acessou Render → Web Service → Environment Variables
- [ ] Encontrou/Editou variável `MONGODB_URI`
- [ ] Colou a string completa com a senha
- [ ] Salvou as alterações
- [ ] Aguardou redeploy (2-3 minutos)
- [ ] Verificou logs - deve aparecer "MongoDB conectado"
- [ ] Testou `/api/test` - deve funcionar

---

## 🎯 String de Conexão Completa (Para Copiar)

```
mongodb+srv://gerente:SvkOGD74ezyUzpb6@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

---

## 🆘 Se Ainda Não Funcionar

### **Verificar se a String Está Correta:**

- ✅ Deve começar com `mongodb+srv://`
- ✅ Deve ter `gerente:SvkOGD74ezyUzpb6` (usuário:senha)
- ✅ Deve ter `@cluster0.gbemu6i.mongodb.net`
- ✅ Deve ter `/gestao-metas` antes do `?` (OBRIGATÓRIO!)
- ✅ Deve ter `?appName=Cluster0` no final

### **Verificar Network Access:**

1. MongoDB Atlas → Network Access
2. Deve ter `0.0.0.0/0` na lista
3. Status deve ser "Active"

### **Verificar Database Access:**

1. MongoDB Atlas → Database Access
2. Usuário `gerente` deve existir
3. Senha deve ser `SvkOGD74ezyUzpb6`

---

## 💡 Dica

Depois de atualizar, o Render faz redeploy automaticamente. Se não fizer:

1. Clique em **"Manual Deploy"** → **"Deploy latest commit"**
2. Aguarde 2-3 minutos

---

**Depois de atualizar com essa senha, deve funcionar!** 🎉

Me avise se funcionou ou se ainda tem algum erro!

