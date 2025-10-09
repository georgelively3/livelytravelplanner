# Quick Test Script for AI Trip Plan Endpoint
# Run this in PowerShell

Write-Host "🚀 Testing AI Trip Plan Endpoint" -ForegroundColor Green

# Test 1: Lisbon Adventure Trip
Write-Host "`n📍 Test 1: Lisbon Adventure Trip" -ForegroundColor Yellow
$lisbonTrip = @{
    travelerProfile = @{
        id = 1
        name = "Adventure Seeker"
        interests = @("outdoor", "hiking", "local cuisine")
        budget = "moderate"
    }
    tripParameters = @{
        destination = "Lisbon"
        startDate = "2025-10-15"
        endDate = "2025-10-17"
        duration = 3
        budget = 1500.00
        interests = @("outdoor", "hiking", "local cuisine")
    }
} | ConvertTo-Json -Depth 3

try {
    $response1 = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/trip-plan" -Method POST -Body $lisbonTrip -ContentType "application/json"
    Write-Host "✅ SUCCESS - Lisbon Trip Generated!" -ForegroundColor Green
    Write-Host "📅 Duration: $($response1.duration) days" -ForegroundColor Cyan
    Write-Host "💰 Budget: $($response1.totalBudget)" -ForegroundColor Cyan
    Write-Host "🏛️ Day 1 Activity: $($response1.dailyItineraries[0].activities[2].name)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Paris Cultural Trip
Write-Host "`n📍 Test 2: Paris Cultural Trip" -ForegroundColor Yellow
$parisTrip = @{
    travelerProfile = @{
        id = 2
        name = "Culture Enthusiast"
        interests = @("museums", "art", "history")
        budget = "luxury"
    }
    tripParameters = @{
        destination = "Paris"
        startDate = "2025-11-01"
        endDate = "2025-11-03"
        duration = 3
        budget = 2500.00
        interests = @("museums", "art", "history")
    }
} | ConvertTo-Json -Depth 3

try {
    $response2 = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/trip-plan" -Method POST -Body $parisTrip -ContentType "application/json"
    Write-Host "✅ SUCCESS - Paris Trip Generated!" -ForegroundColor Green
    Write-Host "📅 Duration: $($response2.duration) days" -ForegroundColor Cyan
    Write-Host "💰 Budget: $($response2.totalBudget)" -ForegroundColor Cyan
    Write-Host "🏛️ Day 1 Activity: $($response2.dailyItineraries[0].activities[2].name)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Custom Trip (You can modify this)
Write-Host "`n📍 Test 3: Your Custom Trip" -ForegroundColor Yellow
Write-Host "💡 Modify the destination and interests below for your own test!" -ForegroundColor Magenta

Write-Host "`n🌐 API Endpoint: http://localhost:8080/api/ai/trip-plan" -ForegroundColor Blue
Write-Host "📖 Frontend Integration: Coming next!" -ForegroundColor Blue