# 🌐 Como Hospedar o Sistema na Web (Multi-usuário)

## 🎯 Opções de Hospedagem Gratuita/Barata

### Opção 1: Railway.app (Recomendado - Gratuito)

**Backend + MongoDB:**
1. Acesse: https://railway.app
2. Conecte com GitHub (ou crie conta)
3. Clique em "New Project"
4. Escolha "Deploy from GitHub repo"
5. Conecte seu repositório
6. Railway detecta Node.js automaticamente
7. Configure variáveis de ambiente:
   - `MONGODB_URI` (sua string do Atlas)
   - `JWT_SECRET`
   - `PORT` (Railway define automaticamente)

**Frontend:**
1. No mesmo projeto Railway, adicione outro serviço
2. Ou use **Vercel** (gratuito e mais fácil para React):
   - Acesse: https://vercel.com
   - Conecte GitHub
   - Importe o repositório
   - Configure:
     - Build Command: `cd frontend && npm install && npm run build`
     - Output Directory: `frontend/build`
     - Environment Variables: `REACT_APP_API_URL=https://seu-backend.railway.app`

### Opção 2: Render.com (Gratuito)

**Backend:**
1. Acesse: https://render.com
2. Crie conta gratuita
3. "New" → "Web Service"
4. Conecte GitHub repo
5. Configure:
   - Build Command: `npm install`
   - Start Command: `node backend/server.js`
   - Environment Variables: adicione todas do `.env`

**Frontend:**
1. "New" → "Static Site"
2. Configure:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

### Opção 3: Heroku (Gratuito limitado)

Similar ao Render, mas com limite de horas gratuitas.

---

## 📦 Preparação para Deploy

### 1. Criar arquivos de configuração

**backend/Procfile** (para Heroku/Railway):
```
web: node backend/server.js
```

**frontend/.env.production**:
```
REACT_APP_API_URL=https://seu-backend-url.railway.app
```

### 2. Atualizar configurações

**backend/server.js** - Adicionar suporte para variável PORT:
```javascript
const PORT = process.env.PORT || 5000;
```

**frontend/src/utils/api.js** - Usar variável de ambiente:
```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});
```

### 3. MongoDB Atlas (já configurado!)

Seu MongoDB Atlas já está configurado e pode ser acessado de qualquer lugar.

---

## 🚀 Passo a Passo Rápido (Railway + Vercel)

### Backend no Railway:

1. **Criar conta:** https://railway.app
2. **Novo Projeto** → Deploy from GitHub
3. **Adicionar variáveis:**
   ```
   MONGODB_URI=mongodb+srv://gerente:32668633@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
   JWT_SECRET=secret_key_gestao_metas_producao_mude_aqui
   NODE_ENV=production
   ```
4. Railway detecta automaticamente e faz deploy

### Frontend no Vercel:

1. **Criar conta:** https://vercel.com
2. **Import Project** → Conecte GitHub
3. **Configure:**
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `build`
4. **Environment Variables:**
   ```
   REACT_APP_API_URL=https://seu-app.railway.app
   ```
5. Deploy!

---

## 🔒 Segurança para Multi-usuário

### MongoDB Atlas Network Access:

1. Acesse MongoDB Atlas
2. Network Access
3. Adicione IP: `0.0.0.0/0` (permite de qualquer lugar)
   - Ou adicione IPs específicos do servidor

### Variáveis de Ambiente:

**NUNCA** commite senhas no GitHub! Use variáveis de ambiente nos serviços de hospedagem.

---

## 📱 Como Cada Gerente Acessa

Após deploy, cada gerente:

1. Acessa a URL do frontend (ex: `https://gestao-metas.vercel.app`)
2. Clique em "Cadastre-se"
3. Cria sua própria conta de gerente
4. Cada um vê apenas os dados da sua loja (isolamento automático)

**Não precisa instalar nada!** Funciona em:
- Computador
- Tablet
- Celular
- Qualquer navegador

---

## 💰 Custos

- **Railway:** Gratuito até certo limite, depois ~$5/mês
- **Vercel:** Gratuito para projetos pessoais
- **MongoDB Atlas:** Gratuito (até 512MB)
- **Total:** $0 a $5/mês

---

## 🛠️ Quer que eu prepare os arquivos para deploy?

Posso criar:
- ✅ Arquivos de configuração
- ✅ Scripts de build
- ✅ Documentação passo a passo
- ✅ Configuração de CORS para produção

Diga se quer ajuda com o deploy!











