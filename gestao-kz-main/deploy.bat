@echo off
echo.
echo ========================================
echo   GESTAO KZ - Deploy para GitHub/Vercel
echo ========================================
echo.

cd /d "%~dp0"

:: Solicitar mensagem do commit
set /p MSG="Descricao da atualizacao (Enter para 'update'): "
if "%MSG%"=="" set MSG=update

:: Adicionar todos os arquivos, commitar e fazer push
git add -A
git commit -m "%MSG%"
git push origin main

echo.
echo ========================================
echo  Push concluido! Vercel vai deployar
echo  automaticamente em alguns segundos.
echo ========================================
echo.
pause
