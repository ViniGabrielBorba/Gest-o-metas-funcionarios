# 🚀 Configurar Backend no Fly.io - Passo a Passo Completo

## ⚡ Passo a Passo Rápido

### **1. Instalar Fly CLI**

Fly.io usa linha de comando (CLI). Você precisa instalar primeiro.

#### **Windows (PowerShell):**

```powershell
# Instalar via winget (Windows 11/10)
winget install -e --id Fly.Flyctl

# OU baixar manualmente:
# Acesse: https://fly.io/docs/getting-started/installing-flyctl/
# Baixe o instalador .msi e execute
```

#### **Verificar Instalação:**

Abra um novo terminal e verifique:

```powershell
flyctl version
```

Se aparecer a versão, está instalado! ✅

---

### **2. Criar Conta no Fly.io**

1. **Acesse:** https://fly.io
2. **Clique em "Get Started"** ou **"Sign Up"**
3. **Escolha:**
   - **"Sign up with GitHub"** (recomendado)
   - Ou use email normal
4. **Confirme seu email** (se usar email)

---

### **3. Fazer Login no Fly CLI**

Abra o terminal (PowerShell) no diretório do seu projeto:

```powershell
cd C:\Users\vinicius\Desktop\gerente

# Fazer login
flyctl auth login
```

Isso vai abrir o navegador para você autorizar. Depois volte ao terminal.

---

### **4. Criar Arquivo de Configuração (fly.toml)**

O Fly.io precisa de um arquivo de configuração. Vou criar para você:

1. **No terminal, execute:**

```powershell
flyctl launch
```

2. **Responda as perguntas:**
   - **App name:** `sistema-gestao-backend` (ou qualquer nome)
   - **Region:** Escolha a mais próxima (ex: `sao` para São Paulo ou `iad` para Washington)
   - **Postgres?** → `n` (não, vamos usar MongoDB Atlas)
   - **Redis?** → `n` (não)
   - **Deploy?** → `n` (ainda não, vamos configurar primeiro)

Isso vai criar o arquivo `fly.toml` no seu projeto.

---

### **5. Configurar o fly.toml**

O arquivo `fly.toml` já foi criado para você! Ele está na raiz do projeto.

**OU** você pode usar o que já criamos (se já existe, substitua pelo conteúdo correto).

---

### **6. Configurar Variáveis de Ambiente**

No Fly.io, você precisa configurar as variáveis de ambiente via CLI:

```powershell
# MONGODB_URI
flyctl secrets set MONGODB_URI="mongodb+srv://gerente:SUA_SENHA@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0"

# JWT_SECRET
flyctl secrets set JWT_SECRET="secret_key_gestao_metas_producao_2024"

# NODE_ENV
flyctl secrets set NODE_ENV="production"

# FRONTEND_URL
flyctl secrets set FRONTEND_URL="https://seu-app.vercel.app"
```

⚠️ **IMPORTANTE:** Substitua `SUA_SENHA` pela sua senha real do MongoDB Atlas e `seu-app` pela URL do Vercel.

---

### **7. Fazer Deploy**

Agora você pode fazer o deploy:

```powershell
flyctl deploy
```

Isso vai:
1. Construir a imagem Docker
2. Fazer upload para o Fly.io
3. Iniciar o servidor

Aguarde 2-5 minutos (primeiro deploy é mais lento).

---

### **8. Obter URL do Backend**

Após o deploy, você pode ver a URL:

```powershell
flyctl status
```

Ou acesse o dashboard do Fly.io: https://fly.io/dashboard

A URL será algo como: `https://sistema-gestao-backend.fly.dev`

---

### **9. Testar o Backend**

1. Abra a URL gerada no navegador
2. Adicione `/api/test` no final:
   ```
   https://sua-url.fly.dev/api/test
   ```
3. Deve aparecer: `{"message":"API funcionando!"}`
4. ✅ Se aparecer, o backend está funcionando!

---

## 🔧 Configuração Completa

### **Arquivos Criados:**

1. **fly.toml** - Configuração do Fly.io
2. **Dockerfile** - Para construir a imagem Docker

### **Comandos Principais:**

```powershell
# Login
flyctl auth login

# Configurar secrets (variáveis de ambiente)
flyctl secrets set MONGODB_URI="..."
flyctl secrets set JWT_SECRET="..."
flyctl secrets set NODE_ENV="production"
flyctl secrets set FRONTEND_URL="..."

# Deploy
flyctl deploy

# Ver status
flyctl status

# Ver logs
flyctl logs

# Ver variáveis configuradas
flyctl secrets list
```

---

## ✅ Checklist

- [ ] Fly CLI instalado (`flyctl version` funciona)
- [ ] Conta criada no Fly.io
- [ ] Login feito (`flyctl auth login`)
- [ ] Arquivo `fly.toml` criado
- [ ] Arquivo `Dockerfile` criado
- [ ] Variável `MONGODB_URI` configurada (com senha real)
- [ ] Variável `JWT_SECRET` configurada
- [ ] Variável `NODE_ENV` configurada
- [ ] Variável `FRONTEND_URL` configurada (com URL do Vercel)
- [ ] Deploy realizado (`flyctl deploy`)
- [ ] URL do backend obtida
- [ ] Teste `/api/test` funcionando
- [ ] `REACT_APP_API_URL` atualizado no Vercel

---

## 🆘 Problemas Comuns

### Erro: "flyctl: command not found"
- ✅ Instale o Fly CLI novamente
- ✅ Feche e abra o terminal
- ✅ Verifique se está no PATH

### Erro: "No Dockerfile found"
- ✅ Certifique-se que o `Dockerfile` está na raiz do projeto
- ✅ Verifique se o arquivo está nomeado corretamente (sem extensão)

### Erro: "Cannot connect to MongoDB"
- ✅ Verifique Network Access no MongoDB Atlas (0.0.0.0/0)
- ✅ Verifique se a senha está correta
- ✅ Verifique se `MONGODB_URI` foi configurada: `flyctl secrets list`

### Erro no build
- ✅ Verifique os logs: `flyctl logs`
- ✅ Verifique se o `Dockerfile` está correto
- ✅ Verifique se o `package.json` está na raiz

---

## 💡 Dicas

### **Ver Logs em Tempo Real:**

```powershell
flyctl logs
```

### **Reiniciar o App:**

```powershell
flyctl restart
```

### **Ver Informações do App:**

```powershell
flyctl status
```

### **Atualizar Variáveis:**

```powershell
flyctl secrets set NOVA_VARIAVEL="valor"
```

---

## 📝 Resumo das Variáveis

Execute estes comandos (substitua os valores):

```powershell
flyctl secrets set MONGODB_URI="mongodb+srv://gerente:SUA_SENHA@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0"
flyctl secrets set JWT_SECRET="secret_key_gestao_metas_producao_2024"
flyctl secrets set NODE_ENV="production"
flyctl secrets set FRONTEND_URL="https://seu-app.vercel.app"
```

---

## 🔗 Links Úteis

- **Fly.io Dashboard:** https://fly.io/dashboard
- **Documentação:** https://fly.io/docs
- **Instalar CLI:** https://fly.io/docs/getting-started/installing-flyctl/

---

**Pronto! Siga esses passos e seu backend estará funcionando no Fly.io!** 🎉

Se tiver alguma dúvida durante o processo, me avise!
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file
