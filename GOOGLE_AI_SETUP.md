# Google AI API Key Configuration
# Copy your actual API key from Google AI Studio and set it here

# Option 1: Set as environment variable (RECOMMENDED)
# In PowerShell:
$env:GOOGLE_AI_API_KEY="AIzaSyC_YOUR_ACTUAL_API_KEY_HERE"

# Option 2: Or add to application.properties (less secure for production)
# google.ai.api.key=AIzaSyC_YOUR_ACTUAL_API_KEY_HERE

# To test if key is working, the application will:
# 1. Try to call Google AI API with real key
# 2. Fall back to stub data if key is invalid/missing
# 3. Log which mode it's using in console output