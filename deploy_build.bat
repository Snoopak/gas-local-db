@echo off
echo 🚀 Building and deploying build folder to GitHub Pages...
cd /d "%~dp0"

:: 1. Build React app
echo 🏗️ Running build...
npm run build

:: 2. Move into the build folder
cd build

:: 3. Initialize git if needed
if not exist .git (
    echo 🧱 Initializing git...
    git init
    git branch -M gh-pages
    git remote add origin https://github.com/Snoopak/gas-local-db.git
)

:: 4. Add, commit, push
git add .
git commit -m "Auto deploy build to GitHub Pages" >nul 2>&1
git push -u --force origin gh-pages

:: 5. Done!
echo ✅ Deployment complete!
echo 🌐 Check your site at: https://snoopak.github.io/gas-local-db/
pause
