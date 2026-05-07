# CRM — REST API

A Customer Relationship Management REST API built with Node.js, Express, and MongoDB. Features JWT authentication, role-based access control, deal pipeline management, Zod input validation, and dashboard analytics.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose ODM
- **Auth:** JWT + bcryptjs + httpOnly cookies
- **Validation:** Zod (schema-based input validation on all endpoints)
- **Email:** Nodemailer
- **Security:** Helmet, rate limiting, XSS protection, NoSQL injection prevention, HPP
- **Testing:** Jest + Supertest
- **Deployment:** Vercel (Serverless)

## Features

- **Role-Based Access Control** — Four roles (`owner`, `admin`, `manager`, `sales_rep`) with hierarchical permissions.
- **Authentication** — Register (creates company + owner), login, forgot/reset password via email, update password.
- **Contact Management** — Full CRUD with lead source tracking and status pipeline.
- **Deal Management** — Sales pipeline with five stages (`lead` → `qualified` → `proposal` → `won` / `lost`), auto-timestamping on close.
- **Task Management** — Priority levels, status tracking, polymorphic linking to contacts or deals.
- **Dashboard Analytics** — Revenue totals, deal counts, and pipeline breakdown via MongoDB aggregation.
- **Activity Log** — Track calls, emails, meetings, notes, and system events linked to contacts, deals, or tasks.
- **Input Validation** — Zod schemas on every mutation endpoint with a reusable validation middleware.
- **API Features** — Filtering (with `gte/lte` operators), sorting, field selection, and pagination on all list endpoints.
- **Global Error Handling** — Centralized error controller with dev/production modes and Mongoose-specific error handling.
- **Automated Testing** — Integration and unit test suite with Jest & Supertest.

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
git clone https://github.com/abdelrahman20044/CRM.git
cd crm-saas/backend
npm install
```

### Environment Variables

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

### Run

```bash
# Development
npm start

# Production
npm run start:prod

# Tests
npm test
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/register` | Register company + owner | No |
| POST | `/api/v1/auth/login` | Login | No |
| POST | `/api/v1/auth/forgotPassword` | Send reset token via email | No |
| PATCH | `/api/v1/auth/resetPassword/:token` | Reset password | No |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| PATCH | `/api/v1/auth/updatePassword` | Update password | Yes |

### Users (Owner/Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | List all company users |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create team member |
| PATCH | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Deactivate user (soft delete) |
| PATCH | `/api/v1/users/:id/activate` | Reactivate user |

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/contacts` | List contacts |
| GET | `/api/v1/contacts/:id` | Get contact |
| POST | `/api/v1/contacts` | Create contact |
| PATCH | `/api/v1/contacts/:id` | Update contact |
| DELETE | `/api/v1/contacts/:id` | Delete contact |
| PATCH | `/api/v1/contacts/:id/assign` | Reassign contact (Owner/Admin) |

### Deals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/deals` | List deals |
| GET | `/api/v1/deals/:id` | Get deal |
| POST | `/api/v1/deals` | Create deal |
| PATCH | `/api/v1/deals/:id` | Update deal |
| DELETE | `/api/v1/deals/:id` | Delete deal (Owner/Admin) |
| PATCH | `/api/v1/deals/:id/stage` | Change deal stage |
| PATCH | `/api/v1/deals/:id/assign` | Reassign deal (Owner/Admin) |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | List tasks |
| GET | `/api/v1/tasks/:id` | Get task |
| POST | `/api/v1/tasks` | Create task |
| PATCH | `/api/v1/tasks/:id` | Update task |
| DELETE | `/api/v1/tasks/:id` | Delete task (Owner/Admin) |
| PATCH | `/api/v1/tasks/:id/status` | Change task status |
| PATCH | `/api/v1/tasks/:id/assign` | Reassign task (Owner/Admin/Manager) |

### Activities

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/activities` | List activities (filter by `relatedTo` & `relatedId`) |
| GET | `/api/v1/activities/:id` | Get activity |
| POST | `/api/v1/activities` | Log an activity |
| PATCH | `/api/v1/activities/:id` | Update activity |
| DELETE | `/api/v1/activities/:id` | Delete activity (Owner/Admin) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard/stats` | Summary stats (contacts, deals, revenue) |
| GET | `/api/v1/dashboard/pipeline` | Pipeline breakdown by stage |

### Query Parameters

All list endpoints support:

```
?page=1&limit=10          # Pagination
?sort=-createdAt,value     # Sorting (- for descending)
?fields=name,email,status  # Field selection
?status=new                # Filtering
?value[gte]=1000           # Advanced filtering (gte, gt, lte, lt)
```

## Project Structure

```
backend/
├── server.js                  # Entry point, DB connection, process handlers
├── config.env                 # Environment variables (not in repo)
├── vercel.json                # Vercel serverless deployment config
├── jest.config.js             # Jest test configuration
└── src/
    ├── app.js                 # Express app, middleware stack, routes
    ├── config/
    │   └── db.js              # MongoDB connection (singleton pattern)
    ├── models/
    │   ├── Company.js         # Company model
    │   ├── User.js            # User with roles, password hashing, reset tokens
    │   ├── Contact.js         # Lead/contact with source and status tracking
    │   ├── Deal.js            # Sales deal with pipeline stages
    │   ├── Task.js            # Task with priority, polymorphic relations
    │   └── Activity.js        # Activity log with polymorphic entity linking
    ├── controllers/
    │   ├── authController.js  # Register, login, forgot/reset/update password
    │   ├── userController.js  # Team member CRUD
    │   ├── contactController.js
    │   ├── dealController.js  # Includes stage change and assignment
    │   ├── taskController.js
    │   ├── activityController.js
    │   ├── dashboardController.js  # Aggregation-based analytics
    │   └── errorController.js # Global error handler (dev/prod)
    ├── routes/
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── contactRoutes.js
    │   ├── dealRoutes.js
    │   ├── taskRoutes.js
    │   ├── activityRoutes.js
    │   └── dashboardRoutes.js
    ├── middlewares/
    │   ├── auth.js            # JWT verification + role restriction
    │   └── validate.js        # Reusable Zod validation middleware
    ├── validators/            # Zod schemas per resource
    │   ├── authValidator.js
    │   ├── contactValidator.js
    │   ├── dealValidator.js
    │   ├── taskValidator.js
    │   ├── activityValidator.js
    │   └── userValidator.js
    └── utils/
        ├── apiFeatures.js     # Filter, sort, paginate, field select
        ├── appError.js        # Custom operational error class
        ├── buildfilter.js     # Company + role-based query builder
        ├── catchAsync.js      # Async error wrapper
        └── email.js           # Nodemailer transporter

__tests__/
├── setup.js                   # Test environment bootstrap
├── integration/
│   ├── auth.test.js
│   ├── contacts.test.js
│   ├── deals.test.js
│   └── tasks.test.js
└── unit/
    ├── apiFeatures.test.js
    ├── appError.test.js
    └── buildFilter.test.js
```

## Security

- **Helmet** — Secure HTTP headers
- **Rate Limiting** — 300 requests per hour per IP
- **XSS Protection** — Input sanitization
- **NoSQL Injection Prevention** — Query sanitization
- **HPP** — HTTP parameter pollution protection
- **bcrypt** — Password hashing (salt rounds: 12)
- **httpOnly Cookies** — JWT stored securely (HTTPS-only in production)
- **CORS** — Origin whitelist with credentials support
- **Zod Validation** — Schema-based input validation on all mutation endpoints

## License

ISC
