# ⚓ Il Veliero — Full-Stack Restaurant Platform

Modern web platform for **"Il Veliero"** seafood restaurant, featuring an Express + TypeScript + Mongoose REST API backend and an Angular + GSAP frontend with dynamic animations.

---

## 🏗️ Architecture Overview

```
SitoVeliero/
├── backend/                  # Node.js + Express + TypeScript + Mongoose REST API
│   ├── src/
│   │   ├── config/           # Database & environment configurations
│   │   ├── models/           # Mongoose schemas (Menu, Pescato, Avvisi, Eventi, User, Blacklist, etc.)
│   │   ├── middleware/       # Upload (Multer), error handler, auth, RBAC, audit
│   │   ├── routes/           # REST endpoints (/api/v1/health, /api/v1/uploads, etc.)
│   │   ├── seed/             # Seeding engine with realistic Adriatic seafood menu & accounts
│   │   ├── app.ts            # Express application setup
│   │   └── server.ts         # Bootstrap server entry point
│   ├── tests/                # Jest + Supertest test suites with MongoMemoryServer
│   └── uploads/              # Local storage for uploaded dish/event images
├── frontend/                 # Modern Angular + GSAP dynamic client application (Milestone 4-5)
├── PROJECT.md                # Full system architecture, milestones & API contracts
└── TEST_INFRA.md             # E2E test infra design across 4 tiers
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB (optional — the backend includes an automatic `mongodb-memory-server` fallback for zero-setup execution)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment
Copy `.env.example` to `.env` in the `backend/` folder (defaults are already functional):
```bash
cd backend
cp .env.example .env
```

### 3. Seed Initial Database
Populates standard Adriatic seafood dishes, active notices, events, and default credentials:
- **Master Admin 1**: `bortolatofilippo05@gmail.com` / `AdminPass123!`
- **Master Admin 2**: `pizzadalcampione@gmail.com` / `AdminPass123!`
- **Gestore**: `gestore_veliero` (o `gestore@ilveliero.it`) / `GestorePass123!`
- **Client**: `cliente@ilveliero.it` / `ClientPass123!`

```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
- API Base URL: `http://localhost:5000/api/v1`
- Health Check: `http://localhost:5000/api/v1/health`
- Static Uploads: `http://localhost:5000/uploads`

### 5. Run Test Suite
```bash
npm test
```
Or for coverage:
```bash
npm run test:coverage
```
