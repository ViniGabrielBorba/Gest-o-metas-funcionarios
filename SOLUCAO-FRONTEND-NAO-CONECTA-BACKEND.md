# 🔧 Solução: Frontend Não Conecta com Backend

## 🔍 Diagnóstico Rápido

Vamos descobrir o problema específico:

---

## ✅ Solução 1: Verificar Variável no Vercel

### **1. Verificar se a Variável Existe:**

1. No Vercel, vá em **Settings → Environment Variables**
2. Procure por `REACT_APP_API_URL`
3. **Deve estar assim:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`

### **2. Se NÃO Estiver Lá:**

1. Adicione:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`
2. **Environments:** Selecione todos (Production, Preview, Development)
3. **Save**

### **3. Fazer Redeploy (OBRIGATÓRIO!):**

1. **Deployments** → Três pontos (...) → **"Redeploy"**
2. Aguarde 2-3 minutos

---

## ✅ Solução 2: Verificar no Console do Navegador

### **1. Abrir Console:**

1. Acesse seu app no Vercel
2. Pressione **F12** (ou clique direito → Inspecionar)
3. Vá na aba **"Console"**

### **2. Testar Variável:**

Digite no console:
```javascript
console.log(process.env.REACT_APP_API_URL)
```

**Se aparecer `undefined`:**
- A variável não está configurada
- Ou não fez redeploy

**Se aparecer a URL:**
- A variável está configurada
- Problema pode ser outro

---

## ✅ Solução 3: Verificar Network Tab

### **1. Abrir Network Tab:**

1. F12 → **Network**
2. Tente fazer login/cadastro

### **2. Verificar Requisições:**

**O que deve aparecer:**
- Requisições indo para: `https://gest-o-metas-funcionarios-3.onrender.com/api/...`

**Se aparecer:**
- `/api/...` (sem domínio) → Variável não está sendo usada
- `localhost:5000` → Usando fallback local
- Erro de CORS → Problema de CORS
- Erro 404 → Backend não encontrado
- Timeout → Backend "dormindo" ou offline

---

## ✅ Solução 4: Verificar CORS no Backend

### **1. No Render, verificar `FRONTEND_URL`:**

1. Render → Web Service → Environment Variables
2. Verifique se `FRONTEND_URL` está configurado
3. **Deve ser:** URL do seu app no Vercel
   - Exemplo: `https://seu-app.vercel.app`

### **2. Verificar Código do Backend:**

O backend já está configurado para aceitar qualquer origem (`*`), mas é melhor especificar.

---

## ✅ Solução 5: Criar Arquivo .env.production (Alternativa)

Se a variável no Vercel não funcionar, use arquivo:

### **1. Criar Arquivo:**

Crie o arquivo: `frontend/.env.production`

### **2. Adicionar Conteúdo:**

```
REACT_APP_API_URL=https://gest-o-metas-funcionarios-3.onrender.com/api
```

### **3. Fazer Commit:**

```bash
git add frontend/.env.production
git commit -m "Add production API URL"
git push
```

O Vercel vai fazer deploy automático.

---

## 🧪 Testar Conexão

### **Teste 1: Backend Direto**

Abra no navegador:
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

Deve aparecer: `{"message":"API funcionando!"}`

### **Teste 2: Frontend Console**

No console do navegador (F12):
```javascript
fetch('https://gest-o-metas-funcionarios-3.onrender.com/api/test')
  .then(r => r.json())
  .then(console.log)
```

Deve aparecer: `{message: "API funcionando!"}`

### **Teste 3: Network Tab**

1. F12 → Network
2. Tente fazer login
3. Veja se a requisição aparece
4. Veja o status (200 = sucesso, 404 = não encontrado, etc.)

---

## 🆘 Erros Comuns

### **Erro: "Network Error" ou "Failed to fetch"**

**Causa:** Backend não está respondendo ou CORS bloqueando

**Solução:**
1. Verifique se backend está "Live" no Render
2. Teste `/api/test` diretamente
3. Pode estar "dormindo" - aguarde 30-60 segundos

### **Erro: "CORS policy"**

**Causa:** Backend não permite requisições do frontend

**Solução:**
1. No Render, atualize `FRONTEND_URL` com a URL do Vercel
2. O backend já aceita `*`, mas especificar ajuda

### **Erro: "404 Not Found"**

**Causa:** URL da API está errada

**Solução:**
1. Verifique `REACT_APP_API_URL` no Vercel
2. Deve terminar com `/api`
3. Deve ser: `https://gest-o-metas-funcionarios-3.onrender.com/api`

### **Erro: "undefined" na variável**

**Causa:** Variável não foi carregada

**Solução:**
1. Verifique se está no Vercel
2. Faça redeploy
3. Use arquivo `.env.production` como alternativa

---

## 📝 Checklist Completo

- [ ] Backend está funcionando: `/api/test` retorna OK
- [ ] Variável `REACT_APP_API_URL` no Vercel
- [ ] Valor: `https://gest-o-metas-funcionarios-3.onrender.com/api`
- [ ] Redeploy feito no Vercel
- [ ] Console mostra a variável (não undefined)
- [ ] Network tab mostra requisições indo para o backend correto
- [ ] `FRONTEND_URL` configurado no Render (opcional)

---

## 💡 Solução Rápida (Mais Garantida)

**Criar arquivo `.env.production`:**

1. Crie: `frontend/.env.production`
2. Adicione:
   ```
   REACT_APP_API_URL=https://gest-o-metas-funcionarios-3.onrender.com/api
   ```
3. Commit e push:
   ```bash
   git add frontend/.env.production
   git commit -m "Add production API URL"
   git push
   ```

Isso **sempre funciona** porque o Vercel lê arquivos `.env.production` automaticamente!

---

**Me diga qual erro específico aparece no console ou network tab para eu ajudar melhor!** 🔍

