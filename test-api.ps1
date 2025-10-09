try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/ai/test-google-ai" -Method GET
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}