# Script para reiniciar o backend
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Reiniciando Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Parando processos Node..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Iniciando backend..." -ForegroundColor Green
Write-Host "Aguarde alguns segundos..." -ForegroundColor Gray
Write-Host ""

cd C:\Users\vinicius\Desktop\gerente

Start-Process powershell -ArgumentList '-NoExit', '-Command', "cd C:\Users\vinicius\Desktop\gerente; npm run server"

Write-Host ""
Write-Host "Backend iniciado em nova janela!" -ForegroundColor Green
Write-Host "Verifique se aparece: 'MongoDB conectado' e 'Servidor rodando na porta 5000'" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione Enter para continuar..." -ForegroundColor Gray
Read-Host











