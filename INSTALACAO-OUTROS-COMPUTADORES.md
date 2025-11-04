# 💻 Guia de Instalação em Outros Computadores

## 📋 Índice
1. [Opção 1: Hospedar na Web (RECOMENDADO)](#opção-1-hospedar-na-web-recomendado)
2. [Opção 2: Instalação Local em Cada Computador](#opção-2-instalação-local-em-cada-computador)
3. [Solução de Problemas](#solução-de-problemas)

---

## 🌐 Opção 1: Hospedar na Web (RECOMENDADO)

### ✅ Vantagens:
- ✅ Instalar **APENAS UMA VEZ** na nuvem
- ✅ Funciona em **qualquer computador** sem instalar nada
- ✅ Funciona em **celular e tablet**
- ✅ Sempre atualizado para todos
- ✅ Não precisa configurar MongoDB em cada PC

### 📖 Passo a Passo:
Consulte o arquivo `GUIA-DEPLOY-COMPLETO.md` para instruções detalhadas.

**Resumo:**
1. Fazer deploy no Railway (backend) - Gratuito
2. Fazer deploy no Vercel (frontend) - Gratuito  
3. Compartilhar a URL com todos os gerentes

**Tempo estimado:** 30-45 minutos (uma vez só)

---

## 💾 Opção 2: Instalação Local em Cada Computador

### ⚠️ Requisitos para Cada Computador:
- Windows 10 ou superior
- Node.js instalado (versão 16 ou superior)
- MongoDB instalado OU acesso ao MongoDB Atlas (cloud)
- Conexão com internet (para MongoDB Atlas)

---

### 📦 PASSO 1: Preparar os Arquivos

#### No computador onde o sistema já está funcionando:

1. **Copiar toda a pasta do projeto:**
   ```powershell
   # Localização atual:
   C:\Users\vinicius\Desktop\gerente
   ```

2. **Copiar para pendrive ou nuvem:**
   - Copie toda a pasta `gerente`
   - Pode usar Google Drive, OneDrive, ou pendrive

3. **IMPORTANTE - Criar arquivo de instruções:**
   - Criar um arquivo chamado `LEIA-ME.txt` na pasta
   - Ou enviar este guia para quem vai instalar

---

### 🚀 PASSO 2: Instalação em Novo Computador

#### 2.1 Instalar Node.js

1. **Baixar Node.js:**
   - Acesse: https://nodejs.org/
   - Baixe a versão **LTS** (Long Term Support)
   - Versão recomendada: 18.x ou 20.x

2. **Instalar:**
   - Execute o instalador baixado
   - Clique em "Next" em todas as telas (mantenha padrões)
   - Marque a opção "Automatically install the necessary tools"
   - Clique em "Install"
   - Aguarde a instalação
   - Clique em "Finish"

3. **Verificar instalação:**
   - Abra PowerShell ou Prompt de Comando
   - Digite: `node --version`
   - Deve aparecer: `v18.x.x` ou `v20.x.x`
   - Digite: `npm --version`
   - Deve aparecer um número de versão

#### 2.2 Instalar MongoDB (OU usar MongoDB Atlas)

**Opção A: MongoDB Atlas (RECOMENDADO - Mais fácil):**

1. **Criar conta no MongoDB Atlas:**
   - Acesse: https://www.mongodb.com/cloud/atlas/register
   - Crie uma conta gratuita
   - Confirme o email

2. **Criar Cluster:**
   - Clique em "Build a Database"
   - Escolha "FREE" (M0)
   - Escolha região mais próxima (São Paulo, etc)
   - Clique em "Create"

3. **Configurar Acesso:**
   - **Criar Usuário:**
     - Vá em "Database Access"
     - Clique em "Add New Database User"
     - Username: `gerente` (ou qualquer nome)
     - Password: Crie uma senha segura (ANOTE ELA!)
     - Role: "Atlas Admin"
     - Clique em "Add User"
   
   - **Configurar Network Access:**
     - Vá em "Network Access"
     - Clique em "Add IP Address"
     - Escolha "Allow Access from Anywhere" (0.0.0.0/0)
     - Clique em "Confirm"

4. **Obter String de Conexão:**
   - Clique em "Connect" no cluster
   - Escolha "Connect your application"
   - Copie a string (algo como: `mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/...`)
   - **IMPORTANTE:** Substitua `<password>` pela senha real que você criou
   - Exemplo: Se senha é `abc123`, a string fica: `mongodb+srv://gerente:abc123@cluster0.xxxxx.mongodb.net/...`

**Opção B: MongoDB Local (Mais complexo):**

1. **Baixar MongoDB:**
   - Acesse: https://www.mongodb.com/try/download/community
   - Escolha Windows x64
   - Baixe o instalador MSI

2. **Instalar:**
   - Execute o instalador
   - **IMPORTANTE:** Marque "Install MongoDB as a Service"
   - Deixe "Run service as Network Service user" marcado
   - Clique em "Install"
   - Aguarde instalação

3. **Verificar:**
   - Abra "Gerenciador de Serviços" (services.msc)
   - Procure por "MongoDB"
   - Status deve estar "Em execução"

---

### 📂 PASSO 3: Copiar Arquivos do Sistema

1. **Copiar a pasta do projeto:**
   - Cole a pasta `gerente` em um local no novo computador
   - Exemplo: `C:\SistemaGestao\gerente`
   - Ou: `C:\Users\[SeuUsuario]\Desktop\gerente`

2. **Verificar estrutura:**
   - Abra a pasta `gerente`
   - Deve conter:
     - `backend/` (pasta)
     - `frontend/` (pasta)
     - `package.json`
     - `.env` (ou `.env.example`)
     - Outros arquivos

---

### ⚙️ PASSO 4: Configurar o Sistema

#### 4.1 Criar arquivo .env

1. **Na pasta raiz do projeto** (`gerente`), crie um arquivo chamado `.env`

2. **Abrir com Bloco de Notas ou editor de texto**

3. **Colar este conteúdo:**

   **Se usar MongoDB Atlas:**
   ```
   PORT=5000
   MONGODB_URI=mongodb+srv://gerente:SUA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
   JWT_SECRET=secret_key_gestao_metas_mude_em_producao
   ```
   **Substitua `SUA_SENHA_AQUI` pela senha real do MongoDB Atlas**

   **Se usar MongoDB Local:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gestao-metas
   JWT_SECRET=secret_key_gestao_metas_mude_em_producao
   ```

4. **Salvar o arquivo** como `.env` (sem extensão, ou .env.txt depois renomeie removendo .txt)

---

### 📥 PASSO 5: Instalar Dependências

#### 5.1 Abrir PowerShell na pasta do projeto:

1. **Navegar até a pasta:**
   ```powershell
   cd C:\SistemaGestao\gerente
   ```
   (Substitua pelo caminho real da pasta)

2. **Instalar dependências do backend:**
   ```powershell
   npm install
   ```
   - Aguarde alguns minutos
   - Deve aparecer: `added XXX packages`

3. **Instalar dependências do frontend:**
   ```powershell
   cd frontend
   npm install
   ```
   - Aguarde alguns minutos (pode demorar mais)
   - Deve aparecer: `added XXX packages`

4. **Voltar para pasta raiz:**
   ```powershell
   cd ..
   ```

---

### 🚀 PASSO 6: Iniciar o Sistema

#### 6.1 Método Recomendado (Backend + Frontend Juntos):

```powershell
npm run dev
```

- Aguarde alguns segundos
- Deve aparecer:
  - `✅ MongoDB conectado com sucesso!`
  - `🚀 Servidor rodando na porta 5000`
  - Frontend compilando...

#### 6.2 Ou iniciar separadamente:

**Terminal 1 (Backend):**
```powershell
npm run server
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm start
```

---

### 🌐 PASSO 7: Acessar o Sistema

1. **Aguardar compilação** (30-60 segundos)

2. **Abrir navegador:**
   - Acesse: `http://localhost:3000`
   - Deve abrir a tela de login

3. **Criar conta ou fazer login:**
   - Se for o primeiro uso, clique em "Cadastre-se"
   - Preencha seus dados
   - Faça login

---

### 📝 PASSO 8: Verificar se Está Funcionando

1. ✅ Backend rodando (terminal mostra mensagens)
2. ✅ Frontend abriu no navegador
3. ✅ Consegue criar conta/login
4. ✅ Consegue acessar dashboard

---

## 🔄 Para Cada Novo Computador:

Repita os passos 2 a 7 em cada computador novo.

---

## 💡 Dicas Importantes:

### Compartilhar o mesmo banco de dados:
- **Use MongoDB Atlas** (recomendado)
- Todos os computadores usam a mesma string de conexão
- Todos veem os mesmos dados (mas isolados por loja/gerente)

### Usar bancos separados:
- Cada computador pode usar MongoDB local
- OU criar clusters separados no MongoDB Atlas
- Cada um terá dados independentes

### Atualizar o sistema:
- Quando houver atualizações, copie os arquivos novos
- Execute `npm install` novamente
- Reinicie o sistema

---

## 🆘 Solução de Problemas

### Erro: "npm não é reconhecido"
- **Causa:** Node.js não instalado ou não está no PATH
- **Solução:** Reinstalar Node.js e reiniciar computador

### Erro: "MongoDB não conectado"
- **Causa:** MongoDB não está rodando ou string de conexão errada
- **Solução:** Verificar string no `.env` ou verificar serviço MongoDB

### Erro: "Porta já em uso"
- **Causa:** Outro programa usando porta 3000 ou 5000
- **Solução:** Encerrar processo ou mudar porta no `.env`

### Sistema não abre no navegador
- **Causa:** Frontend ainda compilando ou erro de compilação
- **Solução:** Aguardar mais tempo ou verificar terminal por erros

---

## 📞 Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs no terminal
2. Confira se todos os passos foram seguidos
3. Consulte arquivo `SOLUCAO-MONGODB.md` para problemas de banco
4. Consulte arquivo `INSTALACAO.md` para problemas de instalação

---

## ✅ Checklist de Instalação:

- [ ] Node.js instalado (`node --version` funciona)
- [ ] MongoDB configurado (Atlas ou Local)
- [ ] Arquivo `.env` criado com configurações corretas
- [ ] Dependências instaladas (`npm install` executado)
- [ ] Backend inicia sem erros
- [ ] Frontend inicia sem erros
- [ ] Sistema abre no navegador
- [ ] Consegue criar conta/login

---

**Tempo estimado total:** 30-60 minutos por computador

**Dica final:** Considere usar a Opção 1 (hospedar na web) - é mais simples e funciona para todos sem instalar nada!

