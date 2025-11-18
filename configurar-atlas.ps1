# Configurar MongoDB Atlas
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurando MongoDB Atlas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseConnection = "mongodb+srv://gerente:<db_password>@cluster0.gbemu6i.mongodb.net/?appName=Cluster0"

Write-Host "Sua string de conexao base:" -ForegroundColor Yellow
Write-Host $baseConnection -ForegroundColor Gray
Write-Host ""

$password = Read-Host "Digite a senha do usuario 'gerente' do MongoDB Atlas"

if ($password) {
    # Substituir a senha na string de conexao
    $connectionString = $baseConnection -replace "<db_password>", $password
    
    # Adicionar nome do banco de dados
    if ($connectionString -match "\?") {
        $connectionString = $connectionString -replace "\?", "/gestao-metas?"
    } else {
        $connectionString = $connectionString + "/gestao-metas"
    }
    
    Write-Host ""
    Write-Host "String de conexao configurada:" -ForegroundColor Green
    Write-Host $connectionString -ForegroundColor Gray
    Write-Host ""
    
    # Atualizar arquivo .env
    $envContent = Get-Content .env -Raw -ErrorAction SilentlyContinue
    
    if (-not $envContent) {
        $envContent = "PORT=5000`nMONGODB_URI=$connectionString`nJWT_SECRET=secret_key_gestao_metas_mude_em_producao"
    } elseif ($envContent -match "MONGODB_URI=") {
        $envContent = $envContent -replace "MONGODB_URI=.*", "MONGODB_URI=$connectionString"
    } else {
        $envContent = $envContent + "`nMONGODB_URI=$connectionString"
    }
    
    Set-Content -Path .env -Value $envContent -NoNewline
    
    Write-Host "Arquivo .env atualizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora voce pode executar: npm run dev" -ForegroundColor Yellow
} else {
    Write-Host "Senha nao fornecida. Operacao cancelada." -ForegroundColor Red
}

Write-Host ""
Read-Host "Pressione Enter para continuar"
















