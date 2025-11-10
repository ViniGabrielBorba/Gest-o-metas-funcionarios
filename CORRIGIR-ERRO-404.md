# 🔧 Corrigir Erro 404 - Passo a Passo

## ✅ O que você já fez (correto):

1. ✅ Configurou `REACT_APP_API_URL` no Netlify
2. ✅ Colocou `FRONTEND_URL` no Render com `https://gestao-de-met.netlify.app`

## 🎯 O que falta fazer:

### **PASSO 1: Fazer Deploy do Backend no Render**

O código do backend foi atualizado para permitir Netlify, mas precisa ser implantado:

1. Acesse: **https://dashboard.render.com**
2. Encontre seu serviço backend
3. Clique no serviço
4. Vá em **Manual Deploy** → **Deploy latest commit**
5. **Aguarde o deploy completar** (2-3 minutos)

**Por que isso é importante?**
- O código que permite CORS do Netlify foi atualizado
- Mas o Render ainda está rodando a versão antiga
- Precisa fazer deploy para atualizar

---

### **PASSO 2: Fazer Novo Deploy no Netlify**

Mesmo que a variável esteja configurada, precisa fazer um novo build:

1. Acesse: **https://app.netlify.com**
2. Selecione seu site
3. Vá em **Deploys**
4. Clique em **Trigger deploy** → **Deploy site**
5. **Aguarde o build completar** (1-2 minutos)

**Por que isso é importante?**
- Variáveis de ambiente só são aplicadas em novos builds
- O código com logs de debug foi atualizado
- Precisa fazer build para aplicar

---

### **PASSO 3: Verificar FRONTEND_URL no Render**

1. No Render, vá no seu serviço backend
2. Vá em **Environment**
3. Verifique se `FRONTEND_URL` está configurada:
   - **Key:** `FRONTEND_URL`
   - **Value:** `https://gestao-de-met.netlify.app`
   - (sem barra no final!)

4. **Se não estiver configurada:**
   - Clique em **Add Environment Variable**
   - Adicione: `FRONTEND_URL` = `https://gestao-de-met.netlify.app`
   - Salve

5. **Se já estiver configurada:**
   - Verifique se está sem barra no final
   - Se tiver `/` no final, remova

---

### **PASSO 4: Testar**

Após fazer os dois deploys:

1. Abra: `https://gestao-de-met.netlify.app`
2. Pressione **F12** → **Console**
3. Procure por: `🔗 Usando REACT_APP_API_URL:`
4. Tente fazer login

---

## 🔍 Se ainda não funcionar:

**Me diga:**

1. **No Console (F12 → Console):**
   - Aparece `🔗` ou `⚠️`?

2. **No Network (F12 → Network):**
   - Qual URL está sendo chamada quando você tenta fazer login?
   - É `https://gestao-de-met.netlify.app/api/auth/login`?
   - Ou `https://gest-o-metas-funcionarios-3.onrender.com/api/auth/login`?

3. **Teste do Backend:**
   - Acesse: `https://gest-o-metas-funcionarios-3.onrender.com/api/test`
   - O que aparece?

---

## ✅ Resumo - Faça na Ordem:

1. ✅ **Render:** Manual Deploy → Deploy latest commit
2. ✅ **Netlify:** Deploys → Trigger deploy → Deploy site
3. ✅ **Aguarde ambos completarem**
4. ✅ **Teste o login**

**A causa mais provável:** O backend no Render ainda está com a versão antiga do código que não permite Netlify no CORS. Precisa fazer deploy!

