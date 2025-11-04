# 🚀 Guia de Instalação - Sistema de Gestão de Metas

## Pré-requisitos

- Node.js (versão 16 ou superior) - [Baixar aqui](https://nodejs.org/)
- MongoDB instalado e rodando (ou usar MongoDB Atlas)
- NPM (vem com Node.js)

## 📦 Instalação no Windows

### Opção 1: Script Automático (Recomendado)

1. Execute o arquivo `instalar.bat` (clique duas vezes ou execute no terminal)

### Opção 2: Instalação Manual

**No PowerShell ou Prompt de Comando:**

```powershell
# 1. Instalar dependências do backend
npm install

# 2. Navegar para a pasta frontend
cd frontend

# 3. Instalar dependências do frontend
npm install

# 4. Voltar para a pasta raiz
cd ..
```

**Importante no Windows:** Não use `&&` no PowerShell. Execute os comandos separadamente ou use `;` ao invés de `&&`.

## 📦 Instalação no Linux/Mac

```bash
# 1. Instalar dependências do backend
npm install

# 2. Instalar dependências do frontend
cd frontend && npm install && cd ..
```

Ou use o script automático:
```bash
chmod +x instalar.sh
./instalar.sh
```

## ⚙️ Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto (mesmo nível do `package.json`)

2. Copie o conteúdo abaixo ou use o arquivo `.env.example`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gestao-metas
JWT_SECRET=secret_key_gestao_metas_mude_em_producao
```

**Nota:** Se estiver usando MongoDB Atlas, substitua `MONGODB_URI` pela string de conexão fornecida.

## 🗄️ Iniciar o MongoDB

### Windows

**Se instalado como serviço:**
- Geralmente já está rodando automaticamente
- Verifique no Gerenciador de Serviços do Windows

**Se precisar iniciar manualmente:**
```powershell
mongod
```

### Linux
```bash
sudo systemctl start mongod
```

### Mac
```bash
brew services start mongodb-community
```

### MongoDB Atlas (Cloud - Não precisa instalar)
- Use a string de conexão fornecida pelo MongoDB Atlas no arquivo `.env`

## 🚀 Executar o Sistema

### Opção 1: Executar Backend e Frontend Separadamente

**Terminal 1 (Backend):**
```powershell
npm run server
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm start
```

### Opção 2: Executar Ambos Simultaneamente (Recomendado)

```powershell
npm run dev
```

## 🌐 Acessar o Sistema

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

## 🎯 Primeiro Uso

1. Acesse http://localhost:3000
2. Clique em "Cadastre-se"
3. Preencha os dados do gerente e da loja:
   - Nome completo
   - Email
   - Senha (mínimo 6 caracteres)
   - Nome da loja
   - CNPJ (opcional)
   - Telefone (opcional)
4. Faça login com suas credenciais
5. Comece a cadastrar funcionários e definir metas!

## ⚠️ Solução de Problemas

### Erro: "npm não é reconhecido"
- Instale o Node.js: https://nodejs.org/
- Reinicie o terminal após instalar

### Erro ao conectar MongoDB
- Verifique se o MongoDB está rodando
- Confirme a URI de conexão no arquivo `.env`
- Teste a conexão:
  ```powershell
  mongosh
  ```
  Ou se estiver usando versão antiga:
  ```powershell
  mongo
  ```

### Erro: "Porta já em uso"
- Altere a porta no arquivo `.env` (backend)
- Ou encerre o processo que está usando a porta:
  - **Windows:** 
    ```powershell
    netstat -ano | findstr :5000
    taskkill /PID <PID> /F
    ```
  - **Linux/Mac:**
    ```bash
    lsof -ti:5000 | xargs kill
    ```

### Erro ao instalar dependências
- Limpe o cache do npm:
  ```powershell
  npm cache clean --force
  ```
- Tente usar:
  ```powershell
  npm install --legacy-peer-deps
  ```
- Exclua a pasta `node_modules` e o arquivo `package-lock.json` e tente novamente

### Erro no frontend: "Module not found"
- Certifique-se de estar na pasta `frontend` quando executar `npm install`
- Verifique se todas as dependências foram instaladas corretamente

### PowerShell: "&& não é reconhecido"
- Use `;` ao invés de `&&` no PowerShell
- Ou execute os comandos separadamente
- Ou use o script `instalar.bat`

## 📝 Notas Importantes

- O sistema usa JWT para autenticação (token válido por 30 dias)
- Cada gerente só acessa os dados da sua própria loja
- Os dados são isolados por `gerenteId` no backend
- Sempre certifique-se de que o MongoDB está rodando antes de iniciar o backend

## 🆘 Precisa de Ajuda?

Se encontrar problemas, verifique:
1. Versão do Node.js (`node --version`) - deve ser 16 ou superior
2. Versão do npm (`npm --version`)
3. MongoDB está rodando
4. Arquivo `.env` está configurado corretamente
5. Portas 3000 e 5000 estão livres
