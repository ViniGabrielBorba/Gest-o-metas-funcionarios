# 🚀 Configurar Backend no Railway - Passo a Passo

## ⚡ Passo a Passo Rápido

### **1. Criar Conta e Projeto**

1. **Acesse:** https://railway.app
2. **Clique em "Start a New Project"** ou **"Login"**
3. **Escolha "Login with GitHub"** (mesma conta do Vercel)
4. **Autorize o Railway**

### **2. Criar Novo Projeto**

1. No dashboard, clique em **"+ New Project"** ou **"New"**
2. Escolha **"Deploy from GitHub repo"**
3. Selecione seu repositório (`gerente` ou o nome do seu repositório)
4. O Railway vai detectar automaticamente que é Node.js

### **3. Configurar Variáveis de Ambiente**

⚠️ **IMPORTANTE:** Sem essas variáveis, o backend não vai funcionar!

1. No projeto Railway, clique em **"Variables"** (menu lateral)
2. Clique em **"+ New Variable"** ou **"Add Variable"**

**Adicione estas 4 variáveis:**

#### Variável 1: MONGODB_URI
- **Name:** `MONGODB_URI`
- **Value:** `mongodb+srv://gerente:SUA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0`
- ⚠️ **Substitua** `SUA_SENHA_AQUI` pela sua senha real do MongoDB Atlas

#### Variável 2: JWT_SECRET
- **Name:** `JWT_SECRET`
- **Value:** `secret_key_gestao_metas_producao_2024`

#### Variável 3: NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`

#### Variável 4: FRONTEND_URL
- **Name:** `FRONTEND_URL`
- **Value:** `https://SEU-APP.vercel.app`
- ⚠️ **Substitua** `SEU-APP` pela URL real do seu frontend no Vercel
- Exemplo: `https://sistema-gestao-metas.vercel.app`

### **4. Verificar Configuração de Deploy**

1. No Railway, clique em **"Settings"**
2. Vá em **"Deploy"** (ou "Build & Deploy")
3. Verifique se está assim:
   - **Build Command:** (deixe vazio ou `npm install`)
   - **Start Command:** `node backend/server.js`
   - **Root Directory:** `/` (raiz)

### **5. Gerar URL do Backend**

1. No Railway, clique em **"Settings"**
2. Vá em **"Networking"** ou **"Domains"**
3. Clique em **"Generate Domain"**
4. **Copie a URL gerada!** (ex: `https://sistema-backend.up.railway.app`)
5. Você vai precisar dessa URL para configurar o frontend

### **6. Testar o Backend**

1. Abra a URL gerada no navegador
2. Adicione `/api/test` no final:
   ```
   https://sua-url.railway.app/api/test
   ```
3. Deve aparecer: `{"message":"API funcionando!"}`
4. ✅ Se aparecer, o backend está funcionando!

---

## 🔗 Conectar Frontend ao Backend

Depois que o backend estiver funcionando:

1. **No Vercel:**
   - Vá em **Settings → Environment Variables**
   - Encontre a variável `REACT_APP_API_URL`
   - Atualize o valor para: `https://sua-url-backend.railway.app/api`
   - Clique em **Save**
   - Faça um novo deploy (ou o Vercel pode fazer automaticamente)

2. **No Railway:**
   - Atualize a variável `FRONTEND_URL` com a URL do Vercel
   - O Railway vai reiniciar automaticamente

---

## ✅ Checklist

- [ ] Conta criada no Railway
- [ ] Projeto criado e conectado ao GitHub
- [ ] Variável `MONGODB_URI` adicionada (com senha real)
- [ ] Variável `JWT_SECRET` adicionada
- [ ] Variável `NODE_ENV` adicionada
- [ ] Variável `FRONTEND_URL` adicionada (com URL do Vercel)
- [ ] URL do backend gerada
- [ ] Teste `/api/test` funcionando
- [ ] `REACT_APP_API_URL` atualizado no Vercel

---

## 🆘 Problemas Comuns

### Erro: "MONGODB_URI não encontrada"
- ✅ Verifique se adicionou a variável no Railway
- ✅ Verifique se a senha está correta
- ✅ Verifique se tem `/gestao-metas` na string

### Erro: "Cannot connect to MongoDB"
- ✅ Verifique Network Access no MongoDB Atlas (deve permitir 0.0.0.0/0)
- ✅ Verifique se a senha está correta
- ✅ Verifique se o usuário existe no MongoDB Atlas

### Backend não inicia
- ✅ Verifique os logs no Railway (Deployments → Logs)
- ✅ Verifique se o Start Command está como `node backend/server.js`
- ✅ Verifique se o Root Directory está como `/`

---

## 📝 Exemplo de String MONGODB_URI

Se sua senha for `32668633`:
```
mongodb+srv://gerente:32668633@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
```

**Partes importantes:**
- `mongodb+srv://` - protocolo
- `gerente:32668633` - usuário:senha
- `@cluster0.gbemu6i.mongodb.net` - endereço do cluster
- `/gestao-metas` - **nome do banco** (OBRIGATÓRIO!)
- `?appName=Cluster0` - parâmetros

---

**Pronto! Siga esses passos e seu backend estará funcionando no Railway!** 🎉

