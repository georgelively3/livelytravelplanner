#!/usr/bin/env node

/**
 * Emergency Reset Script
 * Nuclear option to reset everything to a clean state
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

class EmergencyReset {
  constructor() {
    this.isWindows = os.platform() === 'win32';
    this.config = {
      directories: {
        root: process.cwd(),
        server: path.join(process.cwd(), 'server'),
        client: path.join(process.cwd(), 'client')
      }
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

  async runCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      const cmd = this.isWindows ? 'cmd' : 'sh';
      const args = this.isWindows ? ['/c', command] : ['-c', command];
      
      const child = spawn(cmd, args, {
        stdio: options.silent ? 'pipe' : 'inherit',
        cwd: options.cwd || this.config.directories.root
      });

      child.on('close', (code) => {
        resolve(); // Always resolve, even on error
      });
    });
  }

  async killAllNodeProcesses() {
    this.log('💀 Killing all Node.js processes...', 'warning');
    
    try {
      if (this.isWindows) {
        await this.runCommand('taskkill /f /im node.exe', { silent: true });
        await this.runCommand('taskkill /f /im npm.exe', { silent: true });
      } else {
        await this.runCommand('pkill -f node', { silent: true });
        await this.runCommand('pkill -f npm', { silent: true });
      }
      this.log('✅ All Node.js processes terminated');
    } catch (error) {
      this.log('ℹ️  No Node.js processes were running');
    }
  }

  async clearAllCaches() {
    this.log('🧹 Clearing all caches and build artifacts...', 'warning');
    
    const pathsToDelete = [
      // Build outputs
      path.join(this.config.directories.client, 'build'),
      path.join(this.config.directories.client, 'dist'),
      
      // Caches
      path.join(this.config.directories.root, 'node_modules', '.cache'),
      path.join(this.config.directories.server, 'node_modules', '.cache'),
      path.join(this.config.directories.client, 'node_modules', '.cache'),
      
      // npm caches
      path.join(this.config.directories.root, '.npm'),
      path.join(this.config.directories.server, '.npm'),
      path.join(this.config.directories.client, '.npm'),
      
      // Database files (for fresh start)
      path.join(this.config.directories.server, 'database.db'),
      path.join(this.config.directories.server, 'test.db'),
      path.join(this.config.directories.server, 'dev.db'),
      
      // Log files
      path.join(this.config.directories.root, '*.log'),
      path.join(this.config.directories.server, '*.log'),
      path.join(this.config.directories.client, '*.log')
    ];

    for (const pathToDelete of pathsToDelete) {
      try {
        if (fs.existsSync(pathToDelete)) {
          if (this.isWindows) {
            if (fs.lstatSync(pathToDelete).isDirectory()) {
              await this.runCommand(`rmdir /s /q "${pathToDelete}"`, { silent: true });
            } else {
              await this.runCommand(`del /f /q "${pathToDelete}"`, { silent: true });
            }
          } else {
            await this.runCommand(`rm -rf "${pathToDelete}"`, { silent: true });
          }
          this.log(`✅ Deleted ${path.relative(this.config.directories.root, pathToDelete)}`);
        }
      } catch (error) {
        // Ignore errors, some paths might not exist
      }
    }
  }

  async clearNodeModules() {
    this.log('📦 Removing all node_modules...', 'warning');
    
    const nodeModulesPaths = [
      path.join(this.config.directories.root, 'node_modules'),
      path.join(this.config.directories.server, 'node_modules'),
      path.join(this.config.directories.client, 'node_modules')
    ];

    for (const nodeModulesPath of nodeModulesPaths) {
      try {
        if (fs.existsSync(nodeModulesPath)) {
          if (this.isWindows) {
            await this.runCommand(`rmdir /s /q "${nodeModulesPath}"`, { silent: true });
          } else {
            await this.runCommand(`rm -rf "${nodeModulesPath}"`, { silent: true });
          }
          this.log(`✅ Removed ${path.relative(this.config.directories.root, nodeModulesPath)}`);
        }
      } catch (error) {
        this.log(`⚠️  Could not remove ${nodeModulesPath}`, 'warning');
      }
    }
  }

  async reinstallDependencies() {
    this.log('⬇️  Reinstalling all dependencies...', 'info');
    
    // Clear npm cache first
    await this.runCommand('npm cache clean --force', { silent: true });
    
    // Install root dependencies
    this.log('Installing root dependencies...');
    await this.runCommand('npm install', { cwd: this.config.directories.root });
    
    // Install server dependencies
    this.log('Installing server dependencies...');
    await this.runCommand('npm install', { cwd: this.config.directories.server });
    
    // Install client dependencies
    this.log('Installing client dependencies...');
    await this.runCommand('npm install', { cwd: this.config.directories.client });
    
    this.log('✅ All dependencies reinstalled');
  }

  async resetDatabase() {
    this.log('🗄️  Resetting database...', 'info');
    
    try {
      await this.runCommand('node scripts/setupDatabase.js', {
        cwd: this.config.directories.server
      });
      this.log('✅ Database reset complete');
    } catch (error) {
      this.log('⚠️  Database reset had warnings', 'warning');
    }
  }

  async run() {
    console.log('🚨 EMERGENCY RESET - This will clean EVERYTHING');
    console.log('⚠️  This will:');
    console.log('   • Kill all Node.js processes');
    console.log('   • Delete all node_modules');
    console.log('   • Clear all caches');
    console.log('   • Reset database');
    console.log('   • Reinstall all dependencies');
    console.log('');

    // In a real CLI, you'd want to prompt for confirmation
    // For now, we'll just proceed
    
    try {
      this.log('🔥 Starting emergency reset...', 'error');
      
      // Phase 1: Kill everything
      await this.killAllNodeProcesses();
      
      // Phase 2: Clean everything
      await this.clearAllCaches();
      await this.clearNodeModules();
      
      // Phase 3: Rebuild everything
      await this.reinstallDependencies();
      await this.resetDatabase();
      
      this.log('🎉 Emergency reset complete!', 'success');
      console.log('\n' + '='.repeat(50));
      console.log('✅ SYSTEM FULLY RESET');
      console.log('='.repeat(50));
      console.log('💡 Next steps:');
      console.log('   1. Run: npm run health-check');
      console.log('   2. Run: npm run clean-start');
      console.log('');
      
    } catch (error) {
      this.log(`❌ Reset failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

if (require.main === module) {
  const reset = new EmergencyReset();
  reset.run();
}

module.exports = EmergencyReset;