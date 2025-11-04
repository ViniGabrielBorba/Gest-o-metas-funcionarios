Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Configurar Senha MongoDB Atlas" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Por favor, digite a senha do usuario 'gerente' do MongoDB Atlas:" -ForegroundColor Yellow
Write-Host "(A senha nao sera exibida na tela por seguranca)" -ForegroundColor Gray
Write-Host ""

$password = Read-Host "Senha" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

if ($passwordPlain) {
    $connectionString = "mongodb+srv://gerente:$passwordPlain@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0"
    
    # Atualizar arquivo .env
    $envContent = @"
PORT=5000
MONGODB_URI=$connectionString
JWT_SECRET=secret_key_gestao_metas_mude_em_producao
"@
    
    Set-Content -Path .env -Value $envContent -Encoding utf8
    
    Write-Host ""
    Write-Host "Arquivo .env atualizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "String de conexao configurada:" -ForegroundColor Cyan
    Write-Host "mongodb+srv://gerente:***@cluster0.gbemu6i.mongodb.net/gestao-metas?appName=Cluster0" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Agora voce pode executar: npm run dev" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "Senha nao fornecida. Operacao cancelada." -ForegroundColor Red
    Write-Host ""
}




