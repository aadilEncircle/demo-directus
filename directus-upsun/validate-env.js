#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Run this before deploying to ensure all required variables are set
 */

import { readFileSync } from 'fs';

// Required Directus environment variables
const REQUIRED_VARS = [
  'DB_CLIENT',
  'DB_HOST',
  'DB_PORT',
  'DB_DATABASE',
  'DB_USER',
  'DB_PASSWORD',
];

// Optional but recommended variables
const RECOMMENDED_VARS = [
  'DIRECTUS_SECRET',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD',
  'DIRECTUS_PORT',
  'PUBLIC_URL',
  'CACHE_ENABLED',
  'CACHE_STORE',
  'REDIS',
  'CORS_ENABLED',
  'CORS_ORIGIN',
];

// Elasticsearch configuration (if using the extension)
const ELASTICSEARCH_VARS = [
  'ELASTICSEARCH_NODE',
  'ELASTICSEARCH_INDEX',
];

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateEnv() {
  console.log('\n🔍 Directus Environment Validation\n');
  console.log('='.repeat(50) + '\n');

  let errors = [];
  let warnings = [];

  // Check required variables
  console.log('📋 Checking Required Variables...\n');
  for (const envVar of REQUIRED_VARS) {
    const value = process.env[envVar];
    if (!value) {
      errors.push(`❌ ${envVar} - Required but not set`);
      console.log(`  ${colors.red}✗${colors.reset} ${envVar}: Not set (REQUIRED)`);
    } else {
      console.log(`  ${colors.green}✓${colors.reset} ${envVar}: Set`);
    }
  }

  console.log('\n');

  // Check recommended variables
  console.log('📋 Checking Recommended Variables...\n');
  for (const envVar of RECOMMENDED_VARS) {
    const value = process.env[envVar];
    if (!value) {
      warnings.push(`⚠️  ${envVar} - Recommended but not set`);
      console.log(`  ${colors.yellow}!${colors.reset} ${envVar}: Not set (Recommended)`);
    } else {
      console.log(`  ${colors.green}✓${colors.reset} ${envVar}: Set`);
    }
  }

  console.log('\n');

  // Check Elasticsearch variables
  console.log('📋 Checking Elasticsearch Variables...\n');
  const esNode = process.env.ELASTICSEARCH_NODE;
  if (esNode) {
    console.log(`  ${colors.green}✓${colors.reset} Elasticsearch integration: Enabled`);
    console.log(`     Node: ${esNode}`);
    
    const esIndex = process.env.ELASTICSEARCH_INDEX || 'directus_items';
    console.log(`     Index: ${esIndex}`);
  } else {
    console.log(`  ${colors.yellow}!${colors.reset} Elasticsearch integration: Not configured`);
    console.log(`     (Set ELASTICSEARCH_NODE to enable)`);
  }

  console.log('\n' + '='.repeat(50));

  // Summary
  console.log('\n📊 Validation Summary\n');

  if (errors.length > 0) {
    log(`❌ Found ${errors.length} critical error(s):\n`, 'red');
    errors.forEach(err => console.log(`  ${err}`));
    console.log('\n🚫 Deployment BLOCKED - Missing required environment variables\n');
    process.exit(1);
  }

  if (warnings.length > 0) {
    log(`⚠️  Found ${warnings.length} warning(s):\n`, 'yellow');
    warnings.forEach(warn => console.log(`  ${warn}`));
    console.log('\n✅ Deployment can proceed with warnings\n');
  } else {
    log('✅ All required environment variables are set!\n', 'green');
  }

  // Display useful information
  console.log('💡 Useful Commands:\n');
  console.log('  Start Directus:    npm run start');
  console.log('  Bootstrap DB:      npm run bootstrap');
  console.log('  Validate Env:      node validate-env.js');
  console.log('  Deploy to Upsun:   upsun push\n');
}

// Run validation
try {
  validateEnv();
} catch (error) {
  console.error('Validation error:', error.message);
  process.exit(1);
}
