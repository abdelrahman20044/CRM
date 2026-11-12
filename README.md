# CRM — Customer Relationship Management Platform

**Live Demo:** [crm-c7zo.vercel.app](https://crm-c7zo.vercel.app/)

A full-stack CRM application built as a monorepo with a **Node.js/Express REST API** and a **React/Vite** frontend. The backend is built from scratch; the frontend was generated using Gemini AI to provide a visual interface for the API.

---

## ✨ Features

- **Role-Based Access Control** — Owner, Admin, Manager, and Sales Rep roles with granular permissions
- **Contact Management** — Full CRUD with lead source tracking and status pipeline
- **Deal Pipeline** — Five-stage sales pipeline (Lead → Qualified → Proposal → Won / Lost)
- **Task Management** — Priority levels, status tracking, linked to contacts or deals
- **Activity Logging** — Track calls, emails, meetings, notes, and system events
- **Dashboard Analytics** — Revenue totals, deal counts, pipeline breakdown
- **Authentication** — JWT with httpOnly cookies, password reset flow via email
- **Input Validation** — Schema-based validation on every endpoint using Zod
- **API Features** — Filtering, sorting, field selection, and pagination
- **Automated Testing** — Integration and unit test suite with Jest & Supertest
- **Deployment** — Backend and frontend independently deployed on Vercel

---

## 🛠 Tech Stack

### Backend

| Category       | Technologies                                                             |
| -------------- | ------------------------------------------------------------------------ |
| **Runtime**    | Node.js, Express 4                                                       |
| **Database**   | MongoDB (Atlas), Mongoose 9                                              |
| **Auth**       | JWT, bcryptjs                                                            |
| **Validation** | Zod 4                                                                    |
| **Security**   | Helmet, express-rate-limit, xss-clean, express-mongo-sanitize, HPP, CORS |
| **Email**      | Nodemailer                                                               |
| **Testing**    | Jest 30, Supertest 7                                                     |
| **Deployment** | Vercel (Serverless), Docker, Docker Compose                              |

---

## 📁 Project Structure

```
CRM/
├── backend/                    # Express REST API
│   ├── server.js               # Entry point & DB connection
│   ├── vercel.json             # Vercel serverless config
│   ├── jest.config.js          # Test configuration
│   └── src/
│       ├── app.js              # Express app, middleware stack & routes
│       ├── config/             # Database connection (singleton pattern)
│       ├── controllers/        # Route handlers (8 controllers)
│       │   ├── authController.js
│       │   ├── contactController.js
│       │   ├── dealController.js
│       │   ├── taskController.js
│       │   ├── activityController.js
│       │   ├── userController.js
│       │   ├── dashboardController.js
│       │   └── errorController.js
│       ├── models/             # Mongoose schemas (6 models)
│       │   ├── User.js
│       │   ├── Company.js
│       │   ├── Contact.js
│       │   ├── Deal.js
│       │   ├── Task.js
│       │   └── Activity.js
│       ├── routes/             # API route definitions (7 routers)
│       ├── middlewares/
│       │   ├── auth.js         # JWT verification & role-based access
│       │   └── validate.js     # Reusable Zod validation middleware
│       ├── validators/         # Zod schemas per resource (6 validators)
│       └── utils/
│           ├── appError.js     # Custom error class
│           ├── catchAsync.js   # Async error wrapper
│           ├── apiFeatures.js  # Filter, sort, paginate, field select
│           ├── buildfilter.js  # Query filter builder
│           └── email.js        # Nodemailer transporter
│
├── backend/__tests__/          # Automated test suite
│   ├── setup.js                # Test environment bootstrap
│   ├── integration/            # API integration tests
│   │   ├── auth.test.js
│   │   ├── contacts.test.js
│   │   ├── deals.test.js
│   │   └── tasks.test.js
│   └── unit/                   # Unit tests
│       ├── apiFeatures.test.js
│       ├── appError.test.js
│       └── buildFilter.test.js
│
├── frontend/                   # React SPA (pages, routing, API service layer)
│
├── docker-compose.yml          # Run backend + MongoDB with one command
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.19+ on the 20.x line, or 22.12+ (required by the locked Mongoose and Vite versions)
- **MongoDB** — Local install or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **Docker with Compose v2** (optional) — [Docker Desktop](https://www.docker.com/products/docker-desktop/), with its engine running, for the backend and MongoDB

### 1. Clone the Repository

```bash
git clone https://github.com/abdelrahman20044/CRM.git
cd CRM
```

### 2. Backend Setup

From the repository root:

```bash
cd backend
npm ci
cp .env.example config.env
```

In PowerShell, use `Copy-Item .env.example config.env` instead of `cp`. Edit the new private `backend/config.env` file. For a local MongoDB server, use:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb://127.0.0.1:27017/crm
JWT_SECRET=your-secret-key-here
EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USERNAME=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password

FRONTEND_URL=http://localhost:5173
```

Replace the JWT and SMTP placeholders with your own values. SMTP is needed for password-reset email. For Atlas, set `DATABASE` to your cluster URI and, if it contains `<db_password>`, set `DATABASE_PASSWORD` separately; `src/config/db.js` replaces that placeholder.

Start the backend while still in `CRM/backend`:

```bash
npm start
```

The API will run at `http://localhost:3000`. Keep `NODE_ENV=development` for this local listener. `npm start` uses nodemon to restart Node.js after code changes; `node server.js` runs it once without watching.

### 3. Frontend Setup

Open a second terminal at the repository root, leaving the backend running:

```bash
cd frontend
npm ci
npm run dev
```

If navigating from `CRM/backend` instead, use `cd ../frontend`. The frontend normally runs at `http://localhost:5173`; Vite proxies `/api` requests to `http://localhost:3000`. Use port 5173 for the existing local CORS configuration. Leave `VITE_API_URL` unset for this proxy setup.

Install dependencies in each application directory. The root package only declares test utilities; installing there does not install the backend or frontend.

### Run with Docker (Alternative)

Run from the repository root. Copy the template only if you have not already created `backend/config.env`:

```bash
cp backend/.env.example backend/config.env
# Edit backend/config.env with your values (JWT secret, email credentials, etc.)
docker compose up --build
```

In PowerShell, the copy command is `Copy-Item backend/.env.example backend/config.env`. Keep `PORT=3000` to match the port mapping. Compose sets `NODE_ENV=development` and overrides `DATABASE` with `mongodb://mongo:27017/crm`; `mongo` is the database service's hostname inside Docker.

The Dockerfile installs production dependencies and runs `node server.js` directly. Compose's development setting enables the existing HTTP listener without requiring nodemon in the image. This starts only the backend (`http://localhost:3000`) and MongoDB (host port `27017`); start the frontend separately using step 3. Node.js and MongoDB are not needed on the host for the two containers, but Node.js is needed for the frontend. Stop any native backend or MongoDB using those ports first.

Stop the containers with `docker compose down`. MongoDB data remains in the named `mongo-data` volume.

### 4. Run Tests

See [Testing](#-testing) below before running integration tests: the existing test helper drops the database it connects to.

### Startup scripts and Vercel

| Command or entry point         | What it currently does                                                                                                                                                                                                                    |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm start` in `backend/`      | Runs `nodemon server.js` for local development.                                                                                                                                                                                           |
| `node server.js` in `backend/` | Runs a persistent HTTP server when `NODE_ENV` is not `production`; this is the Docker command too.                                                                                                                                        |
| `npm run start:prod`           | References `cross-env`, which is not declared in the backend dependencies. Even if installed separately, it sets `NODE_ENV=production`, where `server.js` skips `app.listen()`. It is not a working standalone production server command. |
| Vercel's `backend/vercel.json` | Uses `@vercel/node` to load the Express app exported by `server.js`; Vercel supplies the HTTP listener. Configure environment variables in Vercel rather than committing `config.env`.                                                    |

The existing scripts and production startup behavior are preserved. A standalone production server would require a separately tested startup change.

---

## 📡 API Overview

All endpoints are prefixed with `/api/v1`. Every mutation endpoint is protected by Zod schema validation.

| Resource       | Endpoints                                                    | Auth Required     |
| -------------- | ------------------------------------------------------------ | ----------------- |
| **Auth**       | `register`, `login`, `forgotPassword`, `resetPassword`, `me` | Partial           |
| **Users**      | CRUD + activate/deactivate                                   | Yes (Owner/Admin) |
| **Contacts**   | CRUD + reassign                                              | Yes               |
| **Deals**      | CRUD + stage change + reassign                               | Yes               |
| **Tasks**      | CRUD + status change + reassign                              | Yes               |
| **Activities** | CRUD with entity linking                                     | Yes               |
| **Dashboard**  | Stats + pipeline breakdown                                   | Yes               |

> See [`backend/README.md`](./backend/README.md) for the full API documentation with all endpoints, parameters, and query options.

---

## 🔒 Security

| Measure                        | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| **Helmet**                     | Secure HTTP headers                            |
| **Rate Limiting**              | 300 requests/hour per IP                       |
| **XSS Protection**             | Input sanitization via xss-clean               |
| **NoSQL Injection Prevention** | Query sanitization via express-mongo-sanitize  |
| **HPP**                        | HTTP parameter pollution protection            |
| **bcrypt**                     | Password hashing (12 salt rounds)              |
| **httpOnly Cookies**           | Secure JWT storage                             |
| **CORS**                       | Origin whitelist with credentials support      |
| **Zod Validation**             | Schema-based input validation on all endpoints |

---

## 🧪 Testing

The backend includes an automated test suite using **Jest** and **Supertest**:

- **Integration tests** — Auth flow, Contacts CRUD, Deals CRUD, Tasks CRUD
- **Unit tests** — API features (filter/sort/paginate), error classes, query builder

From `CRM/backend`, after `npm ci`, run database-free unit tests with:

```bash
npm test -- __tests__/unit
```

Integration tests require a running MongoDB and the JWT settings from `config.env`. **Use a disposable test database only:** `__tests__/setup.js` deletes collections during tests and drops the connected database during teardown. Its automatic database-name replacement only targets `mongodb.net/`; a local URI is used unchanged, and an Atlas URI with an existing database name is not safely renamed. Prefer an explicit local test URI rather than relying on that replacement.

In a dedicated PowerShell terminal at `CRM/backend`:

```powershell
$env:DATABASE = 'mongodb://127.0.0.1:27017/crm-test'
npm test
```

Or in Bash:

```bash
DATABASE=mongodb://127.0.0.1:27017/crm-test npm test
```

The environment override takes precedence over `config.env`. `npm run test:watch` is available with the same disposable-database requirement. Supertest exercises the app directly; no separate backend listener is required for tests. The test bootstrap selects `NODE_ENV=test` and mocks the normal database middleware.

Other available checks:

```bash
# From CRM/backend
npm run format:check
# From CRM/frontend
npm run lint
npm run build
```

`npm run format` in the backend rewrites files; use `format:check` for a read-only check. There is currently no backend lint script or installed ESLint, and no frontend test or format script.

---

## 🌐 Deployment

**Live:** [crm-c7zo.vercel.app](https://crm-c7zo.vercel.app/)

Both services are deployed independently on **Vercel**:

- **Backend** — Deployed as a serverless function (`@vercel/node`)
- **Frontend** — Deployed as a static SPA with client-side routing rewrites

---

## 📄 License

ISC
