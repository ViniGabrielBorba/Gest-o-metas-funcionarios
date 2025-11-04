# 🚀 Guia Completo: Deploy para Web (Multi-usuário)

## 📋 O que será feito

Vamos hospedar o sistema na **nuvem** para que **qualquer gerente** possa acessar de qualquer lugar, sem instalar nada!

- ✅ Cada gerente acessa pelo navegador
- ✅ Funciona em celular, tablet e computador
- ✅ Cada um cria sua própria conta
- ✅ Dados isolados por loja (segurança automática)

---

## 🎯 Opção 1: Railway + Vercel (RECOMENDADO - 100% Gratuito)

### **PARTE 1: Backend no Railway**

#### Passo 1: Criar Conta
1. Acesse: https://railway.app
2. Clique em "Start a New Project"
3. Escolha "Login with GitHub"
4. Autorize o Railway

#### Passo 2: Criar Projeto
1. Clique em "New Project"
2. Escolha "Deploy from GitHub repo"
3. Se não tiver repositório no GitHub:
   - Instale o GitHub Desktop: https://desktop.github.com
   - Crie um repositório e faça upload do código
4. Selecione seu repositório

#### Passo 3: Configurar Variáveis de Ambiente
1. No projeto Railway, clique em "Variables"
2. Adicione estas variáveis:

```
MONGODB_URI=mongodb+srv://gerente:32668633@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
JWT_SECRET=secret_key_gestao_metas_producao_2024
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
```

3. Clique em "Save"

#### Passo 4: Configurar Deploy
1. Railway detecta automaticamente Node.js
2. Se não detectar, em "Settings" → "Deploy":
   - Build Command: (deixe vazio ou `npm install`)
   - Start Command: `node backend/server.js`
   - Root Directory: `/`

#### Passo 5: Obter URL do Backend
1. Após deploy (2-3 minutos)
2. Clique em "Settings" → "Generate Domain"
3. Copie a URL (ex: `https://sistema-backend.up.railway.app`)

---

### **PARTE 2: Frontend no Vercel**

#### Passo 1: Criar Conta
1. Acesse: https://vercel.com
2. Clique em "Sign Up"
3. Escolha "Continue with GitHub"
4. Autorize o Vercel

#### Passo 2: Importar Projeto
1. Clique em "Add New" → "Project"
2. Selecione seu repositório GitHub
3. Clique em "Import"

#### Passo 3: Configurar Build
Configure assim:

- **Framework Preset:** Create React App
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `build`
- **Install Command:** (deixe vazio)

#### Passo 4: Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```
REACT_APP_API_URL=https://sua-url-backend.railway.app/api
```

**Substitua** `https://sua-url-backend.railway.app` pela URL real do Railway do Passo 5 da Parte 1.

#### Passo 5: Deploy
1. Clique em "Deploy"
2. Aguarde 2-3 minutos
3. Pronto! Você terá uma URL como: `https://sistema-gestao-metas.vercel.app`

---

## 🌐 Opção 2: Render.com (Alternativa Gratuita)

### Backend:
1. https://render.com → "New" → "Web Service"
2. Conecte GitHub
3. Configure:
   - **Name:** `sistema-gestao-backend`
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node backend/server.js`
4. Adicione variáveis de ambiente (mesmas do Railway)
5. Deploy!

### Frontend:
1. "New" → "Static Site"
2. Configure:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/build`
3. Adicione `REACT_APP_API_URL` com a URL do backend Render
4. Deploy!

---

## 🔒 Configurações Importantes

### 1. MongoDB Atlas Network Access

Para permitir conexões do servidor:

1. Acesse MongoDB Atlas
2. Vá em "Network Access"
3. Clique em "Add IP Address"
4. Escolha "Allow Access from Anywhere" (0.0.0.0/0)
5. Ou adicione o IP específico do Railway/Render

### 2. Atualizar CORS no Backend

O arquivo `backend/server.js` já está configurado para aceitar qualquer origem. Se quiser restringir, edite:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*', // Substitua por sua URL do frontend
  credentials: true
}));
```

---

## 📱 Como Cada Gerente Usa

Após o deploy:

1. **Gerente 1:**
   - Acessa: `https://sistema-gestao-metas.vercel.app`
   - Clica em "Cadastre-se"
   - Cria conta (email, senha, nome da loja)
   - Acessa apenas os dados da sua loja

2. **Gerente 2:**
   - Mesma URL
   - Cria sua própria conta
   - Vê apenas os dados da sua loja

3. **E assim por diante...**

**Não precisa instalar nada!** Funciona em qualquer navegador.

---

## ✅ Checklist de Deploy

- [ ] Backend deployado (Railway/Render)
- [ ] Frontend deployado (Vercel/Render)
- [ ] Variáveis de ambiente configuradas
- [ ] MongoDB Atlas permite acesso (Network Access)
- [ ] `REACT_APP_API_URL` aponta para o backend
- [ ] Testado cadastro de novo gerente
- [ ] Testado login
- [ ] Testado isolamento de dados (cada gerente vê só sua loja)

---

## 🆘 Problemas Comuns

### Frontend não conecta ao backend
- Verifique `REACT_APP_API_URL` no Vercel
- Verifique CORS no backend
- Verifique se o backend está rodando

### Erro de conexão MongoDB
- Verifique Network Access no Atlas
- Verifique `MONGODB_URI` nas variáveis de ambiente
- Verifique se a senha está correta

### Build falha
- Verifique se todas as dependências estão no `package.json`
- Verifique logs do build no Vercel/Render
- Tente fazer build localmente primeiro: `cd frontend && npm run build`

---

## 💰 Custos

- **Railway:** Gratuito (500 horas/mês) ou $5/mês
- **Vercel:** Gratuito (ilimitado para projetos pessoais)
- **Render:** Gratuito (com limitações) ou $7/mês
- **MongoDB Atlas:** Gratuito (512MB)
- **Total:** $0 a $12/mês

---

## 🎉 Pronto!

Após o deploy, compartilhe a URL do frontend com seus gerentes. Cada um pode criar sua conta e usar o sistema!

**URLs de exemplo:**
- Frontend: `https://gestao-metas.vercel.app`
- Backend: `https://backend.up.railway.app`

---

Precisa de ajuda com algum passo específico? Só pedir!

