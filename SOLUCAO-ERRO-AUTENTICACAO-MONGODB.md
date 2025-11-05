# 🔧 Solução: Erro "Autenticação Incorreta" - MongoDB Atlas

## ✅ Boa Notícia!

O erro mudou de "IP não está na whitelist" para **"autenticação incorreta"**!

Isso significa que:
- ✅ O Network Access está funcionando (consegue se conectar ao servidor)
- ❌ O problema agora é **usuário e/ou senha incorretos**

---

## 🔍 Verificar e Corrigir Usuário/Senha

### **PASSO 1: Verificar se o Usuário Existe**

1. **Acesse:** https://www.mongodb.com/cloud/atlas
2. **Faça login**
3. No menu lateral, clique em **"Database Access"** (não Network Access!)
4. Procure pelo usuário **`gerente`** na lista

---

### **OPÇÃO A: Se o Usuário `gerente` NÃO EXISTE**

#### **Criar Novo Usuário:**

1. Clique em **"+ ADD DATABASE USER"** ou **"Add Database User"**
2. Preencha:
   - **Authentication Method:** `Password`
   - **Username:** `gerente`
   - **Password:** 
     - Clique em **"Autogenerate Secure Password"** (recomendado)
     - **OU** crie uma senha manualmente (ANOTE ELA!)
   - **Database User Privileges:** 
     - Escolha `Atlas admin` (acesso completo)
     - **OU** `Read and write to any database`
3. Clique em **"Add User"**
4. **COPIE A SENHA** que foi gerada (você vai precisar!)

⚠️ **IMPORTANTE:** Se você clicou em "Autogenerate", a senha aparece apenas UMA VEZ. Copie ela agora!

---

### **OPÇÃO B: Se o Usuário `gerente` JÁ EXISTE**

#### **Atualizar a Senha:**

1. Na lista de usuários, encontre **`gerente`**
2. Clique nos **três pontos (...)** ao lado do usuário
3. Escolha **"Edit"** ou **"Editar"**
4. Clique em **"Change Password"** ou **"Alterar Senha"**
5. Escolha:
   - **"Autogenerate Secure Password"** (recomendado)
   - **OU** crie uma senha manualmente (ANOTE ELA!)
6. Clique em **"Update User"** ou **"Atualizar Usuário"**
7. **COPIE A SENHA** que foi gerada!

⚠️ **IMPORTANTE:** Copie a senha agora, você não vai conseguir ver ela de novo!

---

## 🔧 Atualizar String de Conexão no Render

Agora que você tem a senha correta, precisa atualizar no Render:

### **PASSO 1: Criar Nova String de Conexão**

A string deve ser assim:

```
mongodb+srv://gerente:NOVA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

**Substitua** `NOVA_SENHA_AQUI` pela senha que você acabou de criar/copiar.

**Exemplo:**
Se a senha for `abc123xyz`, a string fica:
```
mongodb+srv://gerente:abc123xyz@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

⚠️ **IMPORTANTE:** 
- Se a senha tiver caracteres especiais (como `@`, `#`, `$`, etc.), você precisa **codificar** eles na URL
- Caracteres especiais comuns:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`
  - `&` → `%26`
  - `+` → `%2B`
  - `=` → `%3D`

**OU** use a senha gerada automaticamente (geralmente não tem caracteres problemáticos).

---

### **PASSO 2: Atualizar no Render**

1. No Render, vá em seu **Web Service**
2. Clique em **"Environment"** ou **"Environment Variables"**
3. Encontre a variável **`MONGODB_URI`**
4. Clique nos **três pontos (...)** ou **"Edit"**
5. Cole a nova string de conexão (com a senha correta)
6. Clique em **"Save"** ou **"Update"**

---

### **PASSO 3: Aguardar Redeploy**

1. O Render vai fazer **redeploy automático** (ou você pode clicar em "Manual Deploy")
2. Aguarde 2-3 minutos
3. Verifique os logs

---

## ✅ Verificar se Funcionou

1. No Render, vá em **"Logs"**
2. Você deve ver:
   ```
   🔍 Verificando configuração MongoDB...
   ✅ MONGODB_URI encontrada: mongodb+srv://***@cluster0.gbemu6i.mongodb.net/...
   ✅ MongoDB conectado com sucesso!
   📦 Database: gestao-metas
   ```
3. Teste a API: `https://sua-url.onrender.com/api/test`
4. Deve funcionar! 🎉

---

## 🆘 Se Ainda Não Funcionar

### **Problema 1: Esqueci a Senha**

**Solução:**
1. MongoDB Atlas → Database Access
2. Encontre o usuário `gerente`
3. Três pontos (...) → "Edit"
4. "Change Password" → Crie uma nova
5. Copie a senha
6. Atualize no Render

### **Problema 2: Senha tem Caracteres Especiais**

**Solução:**
1. Use a senha gerada automaticamente pelo MongoDB Atlas (sem caracteres especiais)
2. **OU** codifique os caracteres especiais na URL (veja tabela acima)

### **Problema 3: String de Conexão Está Errada**

**Verifique se tem:**
- ✅ `mongodb+srv://` no início
- ✅ `gerente:SENHA` (usuário:senha)
- ✅ `@cluster0.gbemu6i.mongodb.net`
- ✅ `/gestao-metas` antes do `?` (OBRIGATÓRIO!)
- ✅ `?appName=Cluster0` no final

**Exemplo Correto:**
```
mongodb+srv://gerente:minhasenha123@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

---

## 📝 Checklist

- [ ] Acessou MongoDB Atlas → Database Access
- [ ] Verificou se usuário `gerente` existe
- [ ] Criou usuário OU atualizou senha
- [ ] Copiou a senha gerada
- [ ] Criou string de conexão com a senha correta
- [ ] Atualizou `MONGODB_URI` no Render
- [ ] Aguardou redeploy (2-3 minutos)
- [ ] Verificou logs no Render
- [ ] Testou `/api/test`

---

## 💡 Dica: Usar Senha Simples

Para evitar problemas com caracteres especiais, ao criar/atualizar a senha:

1. **NÃO use "Autogenerate"** (pode ter caracteres especiais)
2. **Crie uma senha manualmente** com apenas:
   - Letras (a-z, A-Z)
   - Números (0-9)
   - Sem caracteres especiais

**Exemplo de senha simples:** `minhasenha123` ou `gestao2024`

---

## 🎯 Resumo Rápido

1. **MongoDB Atlas** → **Database Access**
2. **Verificar/Criar usuário `gerente`**
3. **Criar/Atualizar senha** (copiar!)
4. **Atualizar `MONGODB_URI` no Render** com a nova senha
5. **Aguardar redeploy**
6. **Testar**

---

**Depois de corrigir a senha, o erro deve desaparecer!** 🎉

Se ainda tiver problema, me avise qual passo específico está dando erro!

