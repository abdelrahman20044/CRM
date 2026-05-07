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

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js, Express 4 |
| **Database** | MongoDB (Atlas), Mongoose 9 |
| **Auth** | JWT, bcryptjs |
| **Validation** | Zod 4 |
| **Security** | Helmet, express-rate-limit, xss-clean, express-mongo-sanitize, HPP, CORS |
| **Email** | Nodemailer |
| **Testing** | Jest 30, Supertest 7 |
| **Deployment** | Vercel (Serverless) |

### Frontend

| Category | Technologies |
|----------|-------------|
| **Framework** | React 19, Vite 8 |
| **Routing** | React Router 7 |
| **HTTP Client** | Axios |
| **Deployment** | Vercel |

---

## 📁 Project Structure

```
crm-saas/
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
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** — Local install or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the Repository

```bash
git clone https://github.com/abdelrahman20044/CRM.git
cd crm-saas
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `config.env` file in the `backend/` directory:

```env
NODE_ENV=development
PORT=3000
DATABASE=mongodb+srv://<username>:<password>@cluster.mongodb.net/crm-saas
JWT_SECRET=your-secret-key-here
EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USERNAME=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password

FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm start
```

The API will run at `http://localhost:3000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173` and proxy API requests to the backend.

### 4. Run Tests

```bash
cd backend
npm test
```

---

## 📡 API Overview

All endpoints are prefixed with `/api/v1`. Every mutation endpoint is protected by Zod schema validation.

| Resource | Endpoints | Auth Required |
|----------|-----------|---------------|
| **Auth** | `register`, `login`, `forgotPassword`, `resetPassword`, `me` | Partial |
| **Users** | CRUD + activate/deactivate | Yes (Owner/Admin) |
| **Contacts** | CRUD + reassign | Yes |
| **Deals** | CRUD + stage change + reassign | Yes |
| **Tasks** | CRUD + status change + reassign | Yes |
| **Activities** | CRUD with entity linking | Yes |
| **Dashboard** | Stats + pipeline breakdown | Yes |

> See [`backend/README.md`](./backend/README.md) for the full API documentation with all endpoints, parameters, and query options.

---

## 🔒 Security

| Measure | Purpose |
|---------|---------|
| **Helmet** | Secure HTTP headers |
| **Rate Limiting** | 300 requests/hour per IP |
| **XSS Protection** | Input sanitization via xss-clean |
| **NoSQL Injection Prevention** | Query sanitization via express-mongo-sanitize |
| **HPP** | HTTP parameter pollution protection |
| **bcrypt** | Password hashing (12 salt rounds) |
| **httpOnly Cookies** | Secure JWT storage |
| **CORS** | Origin whitelist with credentials support |
| **Zod Validation** | Schema-based input validation on all endpoints |

---

## 🧪 Testing

The backend includes an automated test suite using **Jest** and **Supertest**:

- **Integration tests** — Auth flow, Contacts CRUD, Deals CRUD, Tasks CRUD
- **Unit tests** — API features (filter/sort/paginate), error classes, query builder

```bash
cd backend
npm test           # Run all tests
npm run test:watch # Watch mode
```

---

## 🌐 Deployment

**Live:** [crm-c7zo.vercel.app](https://crm-c7zo.vercel.app/)

Both services are deployed independently on **Vercel**:

- **Backend** — Deployed as a serverless function (`@vercel/node`)
- **Frontend** — Deployed as a static SPA with client-side routing rewrites

---

## 📄 License

ISC
