# 🔍 Troubleshooting: Variável Não Está Funcionando no Vercel

## ❓ O Que Não Está Funcionando?

Vamos identificar o problema específico:

- [ ] A variável não salva no Vercel?
- [ ] A variável salva mas o frontend não usa?
- [ ] Erro no console do navegador?
- [ ] Requisições não chegam ao backend?

---

## ✅ Solução Passo a Passo

### **PASSO 1: Verificar se a Variável Foi Salva**

1. No Vercel, vá em **Settings → Environment Variables**
2. Role a página para baixo
3. Procure por `REACT_APP_API_URL` na lista
4. Se **NÃO ESTIVER LÁ**, você precisa adicionar novamente

---

### **PASSO 2: Adicionar no Nível do Projeto (Não Team)**

⚠️ **IMPORTANTE:** No Vercel, você pode adicionar variáveis em dois lugares:

1. **Team Level** (nível da equipe) - pode não funcionar
2. **Project Level** (nível do projeto) - **ESTE É O CORRETO!**

#### **Como Adicionar no Projeto:**

1. No Vercel, vá no seu **projeto** (não no dashboard geral)
2. **Settings** → **Environment Variables**
3. Certifique-se de estar na aba **"Project"** (não "Shared")
4. Clique em **"Add New"**
5. Preencha:
   - **Key:** `REACT_APP_API_URL`
   - **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`
   - **Environments:** Selecione todos (Production, Preview, Development)
6. **Save**

---

### **PASSO 3: Fazer Redeploy (OBRIGATÓRIO!)**

⚠️ **CRÍTICO:** Variáveis de ambiente só funcionam após redeploy!

1. No Vercel, vá em **"Deployments"**
2. Clique nos **três pontos (...)** do último deploy
3. Escolha **"Redeploy"**
4. Aguarde 2-3 minutos

**OU**

1. Faça um commit vazio e push:
   ```bash
   git commit --allow-empty -m "Trigger redeploy for env vars"
   git push
   ```

---

### **PASSO 4: Verificar se o Build Pegou a Variável**

1. No Vercel, vá em **"Deployments"**
2. Clique no último deploy
3. Veja os **"Build Logs"**
4. Procure por `REACT_APP_API_URL`
5. Deve aparecer algo como: `REACT_APP_API_URL=https://...`

---

### **PASSO 5: Verificar no Console do Navegador**

1. Acesse seu app no Vercel
2. Abra o **Console do Navegador** (F12 → Console)
3. Digite:
   ```javascript
   console.log(process.env.REACT_APP_API_URL)
   ```
4. Deve aparecer: `https://gest-o-metas-funcionarios-3.onrender.com/api`

**Se aparecer `undefined`:**
- A variável não foi carregada
- Verifique se fez redeploy
- Verifique se o nome está correto

---

### **PASSO 6: Verificar Network Tab**

1. F12 → **Network**
2. Tente fazer login/cadastro
3. Veja para onde as requisições estão indo
4. Devem ir para: `https://gest-o-metas-funcionarios-3.onrender.com/api/...`

**Se estiver indo para `/api/...` (sem o domínio):**
- A variável não está sendo usada
- Verifique redeploy

---

## 🔧 Soluções Alternativas

### **SOLUÇÃO 1: Verificar se Está no Projeto Correto**

1. Certifique-se de estar no projeto do **frontend**
2. Não no projeto do backend (se tiver criado)
3. Não no nível Team

### **SOLUÇÃO 2: Adicionar Via Arquivo .env (Alternativa)**

Se não funcionar via interface, você pode criar um arquivo `.env.production`:

1. Crie o arquivo: `frontend/.env.production`
2. Adicione:
   ```
   REACT_APP_API_URL=https://gest-o-metas-funcionarios-3.onrender.com/api
   ```
3. Faça commit e push:
   ```bash
   git add frontend/.env.production
   git commit -m "Add production env vars"
   git push
   ```

⚠️ **IMPORTANTE:** Adicione `.env.production` ao `.gitignore` se tiver informações sensíveis (mas no caso da URL do backend, não tem problema).

### **SOLUÇÃO 3: Verificar Build Command**

No Vercel → Settings → Build & Development Settings:

- **Build Command:** `npm run build` (ou `cd frontend && npm run build`)
- Certifique-se que está correto

---

## 🧪 Testar se Funcionou

### **Teste 1: Console do Navegador**
```javascript
console.log(process.env.REACT_APP_API_URL)
// Deve mostrar: https://gest-o-metas-funcionarios-3.onrender.com/api
```

### **Teste 2: Network Tab**
- F12 → Network
- Tente fazer login
- Veja se a requisição vai para o backend correto

### **Teste 3: Backend Direto**
```
https://gest-o-metas-funcionarios-3.onrender.com/api/test
```
Deve funcionar!

---

## 📝 Checklist Completo

- [ ] Variável adicionada no **nível do projeto** (não Team)
- [ ] Key: `REACT_APP_API_URL` (exatamente assim)
- [ ] Value: `https://gest-o-metas-funcionarios-3.onrender.com/api`
- [ ] Ambientes selecionados: Production, Preview, Development
- [ ] **Redeploy feito** após adicionar variável
- [ ] Build logs mostram a variável
- [ ] Console do navegador mostra a variável
- [ ] Network tab mostra requisições indo para o backend correto

---

## 🆘 Se Ainda Não Funcionar

**Me diga:**
1. A variável aparece na lista do Vercel?
2. Você fez redeploy após adicionar?
3. O que aparece no console do navegador?
4. O que aparece no Network tab quando tenta fazer login?

---

**Vamos descobrir o problema específico!** 🔍

