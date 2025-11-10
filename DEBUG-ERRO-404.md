# 🔍 Debug: Erro 404 ao Fazer Login

## ✅ Checklist de Verificação

Siga estes passos na ordem:

---

## 1️⃣ Verificar se a Variável Está Configurada no Netlify

1. Acesse: **https://app.netlify.com**
2. Selecione seu site
3. Vá em **Site settings** → **Environment variables**
4. Procure por `REACT_APP_API_URL`
5. **Verifique:**
   - ✅ A variável existe?
   - ✅ O valor está correto: `https://gest-o-metas-funcionarios-3.onrender.com/api`
   - ✅ Está marcada para **Production**, **Deploy Preview** e **Branch Deploys**?

**Se não existir ou estiver errada:**
- Adicione/edite a variável
- **IMPORTANTE:** Faça um novo deploy após adicionar/editar!

---

## 2️⃣ Fazer Novo Deploy (CRÍTICO!)

**Variáveis de ambiente só funcionam em novos builds!**

1. No Netlify, vá em **Deploys**
2. Clique em **Trigger deploy** (canto superior direito)
3. Escolha **Deploy site**
4. Aguarde o build completar (1-2 minutos)
5. **Só depois disso**, teste o login novamente

---

## 3️⃣ Verificar no Console do Navegador

1. Abra seu site no Netlify
2. Pressione **F12** para abrir as ferramentas de desenvolvedor
3. Vá na aba **Console**
4. Recarregue a página (F5)
5. Procure por mensagens que começam com:
   - `🔗 Usando REACT_APP_API_URL:` → ✅ Variável configurada corretamente
   - `⚠️ REACT_APP_API_URL não configurada!` → ❌ Variável não está sendo usada

**O que você vê?**
- Se ver `⚠️`, a variável não está configurada ou o build não foi refeito
- Se ver `🔗`, a variável está funcionando

---

## 4️⃣ Verificar a Requisição no Network Tab

1. No navegador, pressione **F12**
2. Vá na aba **Network** (Rede)
3. Tente fazer login
4. Procure por uma requisição que começa com `/auth/login` ou `login`
5. Clique nela e veja:
   - **Request URL:** Qual URL completa está sendo usada?
   - **Status:** Qual é o código de status? (404, 500, etc.)

**O que você vê?**
- Se a URL for `https://seu-app.netlify.app/api/auth/login` → ❌ Variável não está sendo usada
- Se a URL for `https://gest-o-metas-funcionarios-3.onrender.com/api/auth/login` → ✅ Variável está funcionando

---

## 5️⃣ Testar o Backend Diretamente

Vamos verificar se o backend está respondendo:

1. Abra uma nova aba no navegador
2. Acesse: `https://gest-o-metas-funcionarios-3.onrender.com/api/auth/login`
3. **O que acontece?**
   - Se aparecer erro de método (POST required) → ✅ Backend está funcionando
   - Se aparecer 404 → ❌ Backend não está rodando ou URL está errada
   - Se aparecer erro de conexão → ❌ Backend está offline

---

## 6️⃣ Verificar Status do Backend no Render

1. Acesse: **https://dashboard.render.com**
2. Faça login
3. Encontre seu serviço backend
4. Verifique o **Status:**
   - ✅ **Live** → Backend está rodando
   - ❌ **Stopped** ou **Error** → Backend não está rodando

**Se o backend não estiver rodando:**
- Clique em **Manual Deploy** → **Deploy latest commit**
- Aguarde o deploy completar

---

## 7️⃣ Verificar CORS no Backend

O backend precisa permitir requisições do seu domínio Netlify.

1. No Render, vá no seu serviço backend
2. Vá em **Environment**
3. Procure por `FRONTEND_URL`
4. **Adicione/edite** com a URL do seu site Netlify:
   ```
   https://seu-app.netlify.app
   ```
   (Substitua `seu-app` pela URL real do seu site)

5. **Salve** e faça um **redeploy** do backend

---

## 🎯 Solução Mais Provável

**99% dos casos de erro 404 são porque:**

1. ❌ A variável `REACT_APP_API_URL` não foi adicionada no Netlify
2. ❌ A variável foi adicionada mas **não foi feito um novo deploy**
3. ❌ O backend não está rodando no Render

**Solução:**
1. Adicione a variável no Netlify
2. **Faça um novo deploy no Netlify**
3. Verifique se o backend está rodando no Render
4. Teste novamente

---

## 📞 Se Nada Funcionar

Envie estas informações:

1. **O que aparece no Console (F12 → Console)?**
   - Mensagem com `🔗` ou `⚠️`?

2. **O que aparece no Network (F12 → Network)?**
   - Qual URL está sendo chamada?
   - Qual é o código de status?

3. **O backend está rodando no Render?**
   - Status: Live ou Stopped?

4. **Você fez um novo deploy no Netlify após adicionar a variável?**
   - Sim ou Não?

---

**💡 Dica:** A maioria dos problemas é resolvida fazendo um **novo deploy** no Netlify após configurar a variável!

