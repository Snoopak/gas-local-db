@echo off
set BROWSER=none

:: Запускаємо сервер у фоні або через старт
:: (Команда timeout дає паузу в 4 секунди перед відкриттям Chrome)
start /b npm start
timeout /t 4 /nobreak >nul

:: Тепер відкриваємо Chrome, коли сервер готовий
start chrome http://localhost:3000
