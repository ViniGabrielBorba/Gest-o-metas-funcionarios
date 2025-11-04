# 🚀 Guia Completo: Deploy do Sistema de Gestão de Metas

> **Objetivo:** Fazer o deploy do sistema para que outras pessoas possam acessar pela internet, sem precisar instalar nada.

## ⚡ Resumo Rápido

1. **Backend no Railway** → Hospeda a API (banco de dados, autenticação, etc.)
2. **Frontend no Vercel** → Hospeda a interface (o que o usuário vê)
3. **MongoDB Atlas** → Banco de dados na nuvem (já configurado)
4. **Resultado:** Qualquer pessoa acessa pelo navegador e usa o sistema!

**Tempo estimado:** 30-45 minutos  
**Custo:** $0 (gratuito para começar)

---

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Preparação do Código](#preparação-do-código)
3. [Deploy do Backend (Railway)](#deploy-do-backend-railway)
4. [Deploy do Frontend (Vercel)](#deploy-do-frontend-vercel)
5. [Configuração Final](#configuração-final)
6. [Testando o Sistema](#testando-o-sistema)
7. [Problemas Comuns](#problemas-comuns)

---

## 📦 Pré-requisitos

### O que você precisa:
- ✅ Conta no GitHub (gratuita)
- ✅ Conta no MongoDB Atlas (gratuita)
- ✅ Conta no Railway.app (gratuita)
- ✅ Conta no Vercel.com (gratuita)
- ✅ Código do projeto no GitHub

### Se ainda não tem o código no GitHub:

1. Acesse: https://github.com
2. Crie uma conta (se não tiver)
3. Crie um novo repositório (New Repository)
4. Nome: `sistema-gestao-metas` (ou qualquer nome)
5. Marque como **Público** ou **Privado** (ambos funcionam)
6. Faça upload do código:
   - Use GitHub Desktop: https://desktop.github.com
   - Ou use Git no terminal:
     ```bash
     git init
     git add .
     git commit -m "Primeiro commit"
     git remote add origin https://github.com/SEU-USUARIO/sistema-gestao-metas.git
     git push -u origin main
     ```

---

## 🔧 Preparação do Código

### 1. Verificar arquivos necessários

Os arquivos já devem existir no projeto, mas vamos verificar:

✅ **backend/Procfile** - Já existe: `web: node backend/server.js`
✅ **backend/package.json** - Já está configurado corretamente
✅ **frontend/package.json** - Já está configurado corretamente
✅ **backend/server.js** - Já aceita variável PORT do ambiente
✅ **frontend/src/utils/api.js** - Já usa REACT_APP_API_URL

**Tudo pronto!** Não precisa criar nenhum arquivo adicional.

### 2. Verificar MongoDB Atlas

1. Acesse: https://www.mongodb.com/cloud/atlas
2. Faça login na sua conta
3. Vá em **Network Access**
4. Clique em **Add IP Address**
5. Selecione **Allow Access from Anywhere** (0.0.0.0/0)
6. Clique em **Confirm**
7. Anote sua **Connection String** (MONGODB_URI)

---

## 🌐 Deploy do Backend (Railway)

### Passo 1: Criar conta no Railway

1. Acesse: https://railway.app
2. Clique em **Start a New Project**
3. Escolha **Login with GitHub**
4. Autorize o Railway a acessar seus repositórios

### Passo 2: Criar novo projeto

1. No dashboard do Railway, clique em **New Project**
2. Selecione **Deploy from GitHub repo**
3. Escolha seu repositório `sistema-gestao-metas`
4. Aguarde o Railway detectar o projeto

### Passo 3: Configurar variáveis de ambiente

1. No projeto Railway, clique em **Variables** (ou na aba Settings → Variables)
2. Clique em **+ New Variable**
3. Adicione as seguintes variáveis:

**Variável 1:**
- **Name:** `MONGODB_URI`
- **Value:** `mongodb+srv://gerente:32668633@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0`
- *(⚠️ IMPORTANTE: Esta é a connection string do projeto. Se você tiver uma diferente do MongoDB Atlas, use a sua!)*
- *Para encontrar sua connection string: MongoDB Atlas → Clusters → Connect → Connect your application → copie a string*

**Variável 2:**
- **Name:** `JWT_SECRET`
- **Value:** `sua_chave_secreta_super_segura_2024_mude_esta_senha`
- *(Pode ser qualquer string aleatória, mas mantenha segura)*

**Variável 3:**
- **Name:** `NODE_ENV`
- **Value:** `production`

**Variável 4:**
- **Name:** `FRONTEND_URL`
- **Value:** `https://seu-app.vercel.app`
- *(Vamos atualizar isso depois com a URL do Vercel)*

4. Clique em **Save** para cada variável

### Passo 4: Configurar o Deploy

1. No projeto Railway, clique em **Settings**
2. Vá na seção **Deploy**
3. Verifique se está configurado:
   - **Build Command:** (deixe vazio ou `npm install`)
   - **Start Command:** `node backend/server.js`
   - **Root Directory:** `/` (raiz)

### Passo 5: Gerar URL do Backend

1. No projeto Railway, clique em **Settings**
2. Vá em **Networking**
3. Clique em **Generate Domain**
4. Railway vai gerar uma URL como: `https://sistema-backend-production.up.railway.app`
5. **COPIE ESSA URL!** Você vai precisar dela no próximo passo

### Passo 6: Testar o Backend

1. Abra a URL gerada no navegador
2. Adicione `/api/test` no final: `https://sua-url.railway.app/api/test`
3. Deve aparecer: `{"message":"API funcionando!"}`
4. Se aparecer, o backend está funcionando! ✅

---

## 🎨 Deploy do Frontend (Vercel)

### Passo 1: Criar conta no Vercel

1. Acesse: https://vercel.com
2. Clique em **Sign Up**
3. Escolha **Continue with GitHub**
4. Autorize o Vercel a acessar seus repositórios

### Passo 2: Importar projeto

1. No dashboard do Vercel, clique em **Add New...**
2. Selecione **Project**
3. Na lista de repositórios, encontre `sistema-gestao-metas`
4. Clique em **Import**

### Passo 3: Configurar o Build

Na tela de configuração, ajuste:

- **Framework Preset:** `Create React App` (ou deixe em "Other")
- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Output Directory:** `build`
- **Install Command:** (deixe vazio)

### Passo 4: Configurar Variáveis de Ambiente

1. Na seção **Environment Variables**, clique em **Add**
2. Adicione:

**Variável:**
- **Name:** `REACT_APP_API_URL`
- **Value:** `https://sua-url-backend.railway.app/api`
- *(Substitua pela URL do Railway do Passo 5 da seção Backend)*
- **Environment:** Selecione todas (Production, Preview, Development)

3. Clique em **Save**

### Passo 5: Fazer Deploy

1. Clique em **Deploy**
2. Aguarde 2-5 minutos enquanto o Vercel:
   - Instala as dependências
   - Faz o build do projeto
   - Faz o deploy
3. Quando terminar, você verá uma URL como: `https://sistema-gestao-metas.vercel.app`
4. **COPIE ESSA URL!**

### Passo 6: Atualizar Backend com URL do Frontend

1. Volte para o Railway
2. No projeto do backend, vá em **Variables**
3. Edite a variável `FRONTEND_URL`
4. Cole a URL do Vercel: `https://sua-url.vercel.app`
5. Salve
6. O Railway vai fazer um redeploy automaticamente

---

## ✅ Configuração Final

### 1. Verificar MongoDB Atlas Network Access

1. Acesse MongoDB Atlas
2. Vá em **Network Access**
3. Verifique se tem um IP `0.0.0.0/0` (Allow Access from Anywhere)
4. Se não tiver, adicione:
   - Clique em **Add IP Address**
   - Selecione **Allow Access from Anywhere**
   - Clique em **Confirm**

### 2. Testar conexão completa

1. Acesse a URL do frontend (Vercel)
2. Tente criar uma conta:
   - Clique em **Cadastre-se**
   - Preencha os dados
   - Clique em **Cadastrar**
3. Se funcionar, o deploy está completo! 🎉

---

## 🧪 Testando o Sistema

### Teste 1: Cadastro de Gerente

1. Acesse: `https://sua-url.vercel.app`
2. Clique em **Cadastre-se**
3. Preencha:
   - Nome completo
   - Email
   - Senha
   - Nome da loja
4. Clique em **Cadastrar**
5. Deve redirecionar para o login

### Teste 2: Login

1. Faça login com as credenciais criadas
2. Deve entrar no Dashboard

### Teste 3: Funcionalidades

1. Tente criar um funcionário
2. Tente criar uma meta
3. Tente registrar uma venda
4. Se tudo funcionar, está pronto! ✅

### Teste 4: Múltiplos Usuários

1. Abra uma **janela anônima** (Ctrl+Shift+N)
2. Acesse a mesma URL
3. Crie outra conta de gerente
4. Verifique que os dados são separados (isolamento)

---

## 🆘 Problemas Comuns

### ❌ Frontend não conecta ao backend

**Sintomas:** Erro "Failed to fetch" ou "Network Error"

**Soluções:**
1. Verifique `REACT_APP_API_URL` no Vercel:
   - Deve ser: `https://sua-url.railway.app/api`
   - **NÃO** deve ter barra no final
2. Verifique se o backend está rodando:
   - Acesse: `https://sua-url.railway.app/api/test`
   - Deve retornar: `{"message":"API funcionando!"}`
3. Verifique CORS no backend:
   - No Railway, variável `FRONTEND_URL` deve ter a URL do Vercel

### ❌ Erro de conexão MongoDB

**Sintomas:** Erro ao cadastrar ou fazer login

**Soluções:**
1. Verifique Network Access no MongoDB Atlas:
   - Deve permitir `0.0.0.0/0`
2. Verifique `MONGODB_URI` no Railway:
   - Deve estar correta
   - Deve incluir a senha
   - Deve ter `/gestao-metas` no final
3. Verifique a senha do MongoDB:
   - Se mudou a senha, atualize a connection string

### ❌ Build falha no Vercel

**Sintomas:** Deploy falha com erro

**Soluções:**
1. Verifique os logs do build no Vercel
2. Certifique-se que `Root Directory` está como `frontend`
3. Certifique-se que `Build Command` está como `npm install && npm run build`
4. Certifique-se que `Output Directory` está como `build`
5. Teste localmente:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   Se funcionar localmente, o problema pode ser nas configurações do Vercel

### ❌ Backend não inicia no Railway

**Sintomas:** Deploy falha ou erro 500

**Soluções:**
1. Verifique `Start Command` no Railway:
   - Deve ser: `node backend/server.js`
2. Verifique se todas as variáveis estão configuradas
3. Veja os logs no Railway:
   - Clique em **Deployments** → **View Logs**
   - Procure por erros

### ❌ Erro 401 (Não autorizado)

**Sintomas:** Não consegue fazer login

**Soluções:**
1. Verifique se `JWT_SECRET` está configurado no Railway
2. Tente criar uma nova conta
3. Limpe o cache do navegador (Ctrl+Shift+Delete)

---

## 📱 Como outras pessoas vão usar

### Para cada gerente:

1. **Envie a URL do frontend:** `https://sua-url.vercel.app`
2. **Instruções:**
   - Abra a URL no navegador (Chrome, Firefox, Edge, etc.)
   - Clique em **"Cadastre-se"**
   - Preencha os dados:
     - Nome completo
     - Email
     - Senha
     - Nome da loja
   - Clique em **"Cadastrar"**
   - Faça login
   - Pronto! Pode usar o sistema

### Funciona em:
- ✅ Computador (Windows, Mac, Linux)
- ✅ Celular (Android, iPhone)
- ✅ Tablet
- ✅ Qualquer navegador moderno

### Não precisa:
- ❌ Instalar nada
- ❌ Baixar aplicativo
- ❌ Configurar nada
- ❌ Saber programar

---

## 🔐 Segurança

### Boas práticas:

1. **JWT_SECRET:** Use uma senha forte e única
2. **MongoDB Atlas:** Mantenha a senha segura
3. **URLs:** Não compartilhe as URLs de produção em locais públicos
4. **Variáveis de ambiente:** NUNCA commite no GitHub

### O que já está seguro:

- ✅ Cada gerente só vê seus próprios dados
- ✅ Senhas são criptografadas (bcrypt)
- ✅ Tokens JWT para autenticação
- ✅ CORS configurado corretamente

---

## 📊 Monitoramento

### Railway (Backend):

1. Acesse o dashboard do Railway
2. Veja métricas:
   - Uso de CPU
   - Uso de memória
   - Logs em tempo real
   - Status do deploy

### Vercel (Frontend):

1. Acesse o dashboard do Vercel
2. Veja métricas:
   - Visitas
   - Performance
   - Logs de build
   - Analytics

---

## 💰 Custos

### Plano Gratuito:

- **Railway:** 500 horas/mês grátis (mais que suficiente)
- **Vercel:** Ilimitado para projetos pessoais
- **MongoDB Atlas:** 512MB grátis (suficiente para começar)

### Se precisar de mais:

- **Railway:** $5/mês (plano Hobby)
- **Vercel:** Gratuito continua sendo suficiente
- **MongoDB Atlas:** $9/mês (plano M0)

**Total estimado:** $0 a $14/mês (dependendo do uso)

---

## ✅ Checklist Final

Antes de considerar o deploy completo, verifique:

- [ ] Backend rodando no Railway
- [ ] Frontend rodando no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] MongoDB Atlas permitindo acesso
- [ ] `REACT_APP_API_URL` aponta para o backend
- [ ] `FRONTEND_URL` no backend aponta para o Vercel
- [ ] Testado cadastro de novo gerente
- [ ] Testado login
- [ ] Testado criação de funcionário
- [ ] Testado criação de meta
- [ ] Testado registro de venda
- [ ] Testado isolamento de dados (2 gerentes diferentes)

---

## 🎉 Pronto!

Seu sistema está no ar! Agora você pode:

1. **Compartilhar a URL** com seus gerentes
2. **Cada gerente cria sua conta** e usa o sistema
3. **Monitorar** pelo dashboard do Railway e Vercel
4. **Atualizar** fazendo push para o GitHub (deploy automático)

---

## 📞 Precisa de ajuda?

Se tiver problemas em algum passo:

1. Verifique os logs no Railway (backend) ou Vercel (frontend)
2. Verifique se todas as variáveis estão configuradas
3. Teste localmente primeiro
4. Consulte a seção "Problemas Comuns" acima

---

**Boa sorte com o deploy! 🚀**

