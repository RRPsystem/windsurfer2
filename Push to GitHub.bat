@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Push to GitHub helper
REM Usage: double-click or run with an optional message: Push to GitHub.bat "feat: update"

REM Get commit message from args or prompt
set MSG=%*
if "%MSG%"=="" (
  set /p MSG=Commit message: 
)
if "%MSG%"=="" set MSG=chore: update

REM Ensure we are in the script directory
pushd %~dp0

REM Show current repo status
where git >nul 2>&1
if errorlevel 1 (
  echo Git is not installed or not in PATH.
  echo Install Git and try again: https://git-scm.com/downloads
  pause
  exit /b 1
)

echo.
echo Adding changes...
git add .

REM Commit (allow empty to avoid failing when no changes)
echo Committing with message: %MSG%
git commit -m "%MSG%" --allow-empty

REM Detect current branch, default to main
for /f "tokens=*" %%b in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%b
if "%BRANCH%"=="HEAD" set BRANCH=main
if "%BRANCH%"=="" set BRANCH=main

echo.
echo Pushing to origin %BRANCH% ...
git push -u origin %BRANCH%
if errorlevel 1 (
  echo.
  echo Push failed. If no remote is set, run:
  echo   git remote add origin https://github.com/<jouw-account>/<jouw-repo>.git
  echo   git push -u origin %BRANCH%
  pause
  exit /b 1
)

echo.
echo Done. Changes pushed to GitHub.
popd
pause
