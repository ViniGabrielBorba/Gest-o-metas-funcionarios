# Script de Configuracao MongoDB
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurando MongoDB para o Sistema  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se MongoDB esta instalado localmente
Write-Host "[1/3] Verificando MongoDB local..." -ForegroundColor Yellow

$mongoService = Get-Service -Name MongoDB* -ErrorAction SilentlyContinue

if ($mongoService) {
    Write-Host "MongoDB encontrado!" -ForegroundColor Green
    
    if ($mongoService.Status -eq 'Running') {
        Write-Host "MongoDB ja esta rodando!" -ForegroundColor Green
        Write-Host ""
        Write-Host "MongoDB local esta pronto para uso!" -ForegroundColor Green
        Write-Host "Voce pode continuar usando: mongodb://localhost:27017/gestao-metas" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "MongoDB encontrado mas nao esta rodando" -ForegroundColor Yellow
        Write-Host "Tentando iniciar o servico..." -ForegroundColor Yellow
        
        try {
            Start-Service -Name $mongoService.Name
            Start-Sleep -Seconds 3
            
            $testConnection = Test-NetConnection -ComputerName localhost -Port 27017 -WarningAction SilentlyContinue
            
            if ($testConnection.TcpTestSucceeded) {
                Write-Host "MongoDB iniciado com sucesso!" -ForegroundColor Green
                Write-Host ""
                Write-Host "MongoDB local esta pronto para uso!" -ForegroundColor Green
                exit 0
            } else {
                Write-Host "Falha ao iniciar MongoDB" -ForegroundColor Red
            }
        } catch {
            Write-Host "Erro ao iniciar servico" -ForegroundColor Red
            Write-Host "  Tente iniciar manualmente via Gerenciador de Servicos" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "MongoDB nao encontrado localmente" -ForegroundColor Red
}

Write-Host ""
Write-Host "[2/3] Configurando MongoDB Atlas (Cloud)..." -ForegroundColor Yellow
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACAO MONGODB ATLAS (GRATUITO)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Siga estes passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abra este link no navegador:" -ForegroundColor White
Write-Host "   https://www.mongodb.com/cloud/atlas/register" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Crie uma conta gratuita" -ForegroundColor White
Write-Host ""
Write-Host "3. Crie um Cluster Gratuito:" -ForegroundColor White
Write-Host "   - Clique em Build a Database" -ForegroundColor Gray
Write-Host "   - Escolha FREE (M0)" -ForegroundColor Gray
Write-Host "   - Selecione regiao (Sao Paulo ou mais proxima)" -ForegroundColor Gray
Write-Host "   - Clique em Create" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configure Acesso:" -ForegroundColor White
Write-Host "   a) Crie um usuario de banco:" -ForegroundColor Gray
Write-Host "      Username: admin" -ForegroundColor DarkGray
Write-Host "      Password: [ANOTE A SENHA]" -ForegroundColor DarkGray
Write-Host ""
Write-Host "   b) Configure Network Access:" -ForegroundColor Gray
Write-Host "      Clique em Add IP Address" -ForegroundColor DarkGray
Write-Host "      Escolha Allow Access from Anywhere (0.0.0.0/0)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "5. Obtenha a String de Conexao:" -ForegroundColor White
Write-Host "   - Clique em Connect no cluster" -ForegroundColor Gray
Write-Host "   - Escolha Connect your application" -ForegroundColor Gray
Write-Host "   - Copie a string" -ForegroundColor Gray
Write-Host ""

Write-Host "[3/3] Aguardando voce inserir a string de conexao..." -ForegroundColor Yellow
Write-Host ""

$connectionString = Read-Host "Cole a string de conexao do MongoDB Atlas aqui"

if ($connectionString -and $connectionString -match "mongodb") {
    # Adicionar nome do banco se nao tiver
    if ($connectionString -notmatch "/gestao-metas") {
        if ($connectionString -match "\?") {
            $connectionString = $connectionString -replace "\?", "/gestao-metas?"
        } else {
            $connectionString = $connectionString + "/gestao-metas"
        }
    }
    
    # Atualizar arquivo .env
    $envContent = Get-Content .env -Raw
    
    if ($envContent -match "MONGODB_URI=") {
        $envContent = $envContent -replace "MONGODB_URI=.*", "MONGODB_URI=$connectionString"
    } else {
        $envContent = $envContent + "`nMONGODB_URI=$connectionString"
    }
    
    Set-Content -Path .env -Value $envContent -NoNewline
    
    Write-Host ""
    Write-Host "Arquivo .env atualizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "A string foi salva em: .env" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Agora voce pode executar: npm run dev" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "String invalida ou vazia. Configure manualmente:" -ForegroundColor Red
    Write-Host "   1. Abra o arquivo .env" -ForegroundColor White
    Write-Host "   2. Atualize a linha MONGODB_URI com sua string do Atlas" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
