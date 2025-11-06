# 🗄️ Como Iniciar o MongoDB

## Verificar se MongoDB está instalado

### Opção 1: Verificar Serviço Windows
Abra o **Gerenciador de Serviços** (services.msc) e procure por "MongoDB". Se encontrar, clique com botão direito e selecione "Iniciar".

### Opção 2: Via PowerShell (como Administrador)
```powershell
# Verificar serviços MongoDB
Get-Service -Name MongoDB*

# Se encontrar, iniciar:
Start-Service MongoDB
```

### Opção 3: MongoDB não instalado?

#### Instalar MongoDB Community Server:
1. Acesse: https://www.mongodb.com/try/download/community
2. Baixe o instalador para Windows
3. Durante a instalação, marque a opção "Install MongoDB as a Service"
4. Após instalar, o MongoDB iniciará automaticamente

#### Ou usar MongoDB Atlas (Cloud - Gratuito):
1. Acesse: https://www.mongodb.com/cloud/atlas/register
2. Crie uma conta gratuita
3. Crie um cluster gratuito
4. Obtenha a string de conexão
5. Atualize o arquivo `.env` com a string de conexão:
   ```
   MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/gestao-metas
   ```

## Verificar se está funcionando

Após iniciar, teste a conexão:
```powershell
Test-NetConnection -ComputerName localhost -Port 27017
```

Se retornar "TcpTestSucceeded : True", o MongoDB está rodando!






