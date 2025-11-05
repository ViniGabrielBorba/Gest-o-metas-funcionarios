# 🔧 Solução: "O diretório raiz do serviço está faltando"

## ❌ Problema

O Render está procurando o código no caminho errado: `/opt/render/project/src/sistema-gestao-backend`

Isso acontece quando o **Root Directory** está configurado incorretamente.

---

## ✅ Solução

### **Opção 1: Deixar Root Directory Vazio (RECOMENDADO)**

1. **No Render, vá em Settings**
2. **Encontre "Root Directory"** na seção "Build & Deploy"
3. **Deixe completamente VAZIO** (não coloque nada)
4. **Clique em "Save Changes"**
5. **Faça Manual Deploy** ou aguarde o redeploy automático

O Render vai usar a raiz do repositório automaticamente.

---

### **Opção 2: Se a Opção 1 Não Funcionar**

Se ainda der erro, tente:

1. **Root Directory:** Deixe vazio OU coloque apenas um ponto: `.`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`

---

## 🔧 Passo a Passo para Corrigir

### **1. Acessar Configurações**

1. No Render, clique no seu **Web Service**
2. Vá em **"Settings"** (menu lateral ou no topo)
3. Role até a seção **"Build & Deploy"**

### **2. Verificar/Corrigir Configurações**

Certifique-se de que está assim:

| Campo | Valor |
|-------|-------|
| **Name** | `sistema-gestao-backend` (ou qualquer nome) |
| **Region** | Qualquer região |
| **Branch** | `main` (ou sua branch principal) |
| **Root Directory** | **(VAZIO - não coloque nada!)** |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

### **3. Salvar e Fazer Deploy**

1. Clique em **"Save Changes"**
2. Se não fizer deploy automático, clique em **"Manual Deploy"** → **"Deploy latest commit"**
3. Aguarde 2-5 minutos

---

## ✅ Verificar Estrutura do Projeto

O Render espera encontrar o `package.json` na raiz. Verifique se você tem:

```
seu-repositorio/
├── package.json          ← Deve estar aqui (raiz)
├── backend/
│   └── server.js         ← Arquivo principal
├── frontend/
└── ...
```

Se o `package.json` estiver em outro lugar, você precisa ajustar o Root Directory para apontar para onde ele está.

---

## 🆘 Se Ainda Não Funcionar

### **Verificar se o Repositório está Correto**

1. No Render, vá em **Settings** → **"Build & Deploy"**
2. Verifique se o **repositório conectado** está correto
3. Verifique se a **branch** está correta (`main` ou `master`)

### **Limpar Cache e Fazer Deploy Limpo**

1. No Render, vá em **Settings**
2. Role até **"Build Cache"**
3. Clique em **"Clear build cache"**
4. Depois faça **"Manual Deploy"** → **"Deploy latest commit"**

### **Verificar Logs de Build**

1. No Render, vá em **"Logs"**
2. Procure por erros relacionados a:
   - "directory not found"
   - "cannot find package.json"
   - "root directory"

---

## 📝 Configuração Correta Completa

### **Build & Deploy Settings:**

```
Name: sistema-gestao-backend
Region: [Sua região preferida]
Branch: main
Root Directory: [VAZIO - não coloque nada]
Runtime: Node
Build Command: npm install
Start Command: npm start
Auto-Deploy: Yes
```

### **Variáveis de Ambiente:**

```
MONGODB_URI=mongodb+srv://gerente:SUA_SENHA@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0
JWT_SECRET=secret_key_gestao_metas_producao_2024
NODE_ENV=production
FRONTEND_URL=https://seu-app.vercel.app
```

---

## 💡 Dica Importante

**O Root Directory deve estar VAZIO** para projetos onde o `package.json` está na raiz do repositório.

Se você preencher com algo como `/src` ou `backend`, o Render vai procurar o `package.json` lá, e não vai encontrar.

---

## ✅ Checklist

- [ ] Root Directory está **VAZIO** (não tem nada escrito)
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`
- [ ] Repositório conectado corretamente
- [ ] Branch correta (`main` ou `master`)
- [ ] `package.json` está na raiz do repositório
- [ ] Limpou o cache (se necessário)
- [ ] Fez novo deploy

---

**Depois de corrigir o Root Directory, o erro deve desaparecer!** 🎉

