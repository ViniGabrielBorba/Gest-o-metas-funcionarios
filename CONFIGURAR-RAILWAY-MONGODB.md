# 🔧 Como Configurar MONGODB_URI no Railway

## ⚠️ PROBLEMA ATUAL

O erro `ECONNREFUSED 127.0.0.1:27017` significa que a variável `MONGODB_URI` **NÃO está configurada** no Railway.

---

## ✅ SOLUÇÃO: Passo a Passo

### **PASSO 1: Obter String de Conexão do MongoDB Atlas**

1. **Acesse:** https://www.mongodb.com/cloud/atlas
2. **Faça login** na sua conta
3. No dashboard, clique no botão **"Connect"** (ao lado do seu cluster)
4. Escolha **"Connect your application"**
5. Copie a string que aparece (algo como):
   ```
   mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **IMPORTANTE:** Adicione `/gestao-metas` antes do `?`:
   ```
   mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/gestao-metas?retryWrites=true&w=majority
   ```

**Se você não tem MongoDB Atlas ainda:**
- Veja o arquivo `SOLUCAO-MONGODB.md` para criar uma conta gratuita

---

### **PASSO 2: Configurar no Railway**

1. **Acesse:** https://railway.app
2. **Faça login** e abra seu projeto
3. No menu lateral, clique em **"Variables"** (ou vá em **Settings → Variables**)
4. Clique no botão **"+ New Variable"** ou **"Add Variable"**

5. **Adicione cada variável uma por uma:**

   **Variável 1: MONGODB_URI**
   - **Name:** `MONGODB_URI`
   - **Value:** Cole a string que você copiou do MongoDB Atlas (com `/gestao-metas`)
   - Clique em **"Add"** ou **"Save"**

   **Variável 2: JWT_SECRET**
   - **Name:** `JWT_SECRET`
   - **Value:** `secret_key_gestao_metas_producao_2024` (ou qualquer string aleatória)
   - Clique em **"Add"** ou **"Save"**

   **Variável 3: NODE_ENV**
   - **Name:** `NODE_ENV`
   - **Value:** `production`
   - Clique em **"Add"** ou **"Save"**

---

### **PASSO 3: Verificar Network Access no MongoDB Atlas**

1. No MongoDB Atlas, vá em **"Network Access"** (menu lateral)
2. Clique em **"Add IP Address"**
3. Selecione **"Allow Access from Anywhere"** (isso adiciona `0.0.0.0/0`)
4. Clique em **"Confirm"**

⚠️ **Isso permite que o Railway acesse seu banco de dados**

---

### **PASSO 4: Fazer Deploy**

1. No Railway, depois de adicionar as variáveis:
   - O Railway deve **reiniciar automaticamente** o serviço
   - Ou você pode clicar em **"Redeploy"** no menu

2. **Verifique os logs:**
   - Clique em **"Deployments"** ou **"Logs"**
   - Você deve ver:
     ```
     🔍 Verificando configuração MongoDB...
     ✅ MONGODB_URI encontrada: mongodb+srv://***@cluster0.xxxxx.mongodb.net/...
     ✅ MongoDB conectado com sucesso!
     📦 Database: gestao-metas
     ```

---

## 🎯 Checklist

- [ ] String de conexão copiada do MongoDB Atlas
- [ ] String contém `/gestao-metas` antes do `?`
- [ ] Variável `MONGODB_URI` adicionada no Railway
- [ ] Variável `JWT_SECRET` adicionada no Railway
- [ ] Variável `NODE_ENV` adicionada no Railway
- [ ] Network Access configurado no MongoDB Atlas (0.0.0.0/0)
- [ ] Railway reiniciou após adicionar variáveis
- [ ] Logs mostram "✅ MongoDB conectado com sucesso!"

---

## 🆘 Ainda com erro?

Se ainda aparecer o erro:

1. **Verifique se a string de conexão está correta:**
   - Deve começar com `mongodb+srv://`
   - Deve ter `/gestao-metas` antes do `?`
   - Usuário e senha devem estar corretos

2. **Verifique Network Access:**
   - MongoDB Atlas → Network Access
   - Deve ter `0.0.0.0/0` (Allow Access from Anywhere)

3. **Verifique se as variáveis foram salvas:**
   - Railway → Variables
   - Confirme que `MONGODB_URI` aparece na lista

4. **Verifique os logs detalhados:**
   - Railway → Deployments → Clique no último deploy → Veja os logs
   - Os logs agora mostram se a variável foi encontrada ou não

---

## 📝 Exemplo de String de Conexão Correta

```
mongodb+srv://gerente:32668633@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority&appName=Cluster0
```

**Partes importantes:**
- `mongodb+srv://` - protocolo
- `gerente:32668633` - usuário:senha (substitua pelos seus)
- `@cluster0.gbemu6i.mongodb.net` - endereço do cluster
- `/gestao-metas` - **nome do banco de dados** (OBRIGATÓRIO!)
- `?retryWrites=true&w=majority` - parâmetros de conexão

---

Precisa de mais ajuda? Os logs do Railway agora mostram exatamente o que está faltando!

