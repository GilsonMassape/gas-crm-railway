@echo off
setlocal enabledelayedexpansion

:: ====== AJUSTE AQUI SE PRECISAR ======
set DB_SERVICE=crm_postgres
set PGUSER=crm
set PGDATABASE=crm
set BACKUP_DIR=C:\CRM-GAS\backups
:: =====================================

for /f %%i in ('powershell -NoP -C "(Get-Date).ToString('yyyyMMdd_HHmmss')"') do set TS=%%i
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo [1/3] Gerando dump do Postgres...
docker compose exec -T %DB_SERVICE% pg_dump -U %PGUSER% %PGDATABASE% > "%BACKUP_DIR%\crm_%TS%.sql"
if errorlevel 1 ( echo ERRO no pg_dump & exit /b 1 )

echo [2/3] Compactando arquivo...
powershell -NoP -C "Compress-Archive -Path '%BACKUP_DIR%\crm_%TS%.sql' -DestinationPath '%BACKUP_DIR%\crm_%TS%.zip' -Force"
del "%BACKUP_DIR%\crm_%TS%.sql"

echo [3/3] Limpando backups antigos (7 dias)...
powershell -NoP -C "Get-ChildItem '%BACKUP_DIR%\*.zip' | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | Remove-Item -Force"

echo Concluido. Arquivo: %BACKUP_DIR%\crm_%TS%.zip
endlocal
