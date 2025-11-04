@echo off
echo ========================================
echo  Iniciando Frontend do Sistema
echo ========================================
echo.

cd frontend

echo Verificando dependencias...
if not exist "node_modules" (
    echo Dependencias nao encontradas. Instalando...
    call npm install
    echo.
)

echo.
echo Iniciando servidor frontend...
echo Aguarde alguns segundos...
echo.
echo O navegador deve abrir automaticamente em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm start

pause




