# 🔧 Solução: Erro "Arquivo ou diretório inexistente em rb_sysopen - /tmp/manifest.json"

## ❌ Problema

Este erro geralmente acontece quando:
1. O Fly.io está tentando fazer build mas não encontra arquivos necessários
2. O Dockerfile está tentando copiar arquivos que não existem
3. Há problema com a ordem dos comandos no Dockerfile

---

## ✅ Solução

### **1. Verificar/Corrigir o Dockerfile**

O Dockerfile foi atualizado para corrigir o problema. Certifique-se de que está assim:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
COPY backend/ ./backend/
EXPOSE 8080
CMD ["node", "backend/server.js"]
```

### **2. Criar arquivo .dockerignore**

Crie um arquivo `.dockerignore` na raiz do projeto para ignorar arquivos desnecessários:

```
node_modules
frontend
.git
.gitignore
*.md
.env
.DS_Store
*.log
dist
build
```

### **3. Verificar nome do app no fly.toml**

O nome do app no `fly.toml` deve corresponder ao nome que você criou no Fly.io.

Se você criou o app como `gest-o-metas-funcionarios`, o `fly.toml` deve ter:
```toml
app = "gest-o-metas-funcionarios"
```

### **4. Fazer Deploy Novamente**

Depois de corrigir os arquivos, tente fazer deploy novamente:

```powershell
flyctl deploy
```

---

## 🔍 Verificar se os arquivos estão corretos

### **Estrutura esperada:**

```
seu-projeto/
├── package.json          ← Deve existir
├── package-lock.json     ← Deve existir (ou será criado)
├── backend/
│   └── server.js         ← Deve existir
├── Dockerfile            ← Deve existir
├── fly.toml             ← Deve existir
└── .dockerignore         ← Deve existir (novo)
```

---

## 🆘 Se Ainda Não Funcionar

### **Opção 1: Limpar e Rebuild**

```powershell
# Limpar cache do build
flyctl deploy --no-cache
```

### **Opção 2: Verificar se o package-lock.json existe**

Se não existir, crie:

```powershell
npm install
```

Isso vai gerar o `package-lock.json`.

### **Opção 3: Usar Buildpack ao invés de Dockerfile**

Se continuar com erro, você pode deixar o Fly.io detectar automaticamente:

1. Remova ou renomeie o `Dockerfile` temporariamente
2. O Fly.io vai usar buildpack automático
3. Certifique-se que o `package.json` tem o script `start`:
   ```json
   "start": "node backend/server.js"
   ```

### **Opção 4: Verificar logs detalhados**

No dashboard do Fly.io:
1. Vá em seu app
2. Clique em "Logs"
3. Veja os logs de build para identificar o erro exato

---

## 📝 Checklist

- [ ] `Dockerfile` está correto (copiado acima)
- [ ] `.dockerignore` foi criado
- [ ] `package.json` existe na raiz
- [ ] `package-lock.json` existe (ou será criado no build)
- [ ] `backend/server.js` existe
- [ ] `fly.toml` tem o nome correto do app
- [ ] Tenteu fazer deploy novamente

---

## 💡 Dica

Se o erro persistir, tente fazer deploy sem o Dockerfile e deixe o Fly.io usar buildpack automático. O Fly.io detecta Node.js automaticamente e usa o script `start` do `package.json`.

---

**Depois de corrigir, o erro deve desaparecer!** 🎉

