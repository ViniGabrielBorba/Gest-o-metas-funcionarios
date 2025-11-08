# 🔧 Como Configurar MONGODB_URI Corretamente

## 📋 Informações do Seu MongoDB

Baseado na sua string de conexão:
- **Cluster**: `cluster0.gbemu6i.mongodb.net`
- **Usuário**: `gerente`
- **Senha**: [você precisa da senha]
- **Banco de dados**: `gestao-metas` (recomendado)

---

## 🔴 FORMATO CORRETO DA URI

A string de conexão deve ter este formato:

```
mongodb+srv://USUARIO:SENHA@cluster0.gbemu6i.mongodb.net/NOME_DO_BANCO?retryWrites=true&w=majority
```

### Exemplo Completo:

```
mongodb+srv://gerente:SUA_SENHA_AQUI@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority
```

---

## 📝 Passo a Passo

### 1. Obter a Senha do MongoDB

1. Acesse https://cloud.mongodb.com
2. Faça login
3. Vá em **Database Access** (Acesso ao Banco de Dados)
4. Encontre o usuário `gerente`
5. Clique nos **três pontinhos** (...) ao lado
6. Clique em **Edit** (Editar)
7. Veja a senha ou **Reset Password** (Redefinir Senha) se necessário

### 2. Montar a URI Completa

Substitua `SUA_SENHA_AQUI` pela senha real do usuário `gerente`:

```
mongodb+srv://gerente:minhasenha123@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE:**
- Se a senha tiver caracteres especiais (como `@`, `#`, `$`, etc.), você precisa **codificá-los**:
  - `@` vira `%40`
  - `#` vira `%23`
  - `$` vira `%24`
  - `%` vira `%25`
  - `&` vira `%26`
  - `+` vira `%2B`
  - `=` vira `%3D`
  - `?` vira `%3F`

**Exemplo:**
- Senha original: `minha@senha#123`
- Senha codificada: `minha%40senha%23123`
- URI: `mongodb+srv://gerente:minha%40senha%23123@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority`

### 3. Testar a Conexão

#### No MongoDB Atlas:

1. Acesse https://cloud.mongodb.com
2. Clique em **Connect** no seu cluster
3. Escolha **Connect your application** (Conectar sua aplicação)
4. Escolha **Node.js** como driver
5. Escolha a versão mais recente
6. Copie a string de conexão gerada
7. Substitua `<password>` pela sua senha
8. Adicione `/gestao-metas` antes do `?`

#### Ou use mongosh localmente:

```bash
mongosh "mongodb+srv://cluster0.gbemu6i.mongodb.net/" --apiVersion 1 --username gerente
```

Digite a senha quando solicitado.

### 4. Adicionar no Serviço de Hosting

#### Railway:

1. Acesse seu projeto no Railway
2. Vá em **Settings** → **Variables**
3. Clique em **+ New Variable**
4. **Name**: `MONGODB_URI`
5. **Value**: Cole a URI completa (exemplo acima)
6. Clique em **Add**
7. Clique em **Save** ou **Deploy**

#### Render:

1. Acesse seu serviço no Render
2. Vá em **Environment**
3. Clique em **Add Environment Variable**
4. **Key**: `MONGODB_URI`
5. **Value**: Cole a URI completa
6. Clique em **Save Changes**

#### Fly.io:

```bash
fly secrets set MONGODB_URI="mongodb+srv://gerente:SUA_SENHA@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority"
```

---

## 🔒 Liberar Acesso de Rede

### IMPORTANTE: Você PRECISA liberar o acesso de rede!

1. Acesse https://cloud.mongodb.com
2. Vá em **Network Access** (Acesso de Rede)
3. Clique em **Add IP Address** (Adicionar Endereço IP)
4. Clique em **Allow Access from Anywhere** (Permitir acesso de qualquer lugar)
   - Isso adiciona `0.0.0.0/0` (permite de qualquer IP)
5. Clique em **Confirm** (Confirmar)

**⚠️ ATENÇÃO:** Isso permite acesso de qualquer IP. Para produção, é recomendado adicionar apenas os IPs dos seus serviços de hosting.

---

## ✅ Verificar se Está Funcionando

### 1. Teste o Health Check

Após configurar, teste:

```bash
curl https://seu-backend.railway.app/health
```

Deve retornar:
```json
{
  "status": "OK",
  "database": "connected"
}
```

### 2. Verifique os Logs

Nos logs do servidor, você deve ver:
```
✅ MongoDB conectado com sucesso!
📦 Database: gestao-metas
```

Se ver:
```
❌ Erro ao conectar ao MongoDB!
```

Verifique:
- Se a senha está correta
- Se os caracteres especiais estão codificados
- Se o acesso de rede está liberado
- Se o nome do banco está correto

---

## 🔧 Ferramenta para Codificar Senha

Se sua senha tem caracteres especiais, use este site para codificar:
https://www.urlencoder.org/

Ou use JavaScript:

```javascript
encodeURIComponent('minha@senha#123')
// Resultado: 'minha%40senha%23123'
```

---

## 📋 Exemplo Completo

### String Original (mongosh):
```
mongosh "mongodb+srv://cluster0.gbemu6i.mongodb.net/" --apiVersion 1 --username gerente
```

### URI para o Código:
```
mongodb+srv://gerente:SUA_SENHA@cluster0.gbemu6i.mongodb.net/gestao-metas?retryWrites=true&w=majority
```

### Onde Usar:
- **Variável de ambiente**: `MONGODB_URI`
- **Valor**: A URI completa acima (com senha substituída)

---

## 🆘 Problemas Comuns

### Erro: "Authentication failed"

**Solução:**
- Verifique se o usuário e senha estão corretos
- Verifique se os caracteres especiais estão codificados

### Erro: "Connection timeout"

**Solução:**
- Verifique se o acesso de rede está liberado
- Verifique se o cluster está ativo

### Erro: "Database not found"

**Solução:**
- O MongoDB cria o banco automaticamente na primeira conexão
- Certifique-se de que o nome do banco está correto na URI

---

## 📞 Ainda com Problemas?

1. Verifique os logs do servidor
2. Teste a conexão localmente primeiro
3. Verifique se todas as configurações estão corretas
4. Consulte a documentação do MongoDB Atlas

---

**Última atualização**: Dezembro 2024

