@echo off
echo ERROR: Maven is not available for this project!
echo This project uses Gradle. Please use './gradlew' instead of 'mvn'.
echo Available commands:
echo   ./gradlew build          - Build the project  
echo   ./gradlew bootRun        - Run the application
echo   ./gradlew test           - Run tests
echo   ./gradlew clean          - Clean build artifacts
echo.
exit /b 1