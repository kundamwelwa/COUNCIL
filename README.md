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

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/kundamwelwa/Project1.git
cd Project1
```
---

### 2️⃣ Backend Setup
```
cd backend
npm install
cp .env.example .env   # configure DB credentials
npm run migrate        # run migrations for PostgreSQL
npm run dev            # start backend API
```
---
### 3️⃣ Frontend Setup
```
cd frontend
npm install
npm start
```
---
4️⃣ Database (PostgreSQL)
```sql
CREATE DATABASE beneficiaries_db;
