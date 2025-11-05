# 🔧 Corrigir Erro: Render tentando executar `node server.js`

## ❌ Problema

O Render está tentando executar:
```
node server.js
```

Mas o arquivo correto é:
```
backend/server.js
```

---

## ✅ Solução Rápida

No Render, você precisa corrigir o **Start Command**.

---

## 🔧 Passo a Passo para Corrigir

### **1. Acessar o Render:**

1. **Acesse:** https://render.com
2. **Faça login**
3. **Clique no seu Web Service** (ex: `gest-o-metas-funcionarios-3`)

### **2. Ir para Settings:**

1. Clique em **"Settings"** (ou "Configurações")
2. Procure a seção **"Build & Deploy"**

### **3. Corrigir Start Command:**

1. Encontre o campo **"Start Command"**
2. **Apague** o que está lá (provavelmente `node server.js`)
3. **Digite:** `npm start`
4. **OU** digite: `node backend/server.js`

⚠️ **Recomendado:** Use `npm start` (é mais confiável)

### **4. Salvar:**

1. Clique em **"Save Changes"** (ou "Salvar")
2. O Render vai fazer **redeploy automaticamente**
3. Aguarde 2-3 minutos

---

## ✅ Verificar se Funcionou

### **1. Verificar Logs:**

No Render → **Logs**, você deve ver:

```
==> Executando 'npm start'
> sistema-gestao-metas@1.0.0 iniciar
> node backend/server.js

🚀 Servidor rodando em http://0.0.0.0:10000
✅ MongoDB conectado com sucesso!
```

### **2. Testar API:**

Abra no navegador:
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

Deve aparecer: `{"message":"API funcionando!"}`

---

## 📋 Configuração Correta Completa

### **Build & Deploy Settings:**

| Campo | Valor |
|-------|-------|
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` ⚠️ |
| **Root Directory** | (deixe vazio) |

---

## 🆘 Se Ainda Não Funcionar

### **Opção 1: Verificar Procfile**

O `Procfile` na raiz deve ter:
```
web: node backend/server.js
```

### **Opção 2: Verificar package.json**

O `package.json` na raiz deve ter:
```json
{
  "scripts": {
    "start": "node backend/server.js"
  }
}
```

### **Opção 3: Limpar Cache**

1. No Render → Settings
2. Procure por **"Clear build cache"**
3. Clique para limpar
4. Faça **"Manual Deploy"** novamente

---

## 💡 Por Que `npm start`?

**Vantagens:**
- ✅ Usa o script do `package.json` (já configurado)
- ✅ Mais confiável
- ✅ Funciona mesmo se a estrutura mudar

**Comando direto:**
- ⚠️ Precisa ajustar se estrutura mudar
- ⚠️ Pode dar erro se caminho estiver errado

---

## ✅ Checklist

- [ ] Acessei o Render
- [ ] Fui em Settings → Build & Deploy
- [ ] Alterei Start Command para `npm start`
- [ ] Salvei as alterações
- [ ] Aguardei o redeploy (2-3 minutos)
- [ ] Verifiquei os logs (deve aparecer "Servidor rodando")
- [ ] Testei `/api/test` (deve funcionar)

---

**Depois de corrigir, o erro deve desaparecer!** 🎉

