# Solução para Erros 401 e 400 no Login/Cadastro

## Problemas Identificados

1. **Erro 401 no Login**: "Request failed with status code 401"
2. **Erro 400 no Cadastro**: "the server responded with a status of 400"
3. **Não foi possível conectar**: "Não foi possível obter o resultado em /api/auth/cadastro"

## Causas

1. **URL da API não configurada**: O frontend não sabia onde estava o backend
2. **CORS bloqueando requisições**: O backend não estava permitindo requisições do Vercel
3. **Tratamento de erros inadequado**: Mensagens de erro pouco claras

## Soluções Implementadas

### 1. Frontend - URL da API

✅ **Configuração automática da URL do backend**:
- Se a variável `REACT_APP_API_URL` estiver configurada, usa ela
- Se não, em produção, usa a URL do Render por padrão: `https://gest-o-metas-funcionarios-3.onrender.com/api`
- Em desenvolvimento, usa o proxy local `/api`

✅ **Melhor tratamento de erros**:
- Mensagens mais claras para cada tipo de erro
- Detecção de erros de rede, timeout, CORS
- Logs detalhados no console para debug

### 2. Backend - CORS

✅ **Permitir origens do Vercel automaticamente**:
- Qualquer URL `*.vercel.app` é permitida automaticamente
- URLs configuradas em `FRONTEND_URL` também são permitidas
- Logs detalhados sobre origens permitidas/bloqueadas

✅ **Headers e métodos permitidos**:
- Métodos: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Headers: Content-Type, Authorization, X-Requested-With
- Credentials: true (para cookies e autenticação)

## Configuração Necessária

### No Vercel (Frontend)

1. **Acesse**: https://vercel.com → Seu Projeto → Settings → Environment Variables
2. **Adicione**:

   | Key | Value |
   |-----|-------|
   | `REACT_APP_API_URL` | `https://gest-o-metas-funcionarios-3.onrender.com/api` |

   ⚠️ **Substitua pela URL real do seu backend no Render!**

3. **Selecione**: Production, Preview, Development
4. **Salve** e **faça um novo deploy**

### No Render (Backend)

1. **Acesse**: https://render.com → Seu Serviço → Environment
2. **Adicione/Verifique**:

   | Key | Value |
   |-----|-------|
   | `FRONTEND_URL` | `https://gest-o-metas-funcionarios-89ed.vercel.app` |
   | `MONGODB_URI` | `mongodb+srv://...` |
   | `JWT_SECRET` | `seu-jwt-secret` |

   ⚠️ **Substitua pela URL real do seu frontend no Vercel!**

3. **Reinicie o serviço**: Manual Deploy → Deploy latest commit

## Como Testar

### 1. Testar Backend

```bash
# Teste o health check
curl https://gest-o-metas-funcionarios-3.onrender.com/health

# Deve retornar:
# {"status":"OK","timestamp":"...","uptime":...,"database":"connected",...}
```

### 2. Testar Frontend

1. **Acesse sua aplicação no Vercel**
2. **Abra o Console do Navegador** (F12)
3. **Tente fazer login/cadastro**
4. **Verifique**:
   - Se há erros no console
   - Se a requisição está sendo feita para a URL correta
   - Se há erros de CORS

### 3. Verificar Logs

**No Render (Backend)**:
- Vá em **Logs** do seu serviço
- Procure por mensagens de CORS
- Verifique se há erros de conexão com MongoDB

**No Vercel (Frontend)**:
- Vá em **Deployments** → **Logs**
- Verifique se o build foi bem-sucedido
- Confirme se as variáveis de ambiente estão sendo usadas

## Erros Comuns e Soluções

### Erro 401 - Unauthorized

**Causa**: Email ou senha incorretos, ou token JWT inválido

**Solução**:
- Verifique se as credenciais estão corretas
- Verifique se `JWT_SECRET` está configurado no Render
- Verifique se o usuário existe no banco de dados

### Erro 400 - Bad Request

**Causa**: Dados inválidos na requisição

**Solução**:
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique se a senha atende aos requisitos (min 8 chars, 1 maiúscula, 1 número, 1 especial)
- Verifique se o email está em formato válido
- Veja os erros de validação que aparecem abaixo de cada campo

### Erro de Rede - Network Error

**Causa**: Não consegue conectar ao backend

**Solução**:
- Verifique se o backend está online no Render
- Verifique se a URL da API está correta
- Verifique se há problemas de CORS (veja logs do backend)
- Verifique sua conexão com a internet

### Erro de Timeout

**Causa**: Backend muito lento ou offline

**Solução**:
- O backend no Render (free tier) pode levar alguns minutos para "acordar"
- Aguarde alguns minutos e tente novamente
- Verifique os logs do Render para ver se o servidor está respondendo

## Próximos Passos

1. ✅ **Configurar `REACT_APP_API_URL` no Vercel**
2. ✅ **Configurar `FRONTEND_URL` no Render**
3. ✅ **Fazer deploy do frontend novamente**
4. ✅ **Reiniciar o backend no Render**
5. ✅ **Testar login e cadastro**

## Notas Importantes

- ⚠️ O backend no Render (free tier) pode levar 30-60 segundos para iniciar após um período de inatividade
- ⚠️ Após configurar variáveis de ambiente, é necessário fazer um novo deploy
- ⚠️ Verifique sempre os logs do backend para identificar problemas
- ✅ O CORS agora permite automaticamente qualquer URL `*.vercel.app`
- ✅ O frontend tem fallback para a URL do Render mesmo sem variável de ambiente

