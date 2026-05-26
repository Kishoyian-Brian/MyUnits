# MyUnits

Smart Rental Property & Utility Tracker for landlords to manage tenants, automate billing, accept M-Pesa payments, and send notifications.

---

## Overview

MyUnits is a full-stack property management platform built for landlords and property managers in Kenya.

The system helps automate:

- Property & unit management
- Tenant management
- Lease tracking
- Monthly rent invoicing
- Utility billing
- M-Pesa payment collection
- Maintenance request tracking
- Expense tracking & reporting
- Rent adjustment history
- SMS & email notifications
- Dashboard analytics (revenue, occupancy)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [NestJS](https://nestjs.com/) (v11) |
| Language | TypeScript |
| Database | PostgreSQL |
| ORM | [Prisma](https://www.prisma.io/) (v7) |
| Auth | JWT (access + refresh tokens) |
| File Storage | [Cloudflare R2](https://developers.cloudflare.com/r2/) |
| Email | Nodemailer |
| Docs | Swagger / OpenAPI |

---

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── auth/                   # Register, login, JWT, password reset, email verification
│   ├── users/                  # Profile management, admin landlord creation
│   ├── properties/             # CRUD + image uploads (R2)
│   ├── units/                  # CRUD, vacancy tracking
│   ├── tenants/                # CRUD, search
│   ├── leases/                 # CRUD, transactional create/terminate
│   ├── invoices/               # CRUD, monthly billing
│   ├── payments/               # Record & reconcile payments
│   ├── maintenance/            # Requests + image uploads (R2)
│   ├── expenses/               # Property expense tracking
│   ├── rent-adjustments/       # Rent change history
│   ├── notifications/          # Email / SMS / push notifications
│   ├── dashboard/              # Summary, revenue, occupancy analytics
│   ├── mailer/                 # Email templates & sending
│   ├── storage/                # Cloudflare R2 service
│   ├── prisma/                 # PrismaService (connection lifecycle)
│   └── common/                 # Shared DTOs, filters, helpers
└── nest-cli.json
```

---

## Database Models

User, Property, PropertyImage, Unit, Tenant, Lease, Invoice, Payment, MaintenanceRequest, MaintenanceImage, Expense, RentAdjustment, Notification

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL
- Cloudflare R2 bucket (for image uploads)
- SMTP credentials (for email)

### Installation

```bash
cd server
npm install
```

### Environment

Copy the example env and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `PORT` | Server port (default: 3001) |
| `MAIL_HOST` | SMTP host |
| `MAIL_PORT` | SMTP port |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |
| `APP_URL` | Frontend URL (for CORS & email links) |
| `CLOUDFLARE_R2_*` | R2 credentials and bucket config |
| `ADMIN_EMAIL` | Seed admin email |
| `ADMIN_PASSWORD` | Seed admin password |
| `ADMIN_NAME` | Seed admin display name |

### Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Seed Admin User

```bash
npm run db:seed
```

### Run

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

---

## API Documentation

Interactive Swagger docs are available at:

```
http://localhost:3001/api/docs
```

All endpoints are prefixed with `/api/v1`.

### API Modules

| Tag | Endpoints | Auth |
|---|---|---|
| Auth | Register, login, verify email, forgot/reset password, refresh, logout | Public (logout requires JWT) |
| Users | Profile CRUD, admin landlord creation | JWT |
| Properties | CRUD + image upload/delete | JWT + Role |
| Units | CRUD with property & status filters | JWT + Role |
| Tenants | CRUD with search | JWT + Role |
| Leases | CRUD with status & property filters | JWT + Role |
| Invoices | CRUD with lease, status, month/year filters | JWT + Role |
| Payments | Record, list, get, void | JWT + Role |
| Notifications | Send, list, get | JWT + Role |
| Maintenance | CRUD + image upload/delete | JWT + Role |
| Expenses | CRUD with date range & category filters | JWT + Role |
| Rent Adjustments | Create, list, get | JWT + Role |
| Dashboard | Summary, revenue, occupancy | JWT + Role |

---

## Security

- **Helmet** — HTTP security headers
- **CORS** — Configurable origin whitelist
- **Rate limiting** — 60 requests per minute (`@nestjs/throttler`)
- **JWT auth** — Access + refresh token flow
- **RBAC** — Role-based access control (Admin, Landlord, User)
- **Input validation** — Global `ValidationPipe` with whitelist enforcement
- **Global exception filter** — Consistent error responses, no stack leaks in production

---

## Scripts

| Command | Description |
|---|---|
| `npm run start:dev` | Start in watch mode |
| `npm run build` | Compile to `dist/` |
| `npm run start:prod` | Run compiled build |
| `npm run lint` | Lint and auto-fix |
| `npm run format` | Prettier format |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run db:seed` | Seed the admin user |

