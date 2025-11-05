# 🔧 Solução: Erro de Conexão MongoDB

O erro ocorre porque o **MongoDB não está rodando** no seu computador.

## 🚀 Solução Rápida: MongoDB Atlas (Recomendado - 5 minutos)

MongoDB Atlas é gratuito e não precisa instalar nada!

### Passo a Passo:

1. **Acesse:** https://www.mongodb.com/cloud/atlas/register
2. **Crie uma conta gratuita**
3. **Crie um Cluster Gratuito:**
   - Clique em "Build a Database"
   - Escolha o plano "FREE" (M0)
   - Selecione uma região próxima (ex: São Paulo)
   - Clique em "Create"

4. **Configure o Acesso:**
   - Crie um usuário de banco de dados:
     - Username: `admin` (ou outro de sua escolha)
     - Password: crie uma senha segura (ANOTE ELA!)
   - Configure o Network Access:
     - Clique em "Add IP Address"
     - Clique em "Allow Access from Anywhere" (0.0.0.0/0)
     - Ou adicione seu IP atual

5. **Obtenha a String de Conexão:**
   - Clique em "Connect" no cluster
   - Escolha "Connect your application"
   - Copie a string de conexão (algo como):
     ```
     mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

6. **Atualize o arquivo `.env`:**
   - Abra o arquivo `.env` na raiz do projeto
   - Substitua a linha `MONGODB_URI` por:
     ```
     MONGODB_URI=mongodb+srv://usuario:senha@cluster0.xxxxx.mongodb.net/gestao-metas?retryWrites=true&w=majority
     ```
   - **IMPORTANTE:** Substitua `usuario` e `senha` pelos dados que você criou
   - **IMPORTANTE:** Adicione `/gestao-metas` antes do `?` para criar o banco de dados

7. **Reinicie o servidor:**
   ```powershell
   # Pare o servidor atual (Ctrl+C)
   # Depois execute novamente:
   npm run dev
   ```

---

## 🖥️ Solução Alternativa: Instalar MongoDB Localmente

### Windows:

1. **Baixar MongoDB:**
   - Acesse: https://www.mongodb.com/try/download/community
   - Escolha Windows x64
   - Baixe o instalador MSI

2. **Instalar:**
   - Execute o instalador
   - **IMPORTANTE:** Marque a opção "Install MongoDB as a Service"
   - Deixe a opção "Run service as Network Service user" marcada
   - Clique em "Install"

3. **Verificar:**
   - Abra o Gerenciador de Serviços (services.msc)
   - Procure por "MongoDB"
   - Verifique se o Status está como "Em execução"

4. **Testar:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 27017
   ```
   - Deve retornar `TcpTestSucceeded : True`

5. **Reinicie o servidor:**
   ```powershell
   npm run dev
   ```

---

## ✅ Verificar se Funcionou

Após configurar, você deve ver no terminal:
```
✅ MongoDB conectado com sucesso!
📦 Database: gestao-metas
🚀 Servidor rodando na porta 5000
```

**Recomendação:** Use MongoDB Atlas (cloud) - é mais fácil, rápido e funciona de qualquer lugar!





