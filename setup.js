#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏛️ Council Beneficiaries Management System Setup');
console.log('================================================\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if npm is installed
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
  console.error('❌ npm is not installed. Please install npm first.');
  process.exit(1);
}

console.log('\n📦 Installing dependencies...\n');

// Install root dependencies
console.log('Installing root dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Root dependencies installed');
} catch (error) {
  console.error('❌ Failed to install root dependencies');
  process.exit(1);
}

// Install backend dependencies
console.log('\nInstalling backend dependencies...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Backend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('\nInstalling frontend dependencies...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Frontend dependencies installed');
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Check if .env file exists in backend
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n📝 Creating environment file...');
  try {
    const envExample = fs.readFileSync(path.join(__dirname, 'backend', 'env.example'), 'utf8');
    fs.writeFileSync(envPath, envExample);
    console.log('✅ Environment file created at backend/.env');
    console.log('⚠️  Please edit backend/.env with your database credentials');
  } catch (error) {
    console.error('❌ Failed to create environment file');
  }
} else {
  console.log('✅ Environment file already exists');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Set up PostgreSQL database:');
console.log('   CREATE DATABASE beneficiaries_db;');
console.log('\n2. Edit backend/.env with your database credentials');
console.log('\n3. Run database migrations:');
console.log('   cd backend && npm run migrate');
console.log('\n4. Start the application:');
console.log('   npm run dev');
console.log('\n5. Access the system:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend: http://localhost:5000');
console.log('   Default login: admin / admin123');
console.log('\n🚀 Happy coding!');
