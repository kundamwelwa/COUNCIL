const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Council Beneficiaries Management System...\n');

// Check if Node.js is installed
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js version: ${nodeVersion}`);
} catch (error) {
  console.error('❌ Node.js is not installed. Please install Node.js first.');
  process.exit(1);
}

// Check if PostgreSQL is installed
try {
  const pgVersion = execSync('psql --version', { encoding: 'utf8' }).trim();
  console.log(`✅ PostgreSQL version: ${pgVersion}`);
} catch (error) {
  console.error('❌ PostgreSQL is not installed. Please install PostgreSQL first.');
  process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  const envContent = `# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beneficiaries_db
DB_USER=postgres
DB_PASSWORD=Kellycoding%40100%23100

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Admin User (for initial setup)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@council.gov.zm
ADMIN_PASSWORD=Admin123!

# Email Configuration (for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
} else {
  console.log('✅ .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');

// Install root dependencies
console.log('Installing root dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Install backend dependencies
console.log('Installing backend dependencies...');
execSync('cd backend && npm install', { stdio: 'inherit' });

// Install frontend dependencies
console.log('Installing frontend dependencies...');
execSync('cd frontend && npm install', { stdio: 'inherit' });

console.log('✅ All dependencies installed');

// Create database
console.log('\n🗄️  Setting up database...');
try {
  // Create database
  execSync('createdb beneficiaries_db', { stdio: 'inherit' });
  console.log('✅ Database created');
} catch (error) {
  console.log('ℹ️  Database might already exist');
}

// Run migrations
console.log('Running database migrations...');
try {
  execSync('cd backend && npm run migrate:complete', { stdio: 'inherit' });
  console.log('✅ Database migrations completed');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.log('Please run: cd backend && npm run migrate:complete');
}

// Create startup scripts
console.log('\n📝 Creating startup scripts...');

// Create start script for Windows
const startScript = `@echo off
echo Starting Council Beneficiaries Management System...
echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak > nul
echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
`;

fs.writeFileSync(path.join(__dirname, 'start.bat'), startScript);

// Create start script for Unix/Linux/Mac
const startScriptUnix = `#!/bin/bash
echo "Starting Council Beneficiaries Management System..."
echo ""
echo "Starting Backend Server..."
cd backend && npm run dev &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"
echo ""
echo "Starting Frontend Server..."
cd ../frontend && npm start &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
wait
`;

fs.writeFileSync(path.join(__dirname, 'start.sh'), startScriptUnix);
execSync('chmod +x start.sh', { stdio: 'inherit' });

console.log('✅ Startup scripts created');

// Create README
console.log('\n📚 Creating comprehensive README...');
const readmeContent = `# Council Beneficiaries Management System

A comprehensive web application for managing council beneficiaries, programs, groups, and financial support with role-based authentication and professional UI.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Git

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd council-beneficiaries-system
   \`\`\`

2. **Run the setup script**
   \`\`\`bash
   node setup_complete.js
   \`\`\`

3. **Start the application**
   - **Windows**: Double-click \`start.bat\`
   - **Unix/Linux/Mac**: Run \`./start.sh\`

### Manual Setup

1. **Install dependencies**
   \`\`\`bash
   npm run setup
   \`\`\`

2. **Set up database**
   \`\`\`bash
   # Create database
   createdb beneficiaries_db
   
   # Run migrations
   cd backend && npm run migrate:complete
   \`\`\`

3. **Start servers**
   \`\`\`bash
   # Backend (Terminal 1)
   cd backend && npm run dev
   
   # Frontend (Terminal 2)
   cd frontend && npm start
   \`\`\`

## 🔐 Default Login Credentials

- **Username**: admin
- **Password**: Admin123!
- **Role**: SuperAdmin

## 📊 Features

### Authentication & Authorization
- ✅ User registration with email verification
- ✅ Secure login with JWT tokens
- ✅ Password reset functionality
- ✅ Role-based access control
- ✅ Session management
- ✅ Profile management

### User Roles
- **SuperAdmin**: Full system access
- **Admin**: Manage programs, loans, beneficiaries, groups
- **DataEntry**: Manage beneficiaries and groups
- **Auditor**: View-only access to dashboard and reports

### Core Features
- ✅ Dashboard with comprehensive analytics
- ✅ Beneficiary management (CRUD)
- ✅ Program management (CRUD)
- ✅ Group/Cooperative management (CRUD)
- ✅ Loan/Grant management (CRUD)
- ✅ Financial tracking and reporting
- ✅ Audit logging
- ✅ Responsive design for all devices

### Dashboard Analytics
- 📈 Real-time statistics
- 📊 Interactive charts and graphs
- 🗺️ Geographic distribution
- 💰 Financial summaries
- 📋 Program performance metrics
- 🔔 Recent activities feed

## 🛠️ Technology Stack

### Frontend
- React 18
- Tailwind CSS
- Recharts (Data Visualization)
- Lucide React (Icons)
- React Router DOM
- Axios (HTTP Client)

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Bcryptjs (Password Hashing)
- Helmet (Security)
- CORS
- Rate Limiting

### Database
- PostgreSQL with comprehensive schema
- Row-level security
- Triggers and functions
- Views for optimized queries
- Audit logging

## 📁 Project Structure

\`\`\`
council-beneficiaries-system/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth_complete.js
│   │   ├── dashboard_complete.js
│   │   ├── persons.js
│   │   ├── programs.js
│   │   ├── groups.js
│   │   └── loans.js
│   ├── scripts/
│   │   └── complete_migrate.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── beneficiaries/
│   │   │   ├── programs/
│   │   │   ├── groups/
│   │   │   ├── loans/
│   │   │   ├── reports/
│   │   │   └── layout/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── database_schema_complete.sql
├── setup_complete.js
├── start.bat
├── start.sh
└── README.md
\`\`\`

## 🔧 Configuration

### Environment Variables

Create a \`.env\` file in the \`backend\` directory:

\`\`\`env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beneficiaries_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Admin User
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@council.gov.zm
ADMIN_PASSWORD=Admin123!
\`\`\`

## 📊 Database Schema

The system uses a comprehensive PostgreSQL schema with:

- **Users**: Authentication and authorization
- **Persons**: Beneficiary information
- **Programs**: Government programs and initiatives
- **Groups**: Cooperatives and community groups
- **Grants/Loans**: Financial support tracking
- **Audit Logs**: System activity tracking
- **Sessions**: JWT token management
- **Notifications**: User alerts and messages

## 🚀 Deployment

### Production Setup

1. **Environment Configuration**
   - Update \`.env\` with production values
   - Set secure JWT secret
   - Configure production database

2. **Database Setup**
   \`\`\`bash
   createdb beneficiaries_db_prod
   cd backend && npm run migrate:complete
   \`\`\`

3. **Build Frontend**
   \`\`\`bash
   cd frontend && npm run build
   \`\`\`

4. **Start Production Server**
   \`\`\`bash
   cd backend && npm start
   \`\`\`

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection
- Role-based access control

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop computers

## 🎨 UI/UX Features

- Professional Zambian-themed design
- Zambian coat of arms integration
- Intuitive navigation
- Interactive charts and graphs
- Real-time data updates
- Loading states and error handling
- Accessibility features

## 📈 Reporting

- Comprehensive dashboard analytics
- Export functionality
- Custom date ranges
- Program performance metrics
- Financial summaries
- Geographic distribution reports

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

- **v1.0.0**: Initial release with complete functionality
- Role-based authentication
- Comprehensive dashboard
- Full CRUD operations
- Responsive design
- Zambian national identity integration

---

**Council Beneficiaries Management System** - Empowering communities through technology 🇿🇲
`;

fs.writeFileSync(path.join(__dirname, 'README.md'), readmeContent);
console.log('✅ README created');

// Update package.json scripts
console.log('\n📝 Updating package.json scripts...');
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

packageJson.scripts = {
  ...packageJson.scripts,
  'migrate:complete': 'cd backend && node scripts/complete_migrate.js',
  'start:backend': 'cd backend && npm run dev',
  'start:frontend': 'cd frontend && npm start',
  'build:frontend': 'cd frontend && npm run build',
  'test': 'cd backend && npm test && cd ../frontend && npm test'
};

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json updated');

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Start the application:');
console.log('   - Windows: Double-click start.bat');
console.log('   - Unix/Linux/Mac: Run ./start.sh');
console.log('2. Open your browser and go to: http://localhost:3000');
console.log('3. Login with: admin / Admin123!');
console.log('\n🔗 URLs:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend API: http://localhost:5000');
console.log('   API Health: http://localhost:5000/api/health');
console.log('\n📚 Documentation: Check README.md for detailed information');
console.log('\n🇿🇲 Council Beneficiaries Management System is ready!');
