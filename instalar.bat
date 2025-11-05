@echo off
echo ====================================
echo Instalando Sistema de Gestao de Metas
echo ====================================
echo.

echo [1/2] Instalando dependencias do backend...
call npm install

echo.
echo [2/2] Instalando dependencias do frontend...
cd frontend
call npm install
cd ..

echo.
echo ====================================
echo Instalacao concluida!
echo ====================================
echo.
echo Proximos passos:
echo 1. Crie o arquivo .env na raiz do projeto
echo 2. Configure as variaveis de ambiente
echo 3. Execute: npm run dev
echo.
pause





