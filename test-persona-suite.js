#!/usr/bin/env node

/**
 * Comprehensive test runner for the new Persona functionality
 * This script runs all persona-related tests and provides a summary
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running Comprehensive Persona Test Suite\n');

// Test configurations
const testConfigs = [
  {
    name: 'UserPersona Model Tests',
    command: 'npm',
    args: ['test', 'tests/models/UserPersona.test.js'],
    cwd: path.join(__dirname, 'server')
  },
  {
    name: 'Personas API Route Tests',
    command: 'npm',
    args: ['test', 'tests/routes/personas.test.js'],
    cwd: path.join(__dirname, 'server')
  },
  {
    name: 'Personas Integration Tests',
    command: 'npm',
    args: ['test', 'tests/integration/personas.integration.test.js'],
    cwd: path.join(__dirname, 'server')
  },
  {
    name: 'PersonaBuilder Component Tests',
    command: 'npm',
    args: ['test', 'src/tests/components/PersonaBuilder.test.js'],
    cwd: path.join(__dirname, 'client')
  },
  {
    name: 'ConnectionTest Component Tests',
    command: 'npm',
    args: ['test', 'src/tests/components/ConnectionTest.test.js'],
    cwd: path.join(__dirname, 'client')
  }
];

// Results tracking
const results = [];

async function runTest(config) {
  return new Promise((resolve) => {
    console.log(`🔄 Running: ${config.name}`);
    
    const startTime = Date.now();
    const process = spawn(config.command, config.args, {
      cwd: config.cwd,
      stdio: 'pipe',
      shell: true
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      const duration = Date.now() - startTime;
      const result = {
        name: config.name,
        success: code === 0,
        duration,
        stdout,
        stderr
      };

      if (code === 0) {
        console.log(`✅ ${config.name} - PASSED (${duration}ms)`);
      } else {
        console.log(`❌ ${config.name} - FAILED (${duration}ms)`);
        if (stderr) {
          console.log(`   Error: ${stderr.substring(0, 200)}...`);
        }
      }

      results.push(result);
      resolve(result);
    });
  });
}

async function runAllTests() {
  console.log('Starting test execution...\n');

  // Run all tests
  for (const config of testConfigs) {
    await runTest(config);
  }

  // Generate summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total Duration: ${totalDuration}ms`);
  console.log('');

  // Detailed results
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name} (${result.duration}ms)`);
    
    if (!result.success && result.stderr) {
      console.log(`   Error: ${result.stderr.split('\n')[0]}`);
    }
  });

  console.log('\n' + '='.repeat(80));

  if (failed === 0) {
    console.log('🎉 ALL PERSONA TESTS PASSED!');
    console.log('✅ The AI-ready persona system is working correctly');
    console.log('✅ Ready for Phase 2: AI service integration');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.');
  }

  console.log('='.repeat(80));

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n⚠️  Test execution interrupted by user');
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error during test execution:', error);
  process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
  console.error('❌ Failed to run test suite:', error);
  process.exit(1);
});