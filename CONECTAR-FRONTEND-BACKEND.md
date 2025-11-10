# 🔗 Conectar Frontend (Netlify) com Backend (Render)

## ✅ Verificação Rápida

O frontend no Netlify precisa se conectar ao backend no Render através da variável de ambiente `REACT_APP_API_URL`.

---

## 🔍 Passo 1: Verificar URL do Backend no Render

1. Acesse: **https://dashboard.render.com**
2. Faça login
3. Encontre seu serviço backend (geralmente chamado algo como `gest-o-metas-funcionarios-3`)
4. Clique no serviço
5. Verifique a URL do serviço (deve ser algo como):
   ```
   https://gest-o-metas-funcionarios-3.onrender.com
   ```
6. A URL completa da API deve ser:
   ```
   https://gest-o-metas-funcionarios-3.onrender.com/api
   ```

---

## ⚙️ Passo 2: Configurar Variável no Netlify

1. Acesse: **https://app.netlify.com**
2. Faça login
3. Selecione seu site (o frontend que acabou de fazer deploy)
4. Vá em **"Site settings"** (no menu lateral ou no topo)
5. Clique em **"Environment variables"** (no menu lateral esquerdo)
6. Verifique se existe a variável `REACT_APP_API_URL`:
   - **Se NÃO existir**, clique em **"Add variable"**
   - **Se já existir**, clique no lápis (✏️) para editar

7. Configure assim:

   **Key:**
   ```
   REACT_APP_API_URL
   ```

   **Value:**
   ```
   https://gest-o-metas-funcionarios-3.onrender.com/api
   ```
   ⚠️ **IMPORTANTE:** 
   - Use a URL do seu backend no Render
   - Deve terminar com `/api`
   - Não deve ter barra no final (`/api` e não `/api/`)

8. Marque as opções:
   - ✅ **Production**
   - ✅ **Deploy Preview**
   - ✅ **Branch Deploys**

9. Clique em **"Save"** (ou **"Add variable"** se for nova)

---

## 🔄 Passo 3: Fazer Novo Deploy

**IMPORTANTE:** Após adicionar/editar a variável, você precisa fazer um novo deploy para que a mudança tenha efeito!

1. No Netlify, vá em **"Deploys"** (no menu superior)
2. Clique em **"Trigger deploy"** (canto superior direito)
3. Escolha **"Deploy site"**
4. Aguarde o build completar (1-2 minutos)

---

## ✅ Passo 4: Testar a Conexão

Após o deploy:

1. Acesse seu site no Netlify (URL tipo `https://seu-app.netlify.app`)
2. Tente fazer login
3. Se funcionar, a conexão está OK! 🎉

---

## 🆘 Problemas Comuns

### **Erro 404: "Failed to load resource: the server responded with a status of 404"**
**Este é o erro mais comum!** Significa que a variável `REACT_APP_API_URL` não está configurada ou o build não foi refeito.

**Solução:**
1. ✅ **Verifique se a variável está configurada:**
   - No Netlify, vá em **Site settings** → **Environment variables**
   - Procure por `REACT_APP_API_URL`
   - Se não existir, adicione com o valor: `https://gest-o-metas-funcionarios-3.onrender.com/api`

2. ✅ **FAÇA UM NOVO DEPLOY (MUITO IMPORTANTE!):**
   - Variáveis de ambiente só são aplicadas em novos builds
   - Vá em **Deploys** → **Trigger deploy** → **Deploy site**
   - Aguarde o build completar

3. ✅ **Verifique a URL:**
   - Abra o Console do navegador (F12 → Console)
   - Procure por mensagens que começam com `🔗` ou `⚠️`
   - Verifique qual URL está sendo usada

4. ✅ **Teste a URL do backend diretamente:**
   - Abra: `https://gest-o-metas-funcionarios-3.onrender.com/api/auth/login`
   - Se retornar erro de método (POST required), o backend está funcionando
   - Se retornar 404, verifique a URL do backend no Render

### **Erro: "Network Error" ou "Failed to fetch"**
- ✅ Verifique se a variável `REACT_APP_API_URL` está configurada corretamente
- ✅ Verifique se o backend está rodando no Render (verifique o status no dashboard)
- ✅ Verifique se a URL termina com `/api` (não `/api/`)
- ✅ Faça um novo deploy após adicionar/editar a variável

### **Erro: "CORS" ou "Access-Control-Allow-Origin"**
- ✅ Verifique se o backend no Render está configurado para aceitar requisições do seu domínio Netlify
- ✅ O backend deve ter CORS configurado para aceitar `https://seu-app.netlify.app`

### **Site carrega mas não conecta**
- ✅ Abra o Console do navegador (F12 → Console)
- ✅ Verifique se há erros de rede
- ✅ Verifique se a URL da API está correta nos logs

### **Backend não está respondendo**
- ✅ Verifique o status do serviço no Render
- ✅ Verifique os logs do backend no Render
- ✅ Certifique-se de que o backend está rodando

---

## 🔍 Como Verificar se Está Funcionando

1. **No Console do Navegador (F12):**
   - Abra o Console
   - Tente fazer login
   - Verifique se as requisições estão indo para a URL correta do Render

2. **No Network Tab (F12 → Network):**
   - Veja as requisições sendo feitas
   - Verifique se estão indo para `https://gest-o-metas-funcionarios-3.onrender.com/api/...`

3. **Teste de Login:**
   - Se conseguir fazer login, a conexão está funcionando! ✅

---

## 📝 Checklist Final

- [ ] Backend está rodando no Render
- [ ] Variável `REACT_APP_API_URL` configurada no Netlify
- [ ] URL da variável termina com `/api`
- [ ] Novo deploy feito após configurar a variável
- [ ] Teste de login funcionando

---

**🎉 Pronto! Seu frontend está conectado com o backend!**

