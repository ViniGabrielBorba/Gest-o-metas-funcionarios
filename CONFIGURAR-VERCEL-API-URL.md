# Configurar URL da API no Vercel

## Problema

O frontend está tentando se conectar ao backend, mas não está encontrando a URL correta da API. Isso causa erros como:
- "Não foi possível obter o resultado em /api/auth/cadastro"
- "Não foi possível obter o resultado em /api/auth/login"
- Erros 401/400

## Solução

### 1. Configurar Variável de Ambiente no Vercel

1. **Acesse o Vercel**: https://vercel.com
2. **Selecione seu projeto**: `gest-o-metas-funcionarios`
3. **Vá em Settings → Environment Variables**
4. **Adicione a variável**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://gest-o-metas-funcionarios-3.onrender.com/api` |

   **⚠️ IMPORTANTE**: Substitua `gest-o-metas-funcionarios-3.onrender.com` pela URL real do seu backend no Render!

5. **Selecione os ambientes**: Marque todas as opções (Production, Preview, Development)
6. **Clique em Save**
7. **Faça um novo deploy**: Vá em Deployments e clique em "Redeploy" no último deployment

### 2. Verificar URL do Backend no Render

1. **Acesse o Render**: https://render.com
2. **Selecione seu serviço backend**
3. **Copie a URL**: Ela deve estar no formato `https://seu-app.onrender.com`
4. **Adicione `/api` ao final**: A URL completa deve ser `https://seu-app.onrender.com/api`

### 3. Verificar CORS no Backend

O backend precisa permitir requisições do Vercel. Verifique se a variável `FRONTEND_URL` está configurada no Render:

1. **No Render**, vá em **Environment** do seu serviço backend
2. **Adicione/Verifique a variável**:

   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | `https://gest-o-metas-funcionarios-89ed.vercel.app` |

   **⚠️ IMPORTANTE**: Substitua pela URL real do seu frontend no Vercel!

3. **Reinicie o serviço**: Vá em **Manual Deploy** → **Deploy latest commit**

### 4. Testar Conexão

Após configurar tudo:

1. **Teste o backend diretamente**: Acesse `https://seu-backend.onrender.com/health`
   - Deve retornar: `{"status":"OK",...}`

2. **Teste o frontend**: Acesse sua aplicação no Vercel
   - Tente fazer login ou cadastro
   - Verifique o console do navegador (F12) para ver se há erros

### 5. Debug

Se ainda não funcionar:

1. **Abra o Console do Navegador** (F12)
2. **Vá na aba Network**
3. **Tente fazer login/cadastro**
4. **Verifique a requisição**:
   - **Request URL**: Deve ser `https://seu-backend.onrender.com/api/auth/login`
   - **Status**: Código HTTP da resposta
   - **Response**: Mensagem de erro do servidor

## URLs Exemplo

### Backend (Render)
```
https://gest-o-metas-funcionarios-3.onrender.com
```

### Frontend (Vercel)
```
https://gest-o-metas-funcionarios-89ed.vercel.app
```

### Variáveis de Ambiente

**No Vercel (Frontend):**
```
REACT_APP_API_URL=https://gest-o-metas-funcionarios-3.onrender.com/api
```

**No Render (Backend):**
```
FRONTEND_URL=https://gest-o-metas-funcionarios-89ed.vercel.app
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
```

## Notas Importantes

- ✅ A URL da API deve terminar com `/api`
- ✅ Não adicione barra final (`/`) na URL da API
- ✅ O CORS deve estar configurado no backend para permitir o Vercel
- ✅ Após alterar variáveis de ambiente, é necessário fazer um novo deploy
- ✅ O backend pode levar alguns minutos para iniciar no Render (free tier)

## Solução Temporária

Se você não conseguir configurar a variável de ambiente no Vercel imediatamente, o código já tem um fallback que usa a URL do Render por padrão em produção. No entanto, é **recomendado** configurar a variável de ambiente para facilitar mudanças futuras.

