/**
 * Il Veliero — E2E Test Suite Runner Script
 * 
 * Executes the full opaque-box E2E test suite (Tiers 1-4) via Jest and Supertest.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('⚓ ========================================================');
console.log('⚓ Il Veliero — Opaque-Box E2E Test Suite Runner');
console.log('⚓ Executing Tiers 1-4 End-to-End Test Verification');
console.log('⚓ ========================================================\n');

const backendDir = path.resolve(__dirname, '../../backend');
const jestArgs = [
  'test',
  '--',
  '--testPathPattern=tests/integration/e2e',
  '--runInBand',
  '--detectOpenHandles',
  '--forceExit'
];

const runner = spawn('npm', jestArgs, {
  cwd: backendDir,
  stdio: 'inherit',
  shell: true
});

runner.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ E2E Test Suite Execution Complete: 100% Passed');
  } else {
    console.error(`\n❌ E2E Test Suite failed with exit code ${code}`);
  }
  process.exit(code);
});
