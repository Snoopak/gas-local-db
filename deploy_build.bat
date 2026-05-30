@echo off
:: Ця команда не дасть вікну закритися при помилці
setlocal enabledelayedexpansion

echo 🚀 Starting build process...
cd /d "%~dp0"

:: 1. Перевірка чи є папка node_modules
if not exist "node_modules\" (
    echo ❌ Error: node_modules not found. Run 'npm install' first.
    pause
    exit /b
)

:: 2. Збірка (використовуємо CALL обов'язково)
echo 🏗️ Running build...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ❌ Error during npm run build!
    pause
    exit /b
)

:: 3. Робота з папкою build
if not exist "build\" (
    echo ❌ Error: build folder was not created!
    pause
    exit /b
)
cd build

:: 4. Налаштування Git всередині build
if not exist .git (
    echo 🧱 Initializing new git in build folder...
    git init
    git branch -M gh-pages
    :: Обов'язково перевірте це посилання!
    git remote add origin https://github.com/Snoopak/gas-local-db2.git
)

:: 5. Деплой
echo 📤 Uploading to GitHub...
git add .
git commit -m "Auto deploy" >nul 2>&1
:: Додаємо force push
git push -u --force origin gh-pages

if %ERRORLEVEL% neq 0 (
    echo ❌ Error during git push!
    pause
    exit /b
)

echo ✅ Done! Site should be live soon.
pause