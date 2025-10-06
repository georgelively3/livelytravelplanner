#!/usr/bin/env node

/**
 * Clean Start Script for Travel Planner
 * This script provides a predictable, clean startup process similar to build.gradle
 * 
 * Usage:
 *   npm run clean-start          # Full clean and start
 *   npm run clean-start -- --dev # Development mode with hot reload
 *   npm run clean-start -- --prod # Production build and serve
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class CleanStartManager {
  constructor() {
    this.isWindows = os.platform() === 'win32';
    this.processes = [];
    this.config = {
      ports: {
        backend: 5000,
        frontend: 3000,
        production: 8080
      },
      directories: {
        root: process.cwd(),
        server: path.join(process.cwd(), 'server'),
        client: path.join(process.cwd(), 'client')
      }
    };
    
    // Parse command line arguments
    this.mode = this.parseArgs();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => this.cleanup());
    process.on('SIGTERM', () => this.cleanup());
    process.on('exit', () => this.cleanup());
  }

  parseArgs() {
    const args = process.argv.slice(2);
    if (args.includes('--prod') || args.includes('--production')) {
      return 'production';
    } else if (args.includes('--dev') || args.includes('--development')) {
      return 'development';
    }
    return 'development'; // Default
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const cmd = this.isWindows ? 'cmd' : 'sh';
      const args = this.isWindows ? ['/c', command] : ['-c', command];
      
      this.log(`Running: ${command}`);
      
      const child = spawn(cmd, args, {
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd || this.config.directories.root,
        env: { ...process.env, ...options.env }
      });

      if (options.background) {
        this.processes.push(child);
        resolve(child);
      } else {
        child.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Command failed with code ${code}: ${command}`));
          }
        });
      }
    });
  }

  async killProcessesOnPorts() {
    this.log('🔄 Killing processes on required ports...', 'warning');
    
    const ports = Object.values(this.config.ports);
    
    for (const port of ports) {
      try {
        if (this.isWindows) {
          // Windows: Find and kill processes on port
          await this.runCommand(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /f /pid %a`, { silent: true });
        } else {
          // Unix: Find and kill processes on port
          await this.runCommand(`lsof -ti:${port} | xargs kill -9`, { silent: true });
        }
        this.log(`✅ Cleared port ${port}`);
      } catch (error) {
        // It's okay if no process was found on the port
        this.log(`ℹ️  Port ${port} was already free`);
      }
    }

    // Additional cleanup for Node.js processes
    try {
      if (this.isWindows) {
        await this.runCommand('taskkill /f /im node.exe', { silent: true });
      } else {
        await this.runCommand('pkill -f node', { silent: true });
      }
      this.log('✅ Killed existing Node.js processes');
    } catch (error) {
      this.log('ℹ️  No existing Node.js processes found');
    }

    // Wait a moment for processes to fully terminate
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  async cleanDirectories() {
    this.log('🧹 Cleaning build artifacts and caches...', 'warning');
    
    const dirsToClean = [
      path.join(this.config.directories.client, 'build'),
      path.join(this.config.directories.client, 'node_modules', '.cache'),
      path.join(this.config.directories.server, 'node_modules', '.cache'),
      path.join(this.config.directories.root, 'node_modules', '.cache')
    ];

    for (const dir of dirsToClean) {
      try {
        if (fs.existsSync(dir)) {
          if (this.isWindows) {
            await this.runCommand(`rmdir /s /q "${dir}"`, { silent: true });
          } else {
            await this.runCommand(`rm -rf "${dir}"`, { silent: true });
          }
          this.log(`✅ Cleaned ${path.relative(this.config.directories.root, dir)}`);
        }
      } catch (error) {
        this.log(`⚠️  Could not clean ${dir}: ${error.message}`, 'warning');
      }
    }
  }

  async checkDependencies() {
    this.log('📦 Checking dependencies...', 'info');
    
    const packagePaths = [
      this.config.directories.root,
      this.config.directories.server,
      this.config.directories.client
    ];

    for (const packagePath of packagePaths) {
      const packageJsonPath = path.join(packagePath, 'package.json');
      const nodeModulesPath = path.join(packagePath, 'node_modules');
      
      if (fs.existsSync(packageJsonPath) && !fs.existsSync(nodeModulesPath)) {
        this.log(`Installing dependencies in ${path.relative(this.config.directories.root, packagePath)}...`);
        await this.runCommand('npm install', { cwd: packagePath });
      }
    }
  }

  async setupDatabase() {
    this.log('🗄️  Setting up database...', 'info');
    
    try {
      await this.runCommand('node scripts/setupDatabase.js', {
        cwd: this.config.directories.server
      });
      this.log('✅ Database setup complete');
    } catch (error) {
      this.log(`⚠️  Database setup warning: ${error.message}`, 'warning');
    }
  }

  async startDevelopment() {
    this.log('🚀 Starting development environment...', 'success');
    
    // Start backend
    this.log('Starting backend server...');
    const backendProcess = await this.runCommand('npm run dev', {
      cwd: this.config.directories.server,
      background: true
    });

    // Wait for backend to be ready
    await this.waitForService(this.config.ports.backend, 'Backend');

    // Start frontend
    this.log('Starting frontend development server...');
    const frontendProcess = await this.runCommand('npm start', {
      cwd: this.config.directories.client,
      background: true,
      env: { GENERATE_SOURCEMAP: 'false' }
    });

    // Wait for frontend to be ready
    await this.waitForService(this.config.ports.frontend, 'Frontend');

    this.logServiceStatus();
  }

  async startProduction() {
    this.log('🏗️  Building for production...', 'success');
    
    // Build React app
    await this.runCommand('npm run build', {
      cwd: this.config.directories.client
    });

    // Start backend
    this.log('Starting backend server...');
    await this.runCommand('npm start', {
      cwd: this.config.directories.server,
      background: true
    });

    // Wait for backend to be ready
    await this.waitForService(this.config.ports.backend, 'Backend');

    // Start production server
    this.log('Starting production server...');
    await this.runCommand('node simple-server.js', {
      background: true
    });

    // Wait for production server to be ready
    await this.waitForService(this.config.ports.production, 'Production Server');

    this.logServiceStatus();
  }

  async waitForService(port, serviceName, maxAttempts = 30) {
    this.log(`Waiting for ${serviceName} on port ${port}...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (this.isWindows) {
          await this.runCommand(`powershell -Command "Invoke-WebRequest -Uri http://localhost:${port} -Method GET -TimeoutSec 1"`, { silent: true });
        } else {
          await this.runCommand(`curl -f http://localhost:${port} --max-time 1`, { silent: true });
        }
        
        this.log(`✅ ${serviceName} is ready on port ${port}`, 'success');
        return;
      } catch (error) {
        if (attempt === maxAttempts) {
          this.log(`❌ ${serviceName} failed to start on port ${port}`, 'error');
          throw new Error(`${serviceName} did not start within ${maxAttempts} attempts`);
        }
        
        if (attempt % 5 === 0) {
          this.log(`⏳ Still waiting for ${serviceName}... (attempt ${attempt}/${maxAttempts})`);
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  logServiceStatus() {
    this.log('🎉 All services are running!', 'success');
    console.log('\n' + '='.repeat(60));
    console.log('📋 SERVICE STATUS');
    console.log('='.repeat(60));
    
    if (this.mode === 'production') {
      console.log(`🌐 Application: http://localhost:${this.config.ports.production}`);
      console.log(`📡 Backend API: http://localhost:${this.config.ports.backend}`);
      console.log(`🧳 AI Trip Creator: http://localhost:${this.config.ports.production}/ai-create-trip`);
    } else {
      console.log(`🌐 Frontend: http://localhost:${this.config.ports.frontend}`);
      console.log(`📡 Backend API: http://localhost:${this.config.ports.backend}`);
      console.log(`🧳 AI Trip Creator: http://localhost:${this.config.ports.frontend}/ai-create-trip`);
    }
    
    console.log(`🔍 Health Check: http://localhost:${this.config.ports.backend}/api/health`);
    console.log('='.repeat(60));
    console.log('💡 Press Ctrl+C to stop all services');
    console.log('');
  }

  async cleanup() {
    if (this.processes.length > 0) {
      this.log('🛑 Stopping all services...', 'warning');
      
      for (const process of this.processes) {
        try {
          if (this.isWindows) {
            spawn('taskkill', ['/pid', process.pid, '/f', '/t']);
          } else {
            process.kill('SIGTERM');
          }
        } catch (error) {
          // Process might already be dead
        }
      }
      
      this.log('✅ All services stopped', 'success');
    }
  }

  async run() {
    try {
      this.log(`🔧 Starting Travel Planner in ${this.mode} mode...`, 'info');
      
      // Phase 1: Cleanup
      await this.killProcessesOnPorts();
      await this.cleanDirectories();
      
      // Phase 2: Setup
      await this.checkDependencies();
      await this.setupDatabase();
      
      // Phase 3: Start services
      if (this.mode === 'production') {
        await this.startProduction();
      } else {
        await this.startDevelopment();
      }
      
      // Keep the process running
      await new Promise(() => {}); // Run forever until Ctrl+C
      
    } catch (error) {
      this.log(`❌ Startup failed: ${error.message}`, 'error');
      await this.cleanup();
      process.exit(1);
    }
  }
}

// Run the script
if (require.main === module) {
  const manager = new CleanStartManager();
  manager.run();
}

module.exports = CleanStartManager;