# 🔍 Como Diagnosticar Erro de Login

## Passos para identificar o problema:

### 1. Verificar se Backend está rodando
- Abra o terminal onde o `npm run dev` está rodando
- Deve aparecer: `✅ MongoDB conectado com sucesso!` e `🚀 Servidor rodando na porta 5000`

### 2. Verificar se Frontend está rodando
- Deve aparecer: `Compiled successfully!` e abrir em `http://localhost:3000`

### 3. Testar conexão direta no navegador
- Acesse: `http://localhost:5000/api/test`
- Deve retornar: `{"message":"API funcionando!"}`

### 4. Verificar Console do Navegador
1. Abra o DevTools (F12)
2. Vá na aba "Console"
3. Tente fazer login
4. Veja se há erros em vermelho

### 5. Verificar Network/Redes
1. Abra DevTools (F12)
2. Vá na aba "Network" (Rede)
3. Tente fazer login
4. Clique na requisição `login`
5. Veja o Status Code:
   - **200** = Sucesso
   - **401** = Email/senha incorretos
   - **500** = Erro no servidor
   - **Network Error** = Backend não está rodando

### 6. Verificar MongoDB
- No terminal do backend, veja se há erros de conexão
- Verifique se o MongoDB Atlas está acessível

### 7. Testar com dados conhecidos
- Tente criar uma nova conta primeiro
- Depois faça login com essa conta

## Erros Comuns:

### "Não foi possível conectar ao servidor"
- **Causa:** Backend não está rodando
- **Solução:** Execute `npm run dev` na pasta raiz

### "Email ou senha incorretos"
- **Causa:** Credenciais erradas ou email diferente (case-sensitive)
- **Solução:** Verifique email e senha. Tente criar nova conta.

### "Network Error" ou "Failed to fetch"
- **Causa:** Problema de CORS ou backend offline
- **Solução:** Verifique se backend está rodando na porta 5000

### Erro 500
- **Causa:** Erro no servidor (geralmente MongoDB)
- **Solução:** Verifique logs do backend e conexão MongoDB

## Informe qual erro apareceu para eu ajudar melhor!





