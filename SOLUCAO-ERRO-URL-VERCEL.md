# 🔧 Solução: Erro ao Configurar URL no Vercel

## ❌ Possíveis Erros

Vou ajudar a identificar e corrigir o problema!

---

## 🔍 Verificar o Erro Específico

### **1. Que Tipo de Erro Aparece?**

- [ ] Erro ao salvar no Vercel?
- [ ] Erro no console do navegador?
- [ ] Erro de CORS?
- [ ] Outro erro? (descreva)

---

## ✅ Soluções Comuns

### **SOLUÇÃO 1: Verificar Formato no Vercel**

No Vercel → Environment Variables:

**Key:** `REACT_APP_API_URL`

**Value:** 
```
https://gest-o-metas-funcionarios-3.onrender.com/api
```

⚠️ **IMPORTANTE:**
- ✅ Deve começar com `https://`
- ✅ NÃO deve ter espaço no final
- ✅ Deve terminar com `/api`
- ✅ NÃO deve ter `/api/api` (duplicado)

---

### **SOLUÇÃO 2: Verificar se o Backend Está Funcionando**

Antes de configurar no Vercel, teste se o backend está respondendo:

1. **Teste no navegador:**
   ```
   https://gest-o-metas-funcionarios-3.onrender.com/api/test
   ```
   
2. **Deve aparecer:**
   ```json
   {"message":"API funcionando!"}
   ```

3. **Se não funcionar:**
   - O backend pode estar "dormindo" (plano Free do Render)
   - Aguarde 30-60 segundos e tente novamente
   - Verifique os logs no Render

---

### **SOLUÇÃO 3: Verificar Sintaxe da URL**

**Formato Correto:**
```
https://gest-o-metas-funcionarios-3.onrender.com/api
```

**Formato Incorreto:**
```
❌ https://gest-o-metas-funcionarios-3.onrender.com/api/  (barra no final)
❌ http://gest-o-metas-funcionarios-3.onrender.com/api   (sem 's' no http)
❌ gest-o-metas-funcionarios-3.onrender.com/api          (sem https://)
❌ https://gest-o-metas-funcionarios-3.onrender.com      (sem /api)
```

---

### **SOLUÇÃO 4: Verificar Variável de Ambiente**

No Vercel, certifique-se de:

1. **Nome da variável:** Exatamente `REACT_APP_API_URL`
   - ✅ Deve começar com `REACT_APP_`
   - ✅ Tudo em maiúsculas
   - ✅ Sem espaços

2. **Ambientes:** Selecione todos:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

3. **Salvar:** Clique em "Save" ou "Add"

---

### **SOLUÇÃO 5: Fazer Redeploy Após Atualizar**

⚠️ **IMPORTANTE:** Após atualizar a variável, você PRECISA fazer redeploy!

1. No Vercel, vá em **"Deployments"**
2. Clique nos **três pontos (...)** do último deploy
3. Escolha **"Redeploy"**
4. Aguarde 2-3 minutos

**OU**

1. Faça um pequeno commit e push:
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push
   ```

---

### **SOLUÇÃO 6: Verificar no Código do Frontend**

Verifique como o frontend usa a variável:

1. Abra: `frontend/src/utils/api.js`
2. Deve estar assim:
   ```javascript
   const api = axios.create({
     baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
   });
   ```

3. Se não estiver assim, vamos corrigir!

---

## 🧪 Testar se Está Funcionando

### **1. Testar Backend Direto:**
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

### **2. Testar Frontend:**
1. Acesse a URL do Vercel
2. Abra o Console do Navegador (F12)
3. Veja se há erros de rede
4. Veja se as requisições estão indo para a URL correta

### **3. Verificar no Network Tab:**
1. F12 → Network
2. Tente fazer login/cadastro
3. Veja para onde as requisições estão indo
4. Devem ir para: `https://gest-o-metas-funcionarios-3.onrender.com/api/...`

---

## 🆘 Erros Específicos

### **Erro: "Invalid URL"**

**Causa:** URL mal formatada

**Solução:**
- Verifique se tem `https://` no início
- Verifique se não tem espaços
- Copie e cole novamente

### **Erro: "CORS Error"**

**Causa:** Backend não está permitindo requisições do frontend

**Solução:**
1. No Render, atualize `FRONTEND_URL` com a URL do Vercel
2. O backend vai aceitar requisições do frontend

### **Erro: "Network Error"**

**Causa:** Backend não está respondendo

**Solução:**
1. Verifique se o backend está "Live" no Render
2. Teste a URL diretamente no navegador
3. Pode estar "dormindo" (plano Free) - aguarde 30-60 segundos

### **Erro ao Salvar no Vercel**

**Causa:** Formato incorreto ou problema de permissão

**Solução:**
1. Verifique se está logado no Vercel
2. Verifique se tem permissão no projeto
3. Tente criar a variável novamente
4. Verifique se o nome está correto: `REACT_APP_API_URL`

---

## 📝 Checklist

- [ ] Backend está funcionando: `https://gest-o-metas-funcionarios-3.onrender.com/api/test`
- [ ] Variável `REACT_APP_API_URL` criada no Vercel
- [ ] Valor: `https://gest-o-metas-funcionarios-3.onrender.com/api` (sem barra no final)
- [ ] Selecionado em todos os ambientes (Production, Preview, Development)
- [ ] Redeploy feito no Vercel após atualizar
- [ ] Console do navegador verificado (F12)
- [ ] Network tab verificado (F12 → Network)

---

## 💡 Dica

**Se ainda não funcionar, me diga:**
1. Qual é o erro exato que aparece?
2. Onde aparece? (Vercel ao salvar? Console do navegador? Network?)
3. O backend está respondendo? (`/api/test` funciona?)

---

**Me diga qual erro específico está aparecendo para eu ajudar melhor!** 🔍

