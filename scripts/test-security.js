#!/usr/bin/env node

/**
 * Security Test Suite - Command Line
 * Run: node scripts/test-security.js
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:5050';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, message, details = '') {
  testResults.total++;
  if (passed) testResults.passed++;
  else testResults.failed++;
  
  testResults.tests.push({ name, passed, message, details });
  
  const icon = passed ? '✓' : '✗';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}: ${message}`, color);
  if (details) log(`  ${details}`, 'cyan');
}

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, data });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testServerRunning() {
  log('\n🔍 Test 1: Server Status', 'bold');
  try {
    const res = await makeRequest('/api/debug');
    if (res.status === 200) {
      logTest('Server Running', true, 'Server is bereikbaar', `Port: ${new URL(API_BASE).port}`);
      return true;
    } else {
      logTest('Server Running', false, `Unexpected status: ${res.status}`);
      return false;
    }
  } catch (err) {
    logTest('Server Running', false, 'Server niet bereikbaar', err.message);
    return false;
  }
}

async function testRateLimiting() {
  log('\n🚦 Test 2: Rate Limiting', 'bold');
  try {
    const res = await makeRequest('/api/debug');
    
    const hasRateLimitHeaders = 
      res.headers['x-ratelimit-limit'] || 
      res.headers['ratelimit-limit'];
    
    if (hasRateLimitHeaders) {
      const limit = res.headers['x-ratelimit-limit'] || res.headers['ratelimit-limit'];
      const remaining = res.headers['x-ratelimit-remaining'] || res.headers['ratelimit-remaining'];
      logTest('Rate Limiting', true, 'Rate limit headers aanwezig', 
        `Limit: ${limit}, Remaining: ${remaining}`);
    } else {
      logTest('Rate Limiting', false, 'Rate limit headers niet gevonden',
        `Headers: ${Object.keys(res.headers).join(', ')}`);
    }
  } catch (err) {
    logTest('Rate Limiting', false, 'Test gefaald', err.message);
  }
}

async function testSecurityHeaders() {
  log('\n🛡️  Test 3: Security Headers', 'bold');
  try {
    const res = await makeRequest('/api/debug');
    
    const securityHeaders = {
      'X-Content-Type-Options': res.headers['x-content-type-options'],
      'X-Frame-Options': res.headers['x-frame-options'],
      'X-XSS-Protection': res.headers['x-xss-protection'],
      'Strict-Transport-Security': res.headers['strict-transport-security']
    };
    
    const found = Object.values(securityHeaders).filter(v => v).length;
    const total = Object.keys(securityHeaders).length;
    
    if (found >= 3) {
      logTest('Security Headers', true, `${found}/${total} headers gevonden`,
        Object.entries(securityHeaders)
          .filter(([k,v]) => v)
          .map(([k,v]) => `${k}: ${v}`)
          .join('\n  '));
    } else {
      logTest('Security Headers', false, `Slechts ${found}/${total} headers gevonden`,
        `Missing: ${Object.entries(securityHeaders).filter(([k,v]) => !v).map(([k]) => k).join(', ')}`);
    }
  } catch (err) {
    logTest('Security Headers', false, 'Test gefaald', err.message);
  }
}

async function testHTTPS() {
  log('\n🔒 Test 4: HTTPS Configuration', 'bold');
  try {
    const res = await makeRequest('/api/debug');
    
    if (res.data && res.data.TC_BASE_URL) {
      const url = res.data.TC_BASE_URL;
      const isHttps = url.startsWith('https://');
      
      if (isHttps) {
        logTest('HTTPS Config', true, 'TC_BASE_URL gebruikt HTTPS', url);
      } else if (url.startsWith('http://')) {
        logTest('HTTPS Config', false, 'TC_BASE_URL gebruikt HTTP (onveilig!)', 
          `${url}\n  ⚠️  Wijzig naar HTTPS in server/.env`);
      } else {
        logTest('HTTPS Config', false, 'Onbekend protocol', url);
      }
    } else {
      logTest('HTTPS Config', false, 'TC_BASE_URL niet geconfigureerd',
        'Configureer TC_BASE_URL in server/.env');
    }
  } catch (err) {
    logTest('HTTPS Config', false, 'Test gefaald', err.message);
  }
}

async function testEnvFile() {
  log('\n🔑 Test 5: Environment File', 'bold');
  
  const envPath = path.join(__dirname, '..', 'server', '.env');
  const gitignorePath = path.join(__dirname, '..', '.gitignore');
  
  // Check if .env exists
  if (fs.existsSync(envPath)) {
    logTest('Env File Exists', true, 'server/.env gevonden');
    
    // Check if .env is in .gitignore
    if (fs.existsSync(gitignorePath)) {
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      if (gitignore.includes('server/.env') || gitignore.includes('.env')) {
        logTest('Env in Gitignore', true, 'server/.env staat in .gitignore');
      } else {
        logTest('Env in Gitignore', false, 'server/.env NIET in .gitignore!',
          '⚠️  Voeg "server/.env" toe aan .gitignore');
      }
    }
  } else {
    logTest('Env File Exists', false, 'server/.env niet gevonden',
      'Kopieer .env.example naar server/.env');
  }
}

async function testAuthEndpoint() {
  log('\n🔐 Test 6: Auth Endpoint', 'bold');
  try {
    const res = await makeRequest('/api/debug/auth');
    
    if (res.status === 200 && res.data) {
      const tokenPreview = res.data.tokenPreview || '';
      const hasFullToken = tokenPreview.length > 50;
      
      if (!hasFullToken) {
        logTest('Auth Endpoint', true, 'Auth endpoint veilig',
          `Token preview: ${tokenPreview || 'none'}\nExpires: ${res.data.expiresInSec}s`);
      } else {
        logTest('Auth Endpoint', false, 'Volledige token geëxposeerd!',
          'Auth endpoint toont te veel token informatie');
      }
    } else {
      logTest('Auth Endpoint', false, `Unexpected response: ${res.status}`);
    }
  } catch (err) {
    logTest('Auth Endpoint', false, 'Test gefaald', err.message);
  }
}

async function testDependencies() {
  log('\n📦 Test 7: Security Dependencies', 'bold');
  
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  if (fs.existsSync(packagePath)) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const deps = pkg.dependencies || {};
    
    const securityPackages = {
      'helmet': 'Security headers',
      'express-rate-limit': 'Rate limiting',
      'dotenv': 'Environment variables'
    };
    
    let allFound = true;
    const missing = [];
    
    for (const [pkg, desc] of Object.entries(securityPackages)) {
      if (deps[pkg]) {
        log(`  ✓ ${pkg} (${desc}): ${deps[pkg]}`, 'green');
      } else {
        log(`  ✗ ${pkg} (${desc}): MISSING`, 'red');
        allFound = false;
        missing.push(pkg);
      }
    }
    
    if (allFound) {
      logTest('Security Dependencies', true, 'Alle security packages geïnstalleerd');
    } else {
      logTest('Security Dependencies', false, 'Security packages ontbreken',
        `Missing: ${missing.join(', ')}\nRun: npm install`);
    }
  } else {
    logTest('Security Dependencies', false, 'package.json niet gevonden');
  }
}

function printSummary() {
  log('\n' + '='.repeat(60), 'bold');
  log('📊 TEST SAMENVATTING', 'bold');
  log('='.repeat(60), 'bold');
  
  const score = testResults.total > 0 
    ? Math.round((testResults.passed / testResults.total) * 10) 
    : 0;
  
  log(`\nTotaal tests: ${testResults.total}`, 'cyan');
  log(`Geslaagd: ${testResults.passed}`, 'green');
  log(`Gefaald: ${testResults.failed}`, 'red');
  log(`\nSecurity Score: ${score}/10`, score >= 8 ? 'green' : score >= 6 ? 'yellow' : 'red');
  
  if (testResults.failed > 0) {
    log('\n⚠️  GEFAALDE TESTS:', 'yellow');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        log(`  • ${t.name}: ${t.message}`, 'red');
        if (t.details) log(`    ${t.details}`, 'cyan');
      });
  }
  
  log('\n' + '='.repeat(60), 'bold');
  
  if (score >= 8) {
    log('✅ Beveiliging is goed!', 'green');
  } else if (score >= 6) {
    log('⚠️  Beveiliging kan beter. Check gefaalde tests.', 'yellow');
  } else {
    log('🚨 KRITIEKE BEVEILIGINGSPROBLEMEN! Los gefaalde tests op.', 'red');
  }
  
  log('\nVoor meer info: zie docs/SECURITY_SETUP.md\n', 'cyan');
}

async function runAllTests() {
  log('🔐 SECURITY TEST SUITE', 'bold');
  log(`Testing: ${API_BASE}\n`, 'cyan');
  
  const serverRunning = await testServerRunning();
  
  if (!serverRunning) {
    log('\n⚠️  Server is niet bereikbaar. Start server met: npm run dev', 'yellow');
    log('Sommige tests worden overgeslagen.\n', 'yellow');
  }
  
  if (serverRunning) {
    await testRateLimiting();
    await testSecurityHeaders();
    await testHTTPS();
    await testAuthEndpoint();
  }
  
  await testEnvFile();
  await testDependencies();
  
  printSummary();
  
  // Exit with error code if tests failed
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(err => {
  log(`\n❌ Fatal error: ${err.message}`, 'red');
  console.error(err);
  process.exit(1);
});
