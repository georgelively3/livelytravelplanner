# Travel Planner - Gradle Build Setup

This project has been migrated from Maven to Gradle for improved build performance and flexibility.

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js & npm (for frontend development)

### Building the Project

```bash
# Build entire project
./gradlew build

# Build backend only  
./gradlew :travel-planner-backend:build

# Run Spring Boot application
./gradlew :travel-planner-backend:bootRun
```

## 🧪 Testing

### Run All Tests
```bash
./gradlew test
```

### Run Unit Tests Only (excluding Karate)
```bash
./gradlew :travel-planner-backend:unitTest
```

### Run Karate Integration Tests Only
```bash
./gradlew :travel-planner-backend:karateTest
```

### Code Coverage
```bash
# Generate JaCoCo coverage report
./gradlew :travel-planner-backend:jacocoTestReport

# Verify coverage meets threshold (75%)
./gradlew :travel-planner-backend:jacocoTestCoverageVerification
```

## 📋 Available Tasks

### Backend Tasks
- `bootRun` - Run Spring Boot application
- `bootJar` - Create executable JAR
- `test` - Run all tests (unit + Karate)
- `unitTest` - Run unit tests only
- `karateTest` - Run Karate integration tests only
- `jacocoTestReport` - Generate code coverage report

### Frontend Tasks  
- `npmInstall` - Install npm dependencies
- `npmBuild` - Build Angular application
- `npmServe` - Serve Angular app for development
- `npmTest` - Run Angular unit tests
- `npmLint` - Run Angular linting

### Utility Tasks
```bash
# List all available tasks
./gradlew tasks

# Get help for specific task
./gradlew help --task <taskName>

# Clean build artifacts
./gradlew clean
```

## 🏗️ Project Structure

```
livelytravelplanner/
├── backend/              # Spring Boot backend
│   ├── src/
│   └── build.gradle.kts
├── frontend/             # Angular frontend  
│   ├── src/
│   └── build.gradle.kts
├── settings.gradle.kts   # Multi-module configuration
├── build.gradle.kts      # Root build script
└── gradle.properties     # Gradle configuration
```

## 🔧 Configuration

### JaCoCo Code Coverage
- **Threshold**: 75% instruction coverage
- **Excluded**: Model classes (`**/model/**`)
- **Reports**: HTML and XML formats

### Test Configuration
- **Unit Tests**: Run with `unitTest` task
- **Integration Tests**: Karate tests run with `karateTest` task  
- **Combined**: All tests run with `test` task

### Gradle Properties
- **JVM Args**: Configured for optimal performance
- **Parallel Builds**: Enabled
- **Build Cache**: Enabled
- **Daemon**: Enabled

## 🆚 Migration from Maven

### Key Changes
- **Build Tool**: Maven → Gradle
- **Build Scripts**: `pom.xml` → `build.gradle.kts`
- **Task Names**: 
  - `mvn test` → `./gradlew test`
  - `mvn spring-boot:run` → `./gradlew bootRun`
  - `mvn clean compile` → `./gradlew build`

### Benefits
- **Faster Builds**: Incremental compilation and build cache
- **Better Multi-Module**: Cleaner frontend/backend coordination
- **Flexible Testing**: Separate unit and integration test tasks
- **Modern Syntax**: Kotlin DSL for type-safe build scripts

## 📊 Performance

- **Build Cache**: Enabled for faster incremental builds
- **Parallel Execution**: Multi-module builds run in parallel
- **JVM Tuning**: Optimized memory settings
- **Incremental Compilation**: Only changed files are recompiled

## 🧩 Multi-Module Setup

The project consists of two modules:
- **Backend** (`travel-planner-backend`): Spring Boot API
- **Frontend** (`travel-planner-frontend`): Angular SPA

Run tasks for specific modules:
```bash
./gradlew :travel-planner-backend:test
./gradlew :travel-planner-frontend:npmBuild
```