# 🌐 Como Configurar o Render para Deploy

## 📋 Passo a Passo Completo

### 1. Acessar o Render

1. Acesse https://render.com
2. Faça login na sua conta
3. Clique em **New +** (Novo)
4. Escolha **Web Service** (Serviço Web)

---

### 2. Conectar com GitHub

1. Selecione **Connect GitHub** (Conectar GitHub)
2. Autorize o Render a acessar seu repositório
3. Selecione o repositório: `Gest-o-metas-funcionarios`
4. Clique em **Connect** (Conectar)

---

### 3. Configurar o Serviço

Preencha os seguintes campos:

#### **Name** (Nome):
```
flowgest-backend
```
(ou qualquer nome que você preferir)

#### **Region** (Região):
```
São Paulo (South America)
```
(ou a região mais próxima de você)

#### **Branch** (Branch):
```
main
```
(ou a branch que você está usando)

#### **Root Directory** (Diretório Raiz):
```
.
```
(ou deixe em branco - significa a raiz do projeto)

#### **Runtime** (Ambiente de Execução):
```
Node
```

#### **Build Command** (Comando de Build):
```
npm install
```

#### **Start Command** (Comando de Iniciar):
```
node server-start.js
```

---

### 4. Configurar Variáveis de Ambiente

Na seção **Environment Variables** (Variáveis de Ambiente), adicione:

#### Clique em **Add Environment Variable** (Adicionar Variável de Ambiente)

Adicione cada uma das seguintes variáveis:

| Key (Chave) | Value (Valor) |
|-------------|---------------|
| `JWT_SECRET` | [cole o valor gerado] |
| `MONGODB_URI` | `mongodb+srv://gerente:uPAO9DrzGPKU1DDq@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://seu-frontend.vercel.app` (se usar CORS) |

**Como adicionar:**
1. Clique em **Add Environment Variable**
2. Digite o **Key** (nome da variável)
3. Cole o **Value** (valor da variável)
4. Clique em **Save Changes** (Salvar Alterações)
5. Repita para cada variável

---

### 5. Configurar Plano

#### **Instance Type** (Tipo de Instância):
```
Free
```
(Para começar - você pode atualizar depois)

---

### 6. Fazer Deploy

1. Após configurar tudo, role a página até o final
2. Clique em **Create Web Service** (Criar Serviço Web)
3. O Render vai começar a fazer o deploy automaticamente
4. Aguarde alguns minutos

---

### 7. Verificar o Deploy

#### Durante o Deploy:

1. Você verá os logs do build em tempo real
2. Procure por mensagens como:
   - ✅ "Build successful"
   - ✅ "Installing dependencies..."
   - ✅ "Starting service..."

#### Após o Deploy:

1. O Render vai gerar uma URL para seu serviço
2. Exemplo: `https://flowgest-backend.onrender.com`
3. Teste o health check:
   ```
   https://flowgest-backend.onrender.com/health
   ```

---

## 🔍 Verificar se Está Funcionando

### 1. Testar Health Check

Abra no navegador ou use curl:

```
GET https://seu-app.onrender.com/health
```

**Deve retornar:**
```json
{
  "status": "OK",
  "database": "connected"
}
```

### 2. Testar Rota de Teste

```
GET https://seu-app.onrender.com/api/test
```

**Deve retornar:**
```json
{
  "message": "API funcionando!"
}
```

---

## ⚙️ Configurações Importantes

### Build Command (Comando de Build)

```
npm install
```

**O que faz:**
- Instala todas as dependências do `package.json`
- Executa automaticamente antes do start

### Start Command (Comando de Iniciar)

```
node server-start.js
```

**O que faz:**
- Inicia o servidor Node.js
- Usa o wrapper seguro que criamos

---

## 📝 Resumo das Configurações

| Campo | Valor |
|-------|-------|
| **Name** | `flowgest-backend` |
| **Region** | `São Paulo` |
| **Branch** | `main` |
| **Root Directory** | `.` (raiz) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server-start.js` |
| **Instance Type** | `Free` |

---

## 🔴 Variáveis de Ambiente Necessárias

| Key | Value |
|-----|-------|
| `JWT_SECRET` | [gerado anteriormente] |
| `MONGODB_URI` | `mongodb+srv://gerente:uPAO9DrzGPKU1DDq@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | [URL do seu frontend] |

---

## 🆘 Problemas Comuns

### Erro: "Build failed"

**Solução:**
1. Verifique os logs do build
2. Certifique-se de que o `package.json` tem todas as dependências
3. Verifique se o **Build Command** está correto: `npm install`

### Erro: "Start failed"

**Solução:**
1. Verifique se o **Start Command** está correto: `node server-start.js`
2. Verifique se o arquivo `server-start.js` existe na raiz
3. Verifique os logs para ver o erro específico

### Erro: "Cannot connect to MongoDB"

**Solução:**
1. Verifique se a variável `MONGODB_URI` está configurada corretamente
2. Verifique se o acesso de rede está liberado no MongoDB Atlas
3. Verifique se a senha está correta

### Erro: "JWT_SECRET not found"

**Solução:**
1. Verifique se a variável `JWT_SECRET` está configurada
2. Gere um novo JWT_SECRET se necessário
3. Adicione no Render

---

## 📞 Ainda com Problemas?

1. **Verifique os logs:**
   - No Render, vá em **Logs**
   - Procure por mensagens de erro
   - Os logs mostram exatamente o que está acontecendo

2. **Teste localmente primeiro:**
   ```bash
   npm install
   node server-start.js
   ```
   Se funcionar localmente, o problema está na configuração do Render

3. **Verifique as variáveis de ambiente:**
   - Certifique-se de que todas estão configuradas
   - Verifique se não há espaços extras
   - Verifique se os valores estão corretos

---

## ✅ Checklist Final

Antes de considerar o deploy completo:

- [ ] Build Command configurado: `npm install`
- [ ] Start Command configurado: `node server-start.js`
- [ ] JWT_SECRET adicionado
- [ ] MONGODB_URI adicionado
- [ ] NODE_ENV=production adicionado
- [ ] FRONTEND_URL adicionado (se usar CORS)
- [ ] Acesso de rede liberado no MongoDB Atlas
- [ ] Health check retorna "OK"
- [ ] Rota /api/test funciona

---

**Última atualização**: Dezembro 2024

