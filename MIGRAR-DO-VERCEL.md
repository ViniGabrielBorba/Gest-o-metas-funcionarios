# 🚀 Migrar Frontend do Vercel para Outra Plataforma

## ⚠️ Problema: Vercel Atingiu Limite Mensal

Se o Vercel atingiu o limite de build minutes ou bandwidth, você precisa migrar para outra plataforma.

## 🎯 Melhores Alternativas Gratuitas

### **1. Netlify** ⭐ (Mais Similar ao Vercel - RECOMENDADO)

**URL:** https://netlify.com

**Vantagens:**
- ✅ Interface muito similar ao Vercel
- ✅ Deploy automático do GitHub
- ✅ 100 builds/minutos gratuitos por mês
- ✅ 100GB bandwidth gratuito por mês
- ✅ SSL/HTTPS gratuito
- ✅ Suporta React perfeitamente
- ✅ Configuração muito fácil

**Limites Gratuitos:**
- 100 builds/minutos por mês
- 100GB bandwidth por mês
- Sites ilimitados

---

### **2. Render.com** 🚀 (Já Está Usando para Backend)

**URL:** https://render.com

**Vantagens:**
- ✅ Você já tem conta
- ✅ Static Sites gratuitos
- ✅ Deploy automático do GitHub
- ✅ SSL/HTTPS gratuito
- ✅ Sem limite de bandwidth (no plano gratuito)

**Limites Gratuitos:**
- Builds ilimitados
- Bandwidth ilimitado
- Sites estáticos gratuitos

---

### **3. Cloudflare Pages** ⚡ (Muito Rápido)

**URL:** https://pages.cloudflare.com

**Vantagens:**
- ✅ Extremamente rápido (CDN global)
- ✅ Builds ilimitados
- ✅ Bandwidth ilimitado
- ✅ SSL/HTTPS gratuito
- ✅ Deploy automático do GitHub

---

## 📋 Guia Passo a Passo: Netlify (Recomendado)

### **Passo 1: Criar Conta no Netlify**

1. Acesse: https://netlify.com
2. Clique em **"Sign up"**
3. Escolha **"GitHub"** para conectar com sua conta
4. Autorize o Netlify a acessar seus repositórios

### **Passo 2: Importar Projeto**

1. No dashboard do Netlify, clique em **"Add new site"**
2. Escolha **"Import an existing project"**
3. Selecione **"GitHub"**
4. Escolha seu repositório: `Gest-o-metas-funcionarios`
5. Clique em **"Import"**

### **Passo 3: Configurar Build Settings**

Configure assim:

```
Branch to deploy: main

Build settings:
  Base directory: frontend
  Build command: npm run build
  Publish directory: frontend/build
```

**IMPORTANTE:**
- **Base directory:** `frontend` (isso faz o Netlify trabalhar dentro da pasta frontend)
- **Build command:** `npm run build` (já está dentro do diretório frontend)
- **Publish directory:** `frontend/build` (onde o React gera os arquivos)

### **Passo 4: Configurar Variáveis de Ambiente**

1. Role até **"Environment variables"**
2. Clique em **"Add variable"**
3. Adicione:

```
Key: REACT_APP_API_URL
Value: https://gest-o-metas-funcionarios-3.onrender.com/api
```

4. Marque para **Production**, **Deploy Preview** e **Branch Deploys**

### **Passo 5: Deploy**

1. Clique em **"Deploy site"**
2. Aguarde 2-3 minutos
3. Pronto! Você terá uma URL como: `https://seu-app.netlify.app`

### **Passo 6: Configurar Domínio Personalizado (Opcional)**

1. Vá em **"Site settings"** → **"Domain management"**
2. Clique em **"Add custom domain"**
3. Digite seu domínio (se tiver)

---

## 📋 Guia Passo a Passo: Render.com

### **Passo 1: Criar Static Site no Render**

1. Acesse: https://render.com
2. Faça login (já deve ter conta)
3. Clique em **"New +"**
4. Escolha **"Static Site"**

### **Passo 2: Conectar Repositório**

1. Conecte com **GitHub**
2. Selecione o repositório: `Gest-o-metas-funcionarios`
3. Clique em **"Connect"**

### **Passo 3: Configurar Build**

Configure assim:

```
Name: gestao-metas-frontend (ou qualquer nome)

Build Command: cd frontend && npm install && npm run build

Publish Directory: frontend/build

Branch: main
```

### **Passo 4: Configurar Variáveis de Ambiente**

1. Role até **"Environment"**
2. Clique em **"Add Environment Variable"**
3. Adicione:

```
Key: REACT_APP_API_URL
Value: https://gest-o-metas-funcionarios-3.onrender.com/api
```

### **Passo 5: Deploy**

1. Clique em **"Create Static Site"**
2. Aguarde 3-5 minutos
3. Pronto! Você terá uma URL como: `https://gestao-metas-frontend.onrender.com`

---

## 📋 Guia Passo a Passo: Cloudflare Pages

### **Passo 1: Criar Conta**

1. Acesse: https://pages.cloudflare.com
2. Faça login (ou crie conta)
3. Conecte com **GitHub**

### **Passo 2: Criar Projeto**

1. Clique em **"Create a project"**
2. Selecione seu repositório: `Gest-o-metas-funcionarios`
3. Clique em **"Begin setup"**

### **Passo 3: Configurar Build**

Configure assim:

```
Project name: gestao-metas-frontend

Production branch: main

Build configuration:
  Framework preset: Create React App
  Build command: npm run build
  Build output directory: build
  Root directory: frontend
```

**IMPORTANTE:**
- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Build output directory:** `build`

### **Passo 4: Configurar Variáveis de Ambiente**

1. Role até **"Environment variables"**
2. Clique em **"Add variable"**
3. Adicione:

```
Variable name: REACT_APP_API_URL
Value: https://gest-o-metas-funcionarios-3.onrender.com/api
```

### **Passo 5: Deploy**

1. Clique em **"Save and Deploy"**
2. Aguarde 2-3 minutos
3. Pronto! Você terá uma URL como: `https://gestao-metas-frontend.pages.dev`

---

## 🔄 Atualizar URL do Frontend

Depois de migrar, você precisa atualizar a URL do frontend no backend (se estiver usando CORS):

1. No Render (backend), vá em **Environment**
2. Atualize a variável `FRONTEND_URL`:
   - Se migrou para Netlify: `https://seu-app.netlify.app`
   - Se migrou para Render: `https://seu-app.onrender.com`
   - Se migrou para Cloudflare: `https://seu-app.pages.dev`

---

## ✅ Comparação Rápida

| Plataforma | Builds/Mês | Bandwidth | Dificuldade | Velocidade |
|------------|------------|-----------|-------------|------------|
| **Netlify** | 100 builds/min | 100GB | ⭐ Muito fácil | ⚡ Rápido |
| **Render** | Ilimitado | Ilimitado | ⭐ Fácil | ⚡ Rápido |
| **Cloudflare** | Ilimitado | Ilimitado | ⭐ Fácil | ⚡⚡ Muito rápido |

---

## 🎯 Recomendação

**Use Netlify** se:
- Quer interface similar ao Vercel
- 100 builds/min por mês é suficiente
- Quer configuração mais fácil

**Use Render.com** se:
- Já está usando para backend
- Quer tudo em um lugar
- Quer builds ilimitados

**Use Cloudflare Pages** se:
- Quer máxima velocidade
- Quer builds e bandwidth ilimitados
- Não se importa com interface diferente

---

## 🆘 Problemas Comuns

### Erro: "Build failed"

**Solução:**
- Verifique se o **Base directory** está como `frontend`
- Verifique se o **Build command** está como `npm run build`
- Verifique se o **Publish directory** está como `frontend/build` (Netlify) ou `build` (Cloudflare)

### Frontend não conecta ao backend

**Solução:**
- Verifique se a variável `REACT_APP_API_URL` está configurada
- Verifique se a URL termina com `/api`
- Verifique se o backend está rodando no Render

### Build demora muito

**Solução:**
- Normal, primeira build pode demorar 3-5 minutos
- Builds seguintes são mais rápidos (cache)

---

## 📝 Checklist de Migração

- [ ] Criar conta na nova plataforma
- [ ] Conectar repositório GitHub
- [ ] Configurar Base/Root directory como `frontend`
- [ ] Configurar Build command como `npm run build`
- [ ] Configurar Publish directory como `frontend/build` ou `build`
- [ ] Adicionar variável `REACT_APP_API_URL`
- [ ] Fazer primeiro deploy
- [ ] Testar se o frontend conecta ao backend
- [ ] Atualizar `FRONTEND_URL` no backend (se necessário)
- [ ] Compartilhar nova URL com usuários

---

## 💡 Dica

Depois de migrar, você pode manter o projeto no Vercel também (se quiser). Mas se atingiu o limite, é melhor desativar o deploy automático no Vercel para não consumir mais recursos.

Para desativar no Vercel:
1. Vá em **Settings** → **Git**
2. Desconecte o repositório ou desative **"Automatic deployments"**

---

## 🚀 Pronto!

Agora você tem o frontend rodando em uma plataforma gratuita sem limites! 🎉

