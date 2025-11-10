# 🔧 Configurar Vercel com Root Directory

## ⚠️ IMPORTANTE: Configuração no Dashboard do Vercel

O `vercel.json` não é suficiente para monorepos. Você **DEVE** configurar o **Root Directory** no dashboard do Vercel.

## 📋 Passo a Passo

### 1. Acesse o Dashboard do Vercel

1. Vá para https://vercel.com
2. Faça login
3. Selecione seu projeto

### 2. Configure as Settings

1. Vá em **Settings** (Configurações)
2. Vá em **General** (Geral)
3. Role até **Root Directory**
4. Clique em **Edit**
5. Digite: `frontend`
6. Clique em **Save**

### 3. Configure Build & Development Settings

Na mesma página de Settings, vá em **Build & Development Settings**:

- **Framework Preset:** `Create React App`
- **Root Directory:** `frontend` (já configurado acima)
- **Build Command:** `npm run build` (deixe vazio ou não especifique)
- **Output Directory:** `build` (deixe vazio ou não especifique)
- **Install Command:** (deixe vazio)

### 4. Variáveis de Ambiente

Vá em **Environment Variables** e adicione:

- **Key:** `REACT_APP_API_URL`
- **Value:** `https://gest-o-metas-funcionarios-3.onrender.com/api`
- **Environment:** `Production`, `Preview`, `Development` (marque todos)

## ✅ Configuração Completa no Dashboard

```
Settings → General:
  Root Directory: frontend

Settings → Build & Development Settings:
  Framework Preset: Create React App
  Build Command: (vazio - usa padrão)
  Output Directory: (vazio - usa padrão)
  Install Command: (vazio - usa padrão)

Environment Variables:
  REACT_APP_API_URL = https://gest-o-metas-funcionarios-3.onrender.com/api
```

## 🚀 Depois de Configurar

1. Faça um **push** para o GitHub
2. O Vercel vai detectar automaticamente
3. Vai fazer o build usando o diretório `frontend` como raiz
4. Vai instalar as dependências do `frontend/package.json`
5. Vai executar o build do React
6. Vai servir os arquivos da pasta `frontend/build`

## ❌ O Que NÃO Fazer

- ❌ Não coloque `cd frontend` no Build Command
- ❌ Não coloque caminhos relativos no `vercel.json`
- ❌ Não deixe o Root Directory vazio se o frontend está em subdiretório

## ✅ O Que Fazer

- ✅ Configure Root Directory como `frontend` no dashboard
- ✅ Deixe o `vercel.json` simples (apenas rewrites)
- ✅ Use variáveis de ambiente para a URL da API
- ✅ Deixe o Vercel detectar automaticamente o framework

## 🔍 Verificar se Está Correto

Depois de configurar, veja os logs de build. Você deve ver:

```
Running "npm install" in frontend...
Running "npm run build" in frontend...
```

Se vir isso, está funcionando corretamente!

## 🆘 Se Ainda Não Funcionar

1. Verifique se o Root Directory está como `frontend`
2. Verifique os logs de build no Vercel
3. Verifique se o `frontend/package.json` existe
4. Tente fazer um "Redeploy" no Vercel
5. Limpe o cache de build (Settings → Clear Build Cache)

