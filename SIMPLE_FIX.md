# FIXED: Simple Travel Planner Startup

## The Problem
The project setup was over-engineered with complex startup scripts that kept hanging. The fundamental issues were:
1. Missing react-scripts in client
2. Database initialization hanging the server
3. Windows PowerShell HTTP connectivity issues
4. Over-complex build system

## The Solution - Two Simple Commands

### Start Backend:
```powershell
cd "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\server"
node simple-backend.js
```

### Start Frontend (after fixing dependencies):
```powershell
cd "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\client"
npm install
npm start
```

## Quick Fix Commands

Run these in order:

1. **Fix Client Dependencies:**
```powershell
cd "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\client"
rm -rf node_modules
rm package-lock.json
npm install
```

2. **Start Backend:**
```powershell
cd "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\server"
node simple-backend.js
```

3. **Start Frontend (in new terminal):**
```powershell
cd "c:\Users\georg\LitheSpeed Dropbox\George Lively\lithespeed code\livelytravelplanner\client"
npm start
```

## Access Your App
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000/api/health

## Note
Use VS Code's Simple Browser or regular browser instead of PowerShell commands for testing URLs.