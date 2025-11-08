# 📦 Como Instalar Dependências Corretamente

## ⚠️ Problema

As dependências novas (joi, winston, etc.) estão apenas no `backend/package.json`, mas o serviço de hosting pode estar instalando apenas do `package.json` raiz.

## ✅ Solução

### Opção 1: Instalar Dependências Manualmente (Recomendado)

No seu serviço de hosting, adicione um script de build:

#### Railway:

1. Acesse seu projeto no Railway
2. Vá em **Settings** → **Build**
3. Adicione o comando de build:
   ```bash
   npm install
   ```

#### Render:

1. Acesse seu serviço no Render
2. Vá em **Settings** → **Build Command**
3. Defina:
   ```bash
   npm install
   ```

### Opção 2: Usar package.json Unificado

O `package.json` na raiz já foi atualizado com todas as dependências. Certifique-se de que o deploy está instalando as dependências.

---

## 🔍 Verificar se Dependências Estão Instaladas

Após o deploy, verifique os logs. Você deve ver:

```
added 150 packages in 30s
```

Se não vir isso, as dependências não foram instaladas.

---

## 🛠️ Comandos de Build

### Railway:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server-start.js
```

### Render:

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server-start.js
```

---

## 📋 Dependências Necessárias

Certifique-se de que estas dependências estão no `package.json`:

- joi
- winston
- express-rate-limit
- helmet
- compression
- morgan
- nodemailer
- exceljs
- csv-writer
- puppeteer
- node-cron

Todas já foram adicionadas no `package.json` raiz.

---

**Última atualização**: Dezembro 2024

