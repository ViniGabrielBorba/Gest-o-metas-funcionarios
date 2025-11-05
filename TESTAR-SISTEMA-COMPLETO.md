# 🧪 Como Testar o Sistema Completo

## 🌐 URLs do Sistema

### **Frontend (Vercel):**
```
https://gestao-metas-funcionarios-1p7yck09k-vinicius-projects-34f019f7.vercel.app
```
Ou a URL principal do Vercel (se tiver).

### **Backend (Render):**
```
https://gest-o-metas-funcionarios-3.onrender.com
```

---

## ✅ Testar Frontend

### **1. Acessar o Frontend:**

Abra no navegador:
```
https://gestao-metas-funcionarios-1p7yck09k-vinicius-projects-34f019f7.vercel.app
```

**Você deve ver:**
- Página de Login ou Cadastro
- Interface do sistema

### **2. Verificar se Conecta ao Backend:**

1. Abra o **Console do Navegador** (F12 → Console)
2. Tente fazer **cadastro** ou **login**
3. Veja se há erros no console

**Se aparecer erro:**
- "Network Error" → Frontend não está conectando ao backend
- "CORS Error" → Problema de CORS
- "Cannot POST /api/..." → Variável `REACT_APP_API_URL` não configurada

---

## ✅ Testar Backend Direto

### **1. Teste da API:**

Abra no navegador:
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```

**Deve aparecer:**
```json
{"message":"API funcionando!"}
```

### **2. Se Demorar ou Não Responder:**

- Backend pode estar "dormindo" (plano Free do Render)
- Aguarde 30-60 segundos
- Tente novamente

---

## 🔗 Conectar Frontend ao Backend

### **No Vercel:**

1. **Acesse:** https://vercel.com
2. **Vá no seu projeto**
3. **Settings** → **Environment Variables**
4. **Adicione ou edite:**
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`
5. **Environments:** Selecione todos (Production, Preview, Development)
6. **Save**
7. **Fazer Redeploy:**
   - Deployments → Três pontos (...) → **"Redeploy"**
   - Aguarde 2-3 minutos

---

## 🧪 Testar Cadastro/Login

### **1. Após Configurar `REACT_APP_API_URL`:**

1. Acesse o frontend no Vercel
2. Tente fazer **cadastro** de um novo gerente
3. Preencha os campos:
   - Nome
   - Email
   - Senha (mín. 6 caracteres)
   - Nome da Loja
4. Clique em **"Cadastrar"**

### **2. Verificar se Funcionou:**

**Se funcionar:**
- ✅ Você será redirecionado para o dashboard
- ✅ Dados serão salvos no MongoDB

**Se não funcionar:**
- Verifique o console do navegador (F12)
- Veja qual erro aparece
- Verifique Network tab (F12 → Network)

---

## 🔍 Verificar Conexão no Console

### **1. Abrir Console:**

F12 → **Console**

### **2. Testar Variável:**

Digite:
```javascript
console.log(process.env.REACT_APP_API_URL)
```

**Deve aparecer:**
```
https://gest-o-metas-funcionarios-3.onrender.com/api
```

**Se aparecer `undefined`:**
- Variável não está configurada
- Faça redeploy após configurar

### **3. Testar Requisição:**

Digite:
```javascript
fetch('https://gest-o-metas-funcionarios-3.onrender.com/api/test')
  .then(r => r.json())
  .then(console.log)
```

**Deve aparecer:**
```json
{message: "API funcionando!"}
```

---

## 📝 Checklist Completo

- [ ] Frontend acessível: `https://gestao-metas-funcionarios-1p7yck09k...`
- [ ] Backend acessível: `https://gest-o-metas-funcionarios-3.onrender.com/api/test`
- [ ] Variável `REACT_APP_API_URL` configurada no Vercel
- [ ] Redeploy feito no Vercel
- [ ] Console mostra variável (não undefined)
- [ ] Teste de cadastro funciona
- [ ] Teste de login funciona

---

## 🆘 Se Não Funcionar

### **Frontend não conecta ao backend:**

1. Verifique `REACT_APP_API_URL` no Vercel
2. Verifique se fez redeploy
3. Verifique console do navegador (erros?)
4. Verifique Network tab (requisições vão para onde?)

### **Backend não responde:**

1. Verifique se está "Live" no Render
2. Teste `/api/test` diretamente
3. Pode estar "dormindo" - aguarde 30-60 segundos

---

## 🎯 Resumo

**Esse link é do FRONTEND (Vercel):**
- `https://gestao-metas-funcionarios-1p7yck09k-vinicius-projects-34f019f7.vercel.app`

**O BACKEND está em outro lugar (Render):**
- `https://gest-o-metas-funcionarios-3.onrender.com`

**Para funcionar:**
- Configure `REACT_APP_API_URL` no Vercel apontando para o Render
- Faça redeploy no Vercel

---

**Agora é só configurar a variável no Vercel e testar!** 🚀

