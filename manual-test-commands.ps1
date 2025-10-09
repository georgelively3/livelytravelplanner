# Copy-Paste Testing Commands
# Run these one at a time in PowerShell

# 1. QUICK HEALTH CHECK
Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET

# 2. LISBON ADVENTURE (3 days)
$lisbon = '{"travelerProfile":{"id":1,"name":"Adventure Seeker","interests":["outdoor","hiking","local cuisine"],"budget":"moderate"},"tripParameters":{"destination":"Lisbon","startDate":"2025-10-15","endDate":"2025-10-17","duration":3,"budget":1500.00,"interests":["outdoor","hiking","local cuisine"]}}'
Invoke-RestMethod -Uri "http://localhost:8080/api/ai/trip-plan" -Method POST -Body $lisbon -ContentType "application/json" | ConvertTo-Json -Depth 2

# 3. PARIS CULTURE (3 days)
$paris = '{"travelerProfile":{"id":2,"name":"Culture Enthusiast","interests":["museums","art","history"],"budget":"luxury"},"tripParameters":{"destination":"Paris","startDate":"2025-11-01","endDate":"2025-11-03","duration":3,"budget":2500.00,"interests":["museums","art","history"]}}'
Invoke-RestMethod -Uri "http://localhost:8080/api/ai/trip-plan" -Method POST -Body $paris -ContentType "application/json" | ConvertTo-Json -Depth 2

# 4. TOKYO TECH (5 days)
$tokyo = '{"travelerProfile":{"id":3,"name":"Tech Explorer","interests":["technology","culture","food"],"budget":"moderate"},"tripParameters":{"destination":"Tokyo","startDate":"2025-12-01","endDate":"2025-12-05","duration":5,"budget":2000.00,"interests":["technology","culture","food"]}}'
Invoke-RestMethod -Uri "http://localhost:8080/api/ai/trip-plan" -Method POST -Body $tokyo -ContentType "application/json" | ConvertTo-Json -Depth 2

# 5. CUSTOM TRIP - MODIFY THIS!
$custom = '{"travelerProfile":{"id":4,"name":"Your Name","interests":["YOUR","INTERESTS","HERE"],"budget":"moderate"},"tripParameters":{"destination":"YOUR_CITY","startDate":"2025-10-20","endDate":"2025-10-25","duration":6,"budget":1800.00,"interests":["YOUR","INTERESTS","HERE"]}}'
Invoke-RestMethod -Uri "http://localhost:8080/api/ai/trip-plan" -Method POST -Body $custom -ContentType "application/json"