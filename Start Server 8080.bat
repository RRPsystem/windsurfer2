@echo off
setlocal
pushd "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File ".\start-server.ps1" -Port 8080
popd
endlocal
pause
