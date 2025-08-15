#!/usr/bin/env node

/**
 * Hot Reload Testing Script
 * 
 * This script demonstrates hot-reload functionality across different OS environments
 * by making small changes to React components and verifying that the browser
 * auto-refreshes inside Docker containers.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Component files to test hot reload
const testFiles = [
  {
    path: 'components/KpiCard.tsx',
    description: 'KPI Card Component'
  },
  {
    path: 'components/DashboardPage.tsx',
    description: 'Dashboard Page Component'
  },
  {
    path: 'App.tsx',
    description: 'Main App Component'
  }
];

function updateComponent(filePath, testNumber) {
  try {
    const fullPath = path.resolve(filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Update timestamp in hot reload indicators
    const timestamp = new Date().toISOString();
    
    if (filePath.includes('KpiCard.tsx')) {
      content = content.replace(
        /\/\/ HOT RELOAD TEST:.*/,
        `// HOT RELOAD TEST: Updated at ${timestamp} - Test #${testNumber}`
      );
    } else if (filePath.includes('DashboardPage.tsx')) {
      content = content.replace(
        /🔥 Hot Reload Active - Test #\d+/,
        `🔥 Hot Reload Active - Test #${testNumber} (${new Date().toLocaleTimeString()})`
      );
    } else if (filePath.includes('App.tsx')) {
      content = content.replace(
        /⚡ Main App - Hot Reload Test .*/,
        `⚡ Main App - Hot Reload Test ${new Date().toLocaleTimeString()} #${testNumber}`
      );
    }
    
    fs.writeFileSync(fullPath, content);
    log('green', `✓ Updated ${filePath} with test #${testNumber}`);
    return true;
  } catch (error) {
    log('red', `✗ Failed to update ${filePath}: ${error.message}`);
    return false;
  }
}

function runHotReloadTest() {
  log('cyan', '🔥 Starting Hot Reload Test for Cross-Platform Docker Containers');
  log('yellow', '━'.repeat(60));
  
  log('blue', '\n📝 Test Configuration:');
  log('bright', '   • Vite dev server with polling enabled');
  log('bright', '   • Docker containers with shared volumes');
  log('bright', '   • Cross-platform compatibility (Linux/macOS/Windows)');
  
  log('blue', '\n🎯 Components being tested:');
  testFiles.forEach((file, index) => {
    log('bright', `   ${index + 1}. ${file.description} (${file.path})`);
  });
  
  log('yellow', '\n⚠️  Instructions:');
  log('bright', '1. Start Docker containers: npm run dev:compose');
  log('bright', '2. Open browser to http://localhost:5173');
  log('bright', '3. Watch for automatic refreshes after each component update');
  log('bright', '4. Verify hot reload works on your OS (Linux/macOS/Windows)');
  
  let testNumber = Math.floor(Math.random() * 1000);
  
  log('green', '\n🚀 Starting component updates...\n');
  
  // Update each component with a delay
  testFiles.forEach((file, index) => {
    setTimeout(() => {
      log('magenta', `📝 Updating ${file.description}...`);
      updateComponent(file.path, testNumber + index);
      
      if (index === testFiles.length - 1) {
        log('green', '\n✅ Hot reload test complete!');
        log('yellow', '\nNext steps:');
        log('bright', '• Check your browser - all components should have updated automatically');
        log('bright', '• Look for the updated test indicators in the UI');
        log('bright', '• Verify timestamps/numbers have changed');
        log('bright', '• Test on different OS environments if available');
        
        log('cyan', '\n🔄 To run another test: node test-hot-reload.js');
      }
    }, index * 2000); // 2 second delay between updates
  });
}

// Always run the test when script is executed
runHotReloadTest();

export { runHotReloadTest, updateComponent };
