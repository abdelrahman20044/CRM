# CRM SaaS — Full-Stack Customer Relationship Management

A full-stack, multi-tenant CRM application built as a monorepo with a **Node.js/Express REST API** backend and a **React/Vite** frontend.

## ✨ Features

- **Multi-Tenant Architecture** — Data isolation per company
- **Role-Based Access Control** — Owner, Admin, Manager, and Sales Rep roles
- **Contact Management** — Full CRUD with lead source tracking and status pipeline
- **Deal Pipeline** — Five-stage sales pipeline (Lead → Qualified → Proposal → Won / Lost)
- **Task Management** — Priority levels, status tracking, linked to contacts or deals
- **Activity Logging** — Track calls, emails, meetings, notes, and system events
- **Dashboard Analytics** — Revenue totals, deal counts, pipeline breakdown
- **Authentication** — JWT with httpOnly cookies, password reset via email
- **API Features** — Filtering, sorting, field selection, and pagination

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, React Router 7, Axios, Vite 8 |
| **Backend** | Node.js, Express 4, Mongoose 9, JWT |
| **Database** | MongoDB (Atlas) |
| **Security** | Helmet, rate limiting, XSS protection, NoSQL injection prevention, CORS |
| **Email** | Nodemailer |

## 📁 Project Structure

```
crm-saas/
├── backend/                # Express REST API
│   ├── server.js           # Entry point
│   ├── config.env          # Environment variables (not in repo)
│   └── src/
│       ├── app.js          # Express app & middleware
│       ├── config/         # Database connection
│       ├── controllers/    # Route handlers
│       ├── models/         # Mongoose schemas
│       ├── routes/         # API route definitions
│       ├── middlewares/    # Auth & role middleware
│       └── utils/          # Helpers (error handling, email, etc.)
│
├── frontend/               # React SPA
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx         # Root component & routing
│       ├── context/        # Auth context provider
│       ├── pages/          # Page components
│       ├── services/       # API service layer
│       └── assets/         # Static assets
│
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MongoDB** — Local install or [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/crm-saas.git
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

## 📡 API Overview

All endpoints are prefixed with `/api/v1`.

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

## 🔒 Security

- Helmet — Secure HTTP headers
- Rate Limiting — 100 requests/hour per IP
- XSS Protection — Input sanitization
- NoSQL Injection Prevention — Query sanitization
- HPP — HTTP parameter pollution protection
- bcrypt — Password hashing (12 salt rounds)
- httpOnly Cookies — Secure JWT storage
- CORS — Configured with credentials support

## 📄 License

ISC
