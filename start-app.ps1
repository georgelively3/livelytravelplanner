# Travel Planner Start Script
Write-Host "🚀 Starting Travel Planner Application" -ForegroundColor Cyan

# Navigate to server directory and start backend
Write-Host "`n🔧 Step 1: Starting Backend Server..." -ForegroundColor Yellow
Set-Location "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\server"

$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -PassThru
Write-Host "✅ Backend server started (PID: $($backendJob.Id))" -ForegroundColor Green

# Wait for backend to initialize
Write-Host "`n⏳ Waiting 8 seconds for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Navigate to client directory and start frontend
Write-Host "`n🌐 Step 2: Starting Frontend Development Server..." -ForegroundColor Yellow
Set-Location "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\client"

$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -PassThru
Write-Host "✅ Frontend server started (PID: $($frontendJob.Id))" -ForegroundColor Green

Write-Host "`n📋 Service Information:" -ForegroundColor Cyan
Write-Host "   🌐 Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   📡 Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "   🔍 Health:   http://localhost:5000/api/health" -ForegroundColor White

Write-Host "`n💡 Two PowerShell windows should have opened." -ForegroundColor Cyan
Write-Host "   Close them to stop the services." -ForegroundColor Cyan

Write-Host "`n⏳ Waiting a few more seconds for full startup..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test the backend
try {
    Write-Host "`n🔍 Testing backend connection..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend is responding: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend not responding yet. Give it a moment..." -ForegroundColor Red
}

Write-Host "`n🎉 Setup complete! Check the opened windows and navigate to http://localhost:3000" -ForegroundColor Green