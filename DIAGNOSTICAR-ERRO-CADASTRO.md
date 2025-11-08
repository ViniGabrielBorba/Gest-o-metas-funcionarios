# 🔍 Como Diagnosticar Erro no Cadastro

## ❌ Erro Atual

"Não foi possível obter o resultado em /api/auth/cadastro"

## 🔍 Passo 1: Verificar se o Backend Está Rodando

### 1.1 Testar Health Check

Abra no navegador ou use curl:

```
https://seu-backend.onrender.com/health
```

**Deve retornar:**
```json
{
  "status": "OK",
  "database": "connected"
}
```

**Se não retornar:**
- ❌ Backend não está rodando
- ✅ Solução: Verifique os logs do Render e faça deploy novamente

### 1.2 Testar Rota de Teste

```
https://seu-backend.onrender.com/api/test
```

**Deve retornar:**
```json
{
  "message": "API funcionando!"
}
```

**Se não retornar:**
- ❌ Rotas não estão funcionando
- ✅ Solução: Verifique os logs do backend

---

## 🔍 Passo 2: Verificar URL do Backend no Frontend

### 2.1 Verificar Variável de Ambiente

No **Vercel** (ou onde o frontend está hospedado):

1. Acesse **Settings** → **Environment Variables**
2. Verifique se existe:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://seu-backend.onrender.com/api`

**Se não existir:**
- ✅ Adicione a variável
- ✅ Faça um novo deploy do frontend

### 2.2 Verificar no Código

O código usa:
```javascript
baseURL: process.env.REACT_APP_API_URL || '/api'
```

**Se `REACT_APP_API_URL` não estiver configurada:**
- ❌ Vai tentar usar `/api` (relativo)
- ❌ Não vai funcionar se frontend e backend estão em servidores diferentes

---

## 🔍 Passo 3: Verificar Console do Navegador

### 3.1 Abrir Console

1. Pressione `F12` no navegador
2. Vá na aba **Console**
3. Tente fazer o cadastro
4. Veja qual erro aparece

### 3.2 Erros Comuns no Console

| Erro | Causa | Solução |
|------|-------|---------|
| `Network Error` | Backend não acessível | Verificar se backend está rodando |
| `CORS policy` | CORS não configurado | Configurar FRONTEND_URL no backend |
| `404 Not Found` | Rota não existe | Verificar URL da API |
| `500 Internal Server Error` | Erro no servidor | Verificar logs do backend |

---

## 🔍 Passo 4: Verificar Aba Network

### 4.1 Abrir Network

1. Pressione `F12` no navegador
2. Vá na aba **Network** (Rede)
3. Tente fazer o cadastro
4. Procure pela requisição `/api/auth/cadastro`

### 4.2 Verificar Detalhes

Clique na requisição e verifique:

**Request URL:**
- Deve ser: `https://seu-backend.onrender.com/api/auth/cadastro`
- Se for: `http://localhost:3000/api/auth/cadastro` → ❌ URL não configurada

**Status:**
- `200` → ✅ Sucesso
- `400` → ❌ Erro de validação (ver Response)
- `500` → ❌ Erro no servidor (ver logs)
- `CORS Error` → ❌ CORS não configurado

**Response:**
- Veja qual mensagem de erro o servidor retornou

---

## 🔍 Passo 5: Verificar Logs do Backend

### 5.1 No Render

1. Acesse seu serviço no Render
2. Vá em **Logs**
3. Procure por:
   - ❌ "Erro ao carregar rota auth"
   - ❌ "Não foi possível encontrar o módulo"
   - ❌ "JWT_SECRET não está configurado"
   - ✅ "Servidor rodando em http://..."

### 5.2 Verificar Erros Específicos

**Se ver "Erro ao carregar rota auth":**
- ❌ Dependências faltando (joi, winston, etc.)
- ✅ Solução: Verificar se `npm install` completou

**Se ver "JWT_SECRET não está configurado":**
- ❌ Variável de ambiente não configurada
- ✅ Solução: Adicionar JWT_SECRET no Render

---

## ✅ Solução Rápida

### 1. Configurar URL do Backend no Frontend

**No Vercel:**

1. **Settings** → **Environment Variables**
2. **Add New**:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://seu-backend.onrender.com/api`
   - **Environment**: Production, Preview, Development
3. **Save**
4. **Deploy** novamente

### 2. Verificar Backend

1. Teste o health check
2. Verifique os logs
3. Certifique-se de que está rodando

### 3. Testar Cadastro

Use uma senha forte:
- ✅ `MinhaSenha123!@#`
- ✅ `Teste123!`
- ❌ `senha123` (muito fraca)

---

## 📋 Checklist de Diagnóstico

- [ ] Backend está rodando (health check retorna OK)
- [ ] REACT_APP_API_URL configurada no frontend
- [ ] FRONTEND_URL configurada no backend
- [ ] Console do navegador não mostra erros
- [ ] Aba Network mostra requisição sendo feita
- [ ] Logs do backend não mostram erros
- [ ] Senha atende aos requisitos

---

## 🆘 Ainda com Problemas?

### Copie estas informações:

1. **Erro no Console do Navegador:**
   - Abra F12 → Console
   - Copie o erro completo

2. **Detalhes da Requisição:**
   - Abra F12 → Network
   - Clique na requisição `/api/auth/cadastro`
   - Copie:
     - Request URL
     - Status Code
     - Response

3. **Logs do Backend:**
   - Copie as últimas linhas dos logs
   - Procure por erros

---

**Última atualização**: Dezembro 2024

