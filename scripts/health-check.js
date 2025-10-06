#!/usr/bin/env node

/**
 * System Health Check Script
 * Verifies all components are properly configured and ready
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class HealthChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.config = {
      directories: {
        root: process.cwd(),
        server: path.join(process.cwd(), 'server'),
        client: path.join(process.cwd(), 'client')
      },
      requiredFiles: [
        'package.json',
        'server/package.json',
        'client/package.json',
        'server/index.js',
        'client/src/index.js'
      ],
      ports: [3000, 5000, 8080]
    };
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  checkFile(filePath) {
    const fullPath = path.join(this.config.directories.root, filePath);
    if (!fs.existsSync(fullPath)) {
      this.issues.push(`Missing file: ${filePath}`);
      return false;
    }
    return true;
  }

  async checkPort(port) {
    return new Promise((resolve) => {
      const { exec } = require('child_process');
      const isWindows = process.platform === 'win32';
      
      const command = isWindows 
        ? `netstat -ano | findstr :${port}`
        : `lsof -i :${port}`;
      
      exec(command, (error, stdout) => {
        if (stdout.trim()) {
          this.warnings.push(`Port ${port} is currently in use`);
        }
        resolve(!stdout.trim());
      });
    });
  }

  checkNodeModules() {
    const paths = [
      this.config.directories.root,
      this.config.directories.server,
      this.config.directories.client
    ];

    for (const dir of paths) {
      const nodeModulesPath = path.join(dir, 'node_modules');
      const packageJsonPath = path.join(dir, 'package.json');
      
      if (fs.existsSync(packageJsonPath) && !fs.existsSync(nodeModulesPath)) {
        this.issues.push(`Missing node_modules in ${path.relative(this.config.directories.root, dir)}`);
      }
    }
  }

  checkPackageScripts() {
    try {
      const rootPackage = JSON.parse(fs.readFileSync(path.join(this.config.directories.root, 'package.json')));
      const serverPackage = JSON.parse(fs.readFileSync(path.join(this.config.directories.server, 'package.json')));
      const clientPackage = JSON.parse(fs.readFileSync(path.join(this.config.directories.client, 'package.json')));

      const requiredScripts = {
        root: ['dev', 'clean-start'],
        server: ['dev', 'start'],
        client: ['start', 'build']
      };

      if (!requiredScripts.root.every(script => rootPackage.scripts && rootPackage.scripts[script])) {
        this.issues.push('Root package.json missing required scripts');
      }

      if (!requiredScripts.server.every(script => serverPackage.scripts && serverPackage.scripts[script])) {
        this.issues.push('Server package.json missing required scripts');
      }

      if (!requiredScripts.client.every(script => clientPackage.scripts && clientPackage.scripts[script])) {
        this.issues.push('Client package.json missing required scripts');
      }

    } catch (error) {
      this.issues.push('Failed to parse package.json files');
    }
  }

  async run() {
    console.log('🔍 Running Travel Planner Health Check...\n');

    // Check required files
    this.log('📁 Checking required files...', 'info');
    this.config.requiredFiles.forEach(file => {
      if (this.checkFile(file)) {
        this.log(`  ✅ ${file}`, 'success');
      } else {
        this.log(`  ❌ ${file}`, 'error');
      }
    });

    // Check node_modules
    this.log('\n📦 Checking dependencies...', 'info');
    this.checkNodeModules();

    // Check package scripts
    this.log('📋 Checking package scripts...', 'info');
    this.checkPackageScripts();

    // Check ports
    this.log('\n🔌 Checking ports...', 'info');
    for (const port of this.config.ports) {
      const available = await this.checkPort(port);
      if (available) {
        this.log(`  ✅ Port ${port} is available`, 'success');
      } else {
        this.log(`  ⚠️  Port ${port} is in use`, 'warning');
      }
    }

    // Report results
    console.log('\n' + '='.repeat(50));
    console.log('📊 HEALTH CHECK RESULTS');
    console.log('='.repeat(50));

    if (this.issues.length === 0) {
      this.log('✅ All checks passed! System is ready.', 'success');
    } else {
      this.log(`❌ Found ${this.issues.length} issue(s):`, 'error');
      this.issues.forEach(issue => this.log(`  • ${issue}`, 'error'));
    }

    if (this.warnings.length > 0) {
      this.log(`\n⚠️  ${this.warnings.length} warning(s):`, 'warning');
      this.warnings.forEach(warning => this.log(`  • ${warning}`, 'warning'));
    }

    console.log('\n💡 Recommendations:');
    if (this.issues.some(issue => issue.includes('node_modules'))) {
      console.log('  • Run: npm run install-deps');
    }
    if (this.warnings.some(warning => warning.includes('Port'))) {
      console.log('  • Run: npm run clean-start (will clear ports automatically)');
    }
    if (this.issues.length > 0) {
      console.log('  • Fix the issues above before starting the application');
    } else {
      console.log('  • You can start the application with: npm run clean-start');
    }

    return this.issues.length === 0;
  }
}

if (require.main === module) {
  const checker = new HealthChecker();
  checker.run().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = HealthChecker;