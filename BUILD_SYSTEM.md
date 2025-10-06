# 🚀 Travel Planner Build System

A comprehensive build and deployment system for predictable, clean application startup - similar to Spring Boot's build.gradle but for Node.js.

## 🎯 Quick Start

```bash
# Recommended: Clean start with automatic setup
npm run clean-start

# Or check system health first
npm run health-check
npm run clean-start
```

## 📋 Available Commands

### 🔧 **Build & Start Commands**

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run clean-start` | **Recommended** - Full clean start in development mode | Daily development |
| `npm run clean-start:dev` | Same as above (explicit dev mode) | Development |
| `npm run clean-start:prod` | Production build and start | Production deployment |
| `npm start` | Alias for `clean-start:prod` | Production shortcut |

### 🔍 **Health & Diagnostics**

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run health-check` | Comprehensive system health check | Before starting work |
| `npm run emergency-reset` | Nuclear option - resets everything | When all else fails |

### 🛠️ **Legacy Commands**

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev` | Traditional concurrent start | Manual control |
| `npm run server` | Backend only | Backend development |
| `npm run client` | Frontend only | Frontend development |

## 🔄 What `clean-start` Does

### Phase 1: Cleanup 🧹
- ✅ Kills all Node.js processes on required ports (3000, 5000, 8080)
- ✅ Clears build caches and artifacts
- ✅ Removes stale build outputs

### Phase 2: Setup 📦
- ✅ Checks and installs missing dependencies
- ✅ Sets up database schema
- ✅ Validates project structure

### Phase 3: Start 🚀
- ✅ Starts backend server with health monitoring
- ✅ Starts frontend with optimized settings
- ✅ Waits for services to be ready
- ✅ Provides status dashboard

## 🏗️ Development vs Production

### Development Mode (`npm run clean-start`)
```
🌐 Frontend: http://localhost:3000 (React dev server)
📡 Backend: http://localhost:5000 (Express with nodemon)
🧳 AI Trip Creator: http://localhost:3000/ai-create-trip
```

### Production Mode (`npm run clean-start:prod`)
```
🌐 Application: http://localhost:8080 (Optimized build)
📡 Backend: http://localhost:5000 (Express production)
🧳 AI Trip Creator: http://localhost:8080/ai-create-trip
```

## 🔍 Health Check Features

The health check verifies:
- ✅ Required files exist
- ✅ Dependencies are installed
- ✅ Package.json scripts are configured
- ✅ Ports are available
- ✅ Database connectivity

```bash
npm run health-check
```

**Sample Output:**
```
🔍 Running Travel Planner Health Check...

📁 Checking required files...
  ✅ package.json
  ✅ server/package.json
  ✅ client/package.json
  ✅ server/index.js
  ✅ client/src/index.js

📦 Checking dependencies...
📋 Checking package scripts...

🔌 Checking ports...
  ✅ Port 3000 is available
  ✅ Port 5000 is available
  ✅ Port 8080 is available

===============================================
📊 HEALTH CHECK RESULTS
===============================================
✅ All checks passed! System is ready.

💡 Recommendations:
  • You can start the application with: npm run clean-start
```

## 🚨 Emergency Reset

When everything goes wrong:

```bash
npm run emergency-reset
```

**This will:**
- 💀 Kill ALL Node.js processes
- 🗑️ Delete all node_modules
- 🧹 Clear all caches
- 🗄️ Reset database
- ⬇️ Reinstall all dependencies

## 🔧 Troubleshooting

### Problem: Ports in use
```bash
npm run clean-start  # Automatically clears ports
```

### Problem: Weird build errors
```bash
npm run health-check  # Diagnose issues
npm run clean-start   # Clean restart
```

### Problem: Nothing works
```bash
npm run emergency-reset  # Nuclear option
npm run health-check     # Verify everything is fixed
npm run clean-start      # Fresh start
```

### Problem: Frontend won't compile
The clean-start script includes:
- Cache clearing
- Sourcemap optimization
- Dependency validation
- Predictable startup sequence

## 🎯 Best Practices

### Daily Development Workflow
```bash
# Start of day
npm run health-check
npm run clean-start

# Code, test, iterate...

# When switching branches or pulling changes
npm run clean-start

# When encountering weird issues
npm run emergency-reset
```

### Production Deployment
```bash
npm run health-check
npm run clean-start:prod
```

### Before Committing
```bash
npm run test:all
npm run clean-start:prod  # Verify production build works
```

## ⚙️ Configuration

The build system automatically detects and configures:

- **Ports**: 3000 (dev), 5000 (API), 8080 (prod)
- **Environments**: Development vs Production modes
- **Dependencies**: Auto-installs missing packages
- **Database**: Auto-setup and migrations
- **Caching**: Intelligent cache management

## 🚀 Advanced Usage

### Custom Environment Variables
```bash
# Development with custom settings
GENERATE_SOURCEMAP=false npm run clean-start

# Production with debug
DEBUG=* npm run clean-start:prod
```

### Manual Service Control
```bash
# Start just the backend
cd server && npm run dev

# Start just the frontend
cd client && npm start

# Production build only
npm run build
```

### Testing Integration
```bash
# Full test suite before deployment
npm run health-check
npm run test:all
npm run clean-start:prod
```

## 📊 Monitoring

The clean-start script provides real-time status:

```
🔧 Starting Travel Planner in development mode...
🔄 Killing processes on required ports...
✅ Cleared port 3000
✅ Cleared port 5000
✅ Cleared port 8080
🧹 Cleaning build artifacts and caches...
✅ Cleaned client/build
📦 Checking dependencies...
🗄️ Setting up database...
✅ Database setup complete
🚀 Starting development environment...
Starting backend server...
⏳ Waiting for Backend on port 5000...
✅ Backend is ready on port 5000
Starting frontend development server...
⏳ Waiting for Frontend on port 3000...
✅ Frontend is ready on port 3000

🎉 All services are running!
============================================================
📋 SERVICE STATUS
============================================================
🌐 Frontend: http://localhost:3000
📡 Backend API: http://localhost:5000
🧳 AI Trip Creator: http://localhost:3000/ai-create-trip
🔍 Health Check: http://localhost:5000/api/health
============================================================
💡 Press Ctrl+C to stop all services
```

---

This build system provides **Spring Boot-level reliability** for Node.js development, ensuring consistent, predictable application startup every time.