# 🔍 Diagnóstico de Erro 500

## O que é Erro 500?

Erro 500 significa que o **backend** encontrou um problema ao processar sua requisição.

## Possíveis Causas:

### 1. **MongoDB desconectado**
- O MongoDB Atlas pode ter perdido conexão
- Verifique se a string de conexão está correta no `.env`

### 2. **Erro no código do backend**
- Algum erro JavaScript no processamento
- Verifique os logs do terminal onde o `npm run dev` está rodando

### 3. **Dados inválidos**
- Email ou senha em formato incorreto
- Dados faltando na requisição

## Como Diagnosticar:

### Passo 1: Verificar Logs do Backend
1. Olhe o terminal onde está rodando `npm run dev`
2. Procure por mensagens em **vermelho** ou **erro**
3. Copie a mensagem de erro completa

### Passo 2: Verificar MongoDB
Teste a conexão:
```powershell
# Verificar se o MongoDB está acessível
# O backend deve mostrar: "✅ MongoDB conectado com sucesso!"
```

### Passo 3: Verificar Console do Navegador
1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Veja se há erros em vermelho
4. Vá na aba **Network** (Rede)
5. Clique na requisição que deu erro 500
6. Veja a resposta completa do erro

## Informe-me:

1. **Qual ação você estava fazendo?**
   - Login?
   - Cadastro?
   - Outra página?

2. **O que aparece no terminal do backend?**
   - Copie a mensagem de erro completa

3. **Qual é a URL completa que aparece no navegador?**

Com essas informações, consigo resolver rapidamente!
















