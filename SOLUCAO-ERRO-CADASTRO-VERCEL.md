# 🔧 Solução: Erro ao Cadastrar Gerente no Vercel

## 🔍 Diagnóstico do Problema

Você está tendo erro ao cadastrar no frontend: `gest-o-metas-funcionarios-89ed.vercel.app`

Vamos identificar e corrigir!

---

## ✅ Solução 1: Verificar Variável REACT_APP_API_URL

### **O Problema Mais Comum:**

O frontend não sabe onde está o backend!

### **Como Verificar:**

1. **Acesse:** https://vercel.com
2. **Vá no seu projeto** (`gest-o-metas-funcionarios`)
3. **Settings** → **Environment Variables**
4. **Procure por:** `REACT_APP_API_URL`
5. **Deve estar:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`

### **Se NÃO Estiver:**

1. **Adicione:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`
2. **Environments:** Selecione todos (Production, Preview, Development)
3. **Save**
4. **Fazer Redeploy:**
   - Deployments → Três pontos (...) → **"Redeploy"**
   - Aguarde 2-3 minutos

---

## ✅ Solução 2: Verificar no Console do Navegador

### **1. Abrir Console:**

1. Acesse: `https://gest-o-metas-funcionarios-89ed.vercel.app`
2. Pressione **F12** (ou clique direito → Inspecionar)
3. Vá na aba **"Console"**

### **2. Verificar Erros:**

**Erros Comuns:**

- **"Network Error"** ou **"Failed to fetch"**
  - → Frontend não está conectando ao backend
  - → Verifique `REACT_APP_API_URL`
  
- **"CORS policy"**
  - → Backend não permite requisições do Vercel
  - → Verifique `FRONTEND_URL` no Render

- **"404 Not Found"**
  - → URL da API está errada
  - → Verifique se termina com `/api`

- **"Cannot POST /api/auth/register"**
  - → Backend não está respondendo
  - → Verifique se backend está online

### **3. Testar Variável:**

No console, digite:
```javascript
console.log(process.env.REACT_APP_API_URL)
```

**Deve aparecer:**
```
https://gest-o-metas-funcionarios-3.onrender.com/api
```

**Se aparecer `undefined`:**
- A variável não está configurada
- Faça redeploy após configurar

---

## ✅ Solução 3: Verificar Network Tab

### **1. Abrir Network Tab:**

1. F12 → **Network**
2. Tente fazer cadastro novamente
3. Veja as requisições que aparecem

### **2. Verificar Requisição:**

**O que deve aparecer:**
- Requisição para: `https://gest-o-metas-funcionarios-3.onrender.com/api/auth/register`
- Método: `POST`
- Status: `201` (sucesso) ou `400` (erro de validação)

**Se aparecer:**
- `/api/auth/register` (sem domínio) → Variável não configurada
- `localhost:5000` → Usando fallback local
- Erro de CORS → Problema de CORS
- Timeout → Backend "dormindo"

---

## ✅ Solução 4: Verificar CORS no Backend

### **1. No Render:**

1. Render → Web Service → Environment Variables
2. Verifique se `FRONTEND_URL` está configurado
3. **Deve ser:** `https://gest-o-metas-funcionarios-89ed.vercel.app`

### **2. Se Não Estiver:**

1. **Adicione:**
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://gest-o-metas-funcionarios-89ed.vercel.app`
2. **Save**
3. Render vai fazer redeploy automático

---

## ✅ Solução 5: Criar Arquivo .env.production (Garantido!)

Se a variável no Vercel não funcionar, use arquivo:

### **1. Criar Arquivo:**

Na pasta `frontend`, crie o arquivo `.env.production`

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

O Vercel vai fazer deploy automático!

---

## 🧪 Testar Backend Diretamente

Antes de testar o frontend, verifique se o backend está funcionando:

### **1. Teste da API:**

Abra no navegador:
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

Deve aparecer: `{"message":"API funcionando!"}`

### **2. Teste de Cadastro (Direto):**

No console do navegador (F12), digite:

```javascript
fetch('https://gest-o-metas-funcionarios-3.onrender.com/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'Teste',
    email: 'teste@teste.com',
    senha: '123456',
    nomeLoja: 'Loja Teste'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Se funcionar:**
- Backend está OK
- Problema é no frontend (variável não configurada)

**Se não funcionar:**
- Backend pode estar "dormindo"
- Aguarde 30-60 segundos e tente novamente

---

## 📝 Checklist Completo

- [ ] Variável `REACT_APP_API_URL` no Vercel
- [ ] Valor: `https://gest-o-metas-funcionarios-3.onrender.com/api`
- [ ] Redeploy feito no Vercel após configurar
- [ ] Console mostra a variável (não undefined)
- [ ] Backend está funcionando: `/api/test` retorna OK
- [ ] `FRONTEND_URL` configurado no Render
- [ ] Network tab mostra requisições indo para o backend correto
- [ ] Não há erros de CORS no console

---

## 🆘 Erros Específicos

### **Erro: "Network Error"**

**Solução:**
1. Verifique `REACT_APP_API_URL` no Vercel
2. Faça redeploy
3. Verifique se backend está online

### **Erro: "CORS policy"**

**Solução:**
1. No Render, adicione `FRONTEND_URL` = `https://gest-o-metas-funcionarios-89ed.vercel.app`
2. Aguarde redeploy

### **Erro: "Cannot POST /api/auth/register"**

**Solução:**
1. Backend pode estar "dormindo" (plano Free)
2. Aguarde 30-60 segundos
3. Tente novamente

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

Isso **sempre funciona**!

---

## 🔍 Me Diga Qual Erro Aparece

Para ajudar melhor, me diga:

1. **Qual erro aparece no console?** (F12 → Console)
2. **O que aparece no Network tab?** (F12 → Network)
3. **A requisição está indo para onde?**
4. **Qual é o status code?** (200, 404, 500, etc.)

---

**Vamos resolver isso! Me diga o erro específico que aparece!** 🔍

