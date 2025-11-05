# 🔧 Solução: Erro Status 1 no Deploy (Render)

## ❌ Problema

```
O processo de execução do seu código foi encerrado com o status 1.
```

Isso significa que o servidor está **crashando** ao iniciar.

---

## 🔍 Possíveis Causas

### **1. Start Command Errado (Mais Provável)**

O Render pode estar tentando executar `node server.js` ao invés de `npm start`.

### **2. Erro de Sintaxe no Código**

Algum erro de sintaxe que só aparece em produção.

### **3. Variável de Ambiente Faltando**

Alguma variável obrigatória não está configurada.

---

## ✅ Solução Passo a Passo

### **PASSO 1: Verificar Start Command no Render**

1. **Acesse:** https://render.com
2. **Vá no seu Web Service**
3. **Settings** → **Build & Deploy**
4. **Verifique "Start Command":**
   - Deve ser: `npm start`
   - **NÃO deve ser:** `node server.js`

5. **Se estiver errado:**
   - Altere para: `npm start`
   - Clique em **"Save Changes"**

---

### **PASSO 2: Verificar Variáveis de Ambiente**

No Render → **Environment Variables**, verifique se tem:

- ✅ `MONGODB_URI` - String de conexão MongoDB
- ✅ `JWT_SECRET` - Chave secreta
- ✅ `NODE_ENV` - `production`

**Se faltar alguma, adicione!**

---

### **PASSO 3: Verificar Logs Completos**

No Render → **Logs**, procure por:

- Erros de sintaxe
- "Cannot find module"
- "MONGODB_URI is not defined"
- Qualquer mensagem de erro em vermelho

**Copie a mensagem de erro completa e me mostre!**

---

### **PASSO 4: Testar Localmente (Opcional)**

Para verificar se o código funciona localmente:

```bash
cd backend
node server.js
```

**Se der erro localmente, o problema é no código.**

---

## 🆘 Se Ainda Não Funcionar

### **Opção 1: Reverter para Versão Anterior**

Se o problema começou após o último commit:

1. **No Render → Settings → Build & Deploy**
2. **Branch:** Mude para um commit anterior (ex: `4dbf3f7`)
3. **Save** e aguarde redeploy

### **Opção 2: Limpar Cache**

1. **Render → Settings**
2. **"Clear build cache"**
3. **Fazer "Manual Deploy"**

### **Opção 3: Verificar Procfile**

O `Procfile` na raiz deve ter:
```
web: node backend/server.js
```

---

## 📋 Checklist de Diagnóstico

- [ ] Start Command está como `npm start`?
- [ ] Todas as variáveis de ambiente estão configuradas?
- [ ] Verifiquei os logs completos?
- [ ] Procfile está correto?
- [ ] Testei localmente (se possível)?

---

## 💡 Dica

**O erro Status 1 geralmente é:**
- Start Command errado (70% dos casos)
- Variável de ambiente faltando (20%)
- Erro de sintaxe (10%)

**Comece verificando o Start Command!**

---

**Me diga qual erro aparece nos logs completos do Render para eu ajudar melhor!** 🔍

