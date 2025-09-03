# 🏛️ Internal Beneficiaries Management System

An **internal web application** designed to manage and verify beneficiaries across various government/community programs such as **Bursaries, SMEs, Social Welfare, FISP, Cooperatives, and Clubs**.  
The system helps ensure that individuals cannot register multiple times under different groups by maintaining a **centralized database** and providing **admin dashboards** for oversight.

---

## 🚀 Features

- 🔑 **Authentication & Roles**
  - SuperAdmin, Admin, Data Entry Officer, Auditor (read-only)
  - Secure login with hashed passwords
- 👥 **Beneficiaries Management**
  - Register persons with national ID
  - Track membership in programs and groups
- 🏢 **Programs & Groups**
  - Manage programs (Bursaries, SMEs, Social Welfare, etc.)
  - Manage cooperatives, clubs, cash4work groups
- 💰 **Financial Support Tracking**
  - Record grants and loans issued to groups
  - Track repayment status (Pending, Repaid, Defaulted)
- 📊 **Dashboard & Reports**
  - Overview cards: Total Persons, Programs, Groups, Loans
  - Charts: Beneficiaries per program, Loans status, Gender distribution
  - Export to CSV/Excel/PDF
- 📝 **Audit Logging**
  - Track all admin actions for accountability

---

## 🛠️ Tech Stack

**Frontend**
- React (UI)
- Tailwind CSS (styling)
- Recharts (data visualization)

**Backend**
- Node.js with Express *(or Django/FastAPI if Python is preferred)*
- REST API with JWT authentication

**Database**
- PostgreSQL (with full schema for programs, persons, groups, loans, audit logs)

**Deployment**
- Docker (containerized)
- Internal network / VPN access (restricted system)

---

## 🗄️ Database Schema (PostgreSQL)

Main tables:
- `users` – Admin users & roles
- `persons` – Beneficiaries
- `programs` – Programs (Bursaries, SMEs, etc.)
- `groups` – Sub-groups (Clubs, Cooperatives, Cash4Work)
- `person_programs` – Person-to-program mapping
- `person_groups` – Person-to-group mapping
- `grants_loans` – Financial support tracking
- `audit_logs` – Security & admin activity tracking

[See full schema here](./database_schema.sql)

---

# 🏛️ Council Beneficiaries Management System - Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all
```

### 2. Database Setup

1. **Create PostgreSQL Database:**
```sql
CREATE DATABASE beneficiaries_db;
```

2. **Configure Environment Variables:**
```bash
# Copy the example environment file
cp backend/env.example backend/.env

# Edit backend/.env with your database credentials:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beneficiaries_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_super_secret_jwt_key_here
```

3. **Run Database Migrations:**
```bash
cd backend
npm run migrate
```

### 3. Start the Application

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
# Backend (port 5000)
npm run server

# Frontend (port 3000)
npm run client
```

### 4. Access the System

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/api/health

## 🔑 Default Login Credentials

- **Username:** admin
- **Password:** admin123
- **Role:** SuperAdmin

## 📊 Features Implemented

### ✅ Dashboard
- Overview statistics cards
- Beneficiaries by program chart
- Loan status distribution
- Monthly trends visualization
- Recent activities feed
- Quick action buttons

### ✅ API Endpoints
- `/api/dashboard/*` - Dashboard data
- `/api/persons/*` - Beneficiary management
- `/api/programs/*` - Program management
- `/api/groups/*` - Group/cooperative management
- `/api/loans/*` - Loan/grant management
- `/api/auth/*` - Authentication

### ✅ Database Schema
- Complete PostgreSQL schema with all tables
- Proper relationships and constraints
- Audit logging for all actions
- Indexes for performance

## 🎨 Design Features

- **Zambian Flag Colors:** Professional color scheme using green, red, black, and orange
- **Responsive Design:** Works on desktop, tablet, and mobile
- **Modern UI:** Clean, professional interface with Tailwind CSS
- **Interactive Charts:** Real-time data visualization with Recharts
- **Loading States:** Smooth user experience with loading indicators

## 🔧 Development

### Project Structure
```
council-beneficiaries-system/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   └── App.js          # Main app component
│   └── package.json
├── backend/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── config/             # Database config
│   ├── scripts/            # Migration scripts
│   └── package.json
├── database_schema.sql     # Database schema
└── package.json           # Root package.json
```

### Available Scripts
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run install-all  # Install all dependencies
```

## 🛡️ Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- SQL injection protection

## 📝 Next Steps

1. **Authentication System:** Implement login/registration forms
2. **CRUD Operations:** Add forms for managing beneficiaries, programs, groups
3. **Reporting:** Export functionality for CSV/Excel/PDF
4. **User Management:** Role-based access control
5. **Notifications:** Real-time updates and alerts

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **Port Already in Use:**
   - Change ports in `.env` file
   - Kill existing processes on ports 3000/5000

3. **Dependencies Issues:**
   - Delete `node_modules` and run `npm install` again
   - Use `npm run install-all` for fresh install

### Support
For issues or questions, check the console logs for detailed error messages.

