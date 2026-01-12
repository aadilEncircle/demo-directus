import { readFileSync } from 'fs';

console.log('🔍 Testing Environment Variables\n');

try {
  // Read and parse .env file
  const envContent = readFileSync('.env', 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  console.log('📋 Parsed Environment Variables:\n');
  
  const required = ['DB_CLIENT', 'DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD'];
  const recommended = ['DIRECTUS_SECRET', 'ADMIN_EMAIL', 'ADMIN_PASSWORD', 'DIRECTUS_PORT', 'PUBLIC_URL'];
  
  let allGood = true;
  
  required.forEach(key => {
    const value = envVars[key];
    if (value) {
      console.log(`  ✅ ${key}: ${value}`);
    } else {
      console.log(`  ❌ ${key}: Missing`);
      allGood = false;
    }
  });
  
  console.log('\n');
  
  recommended.forEach(key => {
    const value = envVars[key];
    if (value) {
      console.log(`  ✅ ${key}: ${value}`);
    } else {
      console.log(`  ⚠️  ${key}: Missing`);
    }
  });
  
  console.log('\n');
  
  if (allGood) {
    console.log('🎉 All required environment variables are configured!');
    console.log('   Your .env file is ready for deployment.\n');
  } else {
    console.log('❌ Some required environment variables are missing.\n');
  }
  
} catch (error) {
  console.error('Error:', error.message);
}
