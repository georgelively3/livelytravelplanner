@echo off
echo 🚀 Starting Travel Planner Application

echo.
echo 🔧 Step 1: Starting Backend Server...
cd /d "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\server"
start "Backend Server" cmd /k "npm start"

echo.
echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo 🌐 Step 2: Starting Frontend Development Server...
cd /d "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\client"
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Both services are starting!
echo.
echo 📋 Service URLs:
echo    🌐 Frontend: http://localhost:3000
echo    📡 Backend:  http://localhost:5000
echo    🔍 Health:   http://localhost:5000/api/health
echo.
echo 💡 Two command windows should have opened.
echo    Close them to stop the services.
echo.
pause