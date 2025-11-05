@echo off
chcp 65001 >nul
echo ========================================
echo   INSTALADOR AUTOMATICO DO SISTEMA
echo   Sistema de Gestao de Metas
echo ========================================
echo.

REM Verificar se Node.js está instalado
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js primeiro:
    echo 1. Acesse: https://nodejs.org/
    echo 2. Baixe a versao LTS
    echo 3. Instale e reinicie este script
    echo.
    pause
    exit /b 1
)

echo Node.js encontrado!
node --version
echo.

REM Verificar se npm está instalado
echo [2/5] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo npm encontrado!
npm --version
echo.

REM Verificar se arquivo .env existe
echo [3/5] Verificando configuracao...
if not exist ".env" (
    echo AVISO: Arquivo .env nao encontrado!
    echo.
    echo Criando arquivo .env de exemplo...
    (
        echo PORT=5000
        echo MONGODB_URI=mongodb://localhost:27017/gestao-metas
        echo JWT_SECRET=secret_key_gestao_metas_mude_em_producao
    ) > .env
    echo.
    echo Arquivo .env criado. POR FAVOR, EDITE O ARQUIVO .env
    echo e configure a conexao com o MongoDB antes de continuar!
    echo.
    echo Pressione qualquer tecla para abrir o arquivo .env...
    pause >nul
    notepad .env
    echo.
    echo Continuando instalacao...
) else (
    echo Arquivo .env encontrado.
)
echo.

REM Instalar dependências do backend
echo [4/5] Instalando dependencias do backend...
echo Isso pode demorar alguns minutos...
call npm install
if errorlevel 1 (
    echo.
    echo ERRO ao instalar dependencias do backend!
    pause
    exit /b 1
)
echo.

REM Instalar dependências do frontend
echo [5/5] Instalando dependencias do frontend...
echo Isso pode demorar alguns minutos...
cd frontend
call npm install
if errorlevel 1 (
    echo.
    echo ERRO ao instalar dependencias do frontend!
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Verifique se o MongoDB esta configurado e rodando
echo 2. Edite o arquivo .env se necessario
echo 3. Execute: npm run dev
echo.
echo O sistema estara disponivel em: http://localhost:3000
echo.
pause





