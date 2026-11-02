@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Chua tim thay Node.js LTS. Hay cai Node.js roi chay lai.& pause & exit /b 1)
echo Dang cai thu vien...
call npm install
if errorlevel 1 (echo Cai dat that bai. Kiem tra Internet va Node.js.& pause & exit /b 1)
start "" http://localhost:5173
call npm run dev
pause
