# Ultra Travel Agency — Management System

Full-stack SaaS application for travel agency management.

## Stack

| Layer     | Technology                               |
|-----------|------------------------------------------|
| Frontend  | React 18, TypeScript, Tailwind CSS, Vite |
| Backend   | Node.js, Express, TypeScript             |
| Database  | PostgreSQL 16                            |
| Auth      | JWT, bcrypt                              |
| PDF       | PDFKit (server-side)                     |
| Docker    | Docker Compose (full stack)              |

---

## Project Structure

```
ultra-website/
├── database/
│   ├── schema.sql          # Schema with enums, indexes, triggers
│   └── seed.sql            # Default admin account
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── config/         # DB pool
│   │   ├── middleware/     # JWT auth, role guard
│   │   ├── types/
│   │   └── modules/
│   │       ├── auth/       # Login, user management
│   │       ├── clients/    # Workflow (NEW→PROCESSING→COMPLETED)
│   │       ├── tickets/    # Ticket CRUD
│   │       ├── hotels/     # Hotel CRUD
│   │       ├── statistics/ # Revenue calculations
│   │       ├── dashboard/  # KPI aggregation
│   │       └── documents/  # PDF (invoice/contract/voucher)
│   └── Dockerfile
└── frontend/
    ├── src/
    │   ├── api/            # Axios API layer
    │   ├── context/        # AuthContext
    │   ├── components/     # Layout, Button, Input, Modal, Table…
    │   └── pages/
    │       ├── auth/       # Login
    │       ├── dashboard/  # KPI cards
    │       ├── clients/    # Kanban board
    │       ├── tickets/    # Table + CRUD
    │       ├── hotels/     # Table + CRUD
    │       ├── statistics/ # Bar + Pie charts
    │       └── users/      # Admin-only user management
    ├── Dockerfile
    └── nginx.conf
```

---

## Quick Start — Docker (Recommended)

```bash
# 1. Copy env template
cp backend/.env.example backend/.env
# Edit backend/.env and set JWT_SECRET

# 2. Start all services
docker compose up -d

# 3. Open the app
# http://localhost
```

Default credentials:
- **Email:** `admin@ultratravel.com`
- **Password:** `Admin@1234`

---

## Manual Setup (Development)

### PostgreSQL
```bash
createdb ultratravel_db
psql ultratravel_db < database/schema.sql
psql ultratravel_db < database/seed.sql
```

### Backend
```bash
cd backend
cp ../.env.example .env   # edit DATABASE_URL + JWT_SECRET
npm install
npm run dev               # http://localhost:4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

---

## API Endpoints

### Auth `/api/auth`
| Method | Path                    | Roles  |
|--------|-------------------------|--------|
| POST   | `/login`                | Public |
| GET    | `/me`                   | Any    |
| GET    | `/users`                | ADMIN  |
| POST   | `/users`                | ADMIN  |
| PATCH  | `/users/:id/toggle`     | ADMIN  |

### Clients `/api/clients`
| Method | Path                      | Description             |
|--------|---------------------------|-------------------------|
| GET    | `/`                       | List (filter by status) |
| POST   | `/`                       | Create (status=NEW)     |
| PUT    | `/:id`                    | Update                  |
| POST   | `/:id/validate-step1`     | NEW → PROCESSING        |
| PATCH  | `/:id/appointment`        | Update appointment      |
| POST   | `/:id/final-validation`   | PROCESSING → COMPLETED  |
| DELETE | `/:id`                    | Delete                  |

### Tickets & Hotels `/api/tickets` `/api/hotels`
Standard CRUD: GET, POST, PUT /:id, DELETE /:id

### Statistics `/api/statistics?fromDate=&toDate=`
Returns `{ ticketsRevenue, hotelsRevenue, clientsRevenue, totalRevenue }`

### Documents `/api/documents`
| GET | `/clients/:id/invoice`  | PDF invoice  |
| GET | `/clients/:id/contract` | PDF contract |
| GET | `/clients/:id/voucher`  | PDF voucher  |

---

## Roles & Permissions

| Feature          | ADMIN | EMPLOYEE | ACCOUNTANT |
|------------------|-------|----------|------------|
| Dashboard        | ✅    | ✅       | ✅         |
| Clients (Kanban) | ✅    | ✅       | ❌         |
| Tickets          | ✅    | ✅       | ❌         |
| Hotels           | ✅    | ✅       | ❌         |
| Statistics       | ✅    | ❌       | ✅         |
| User management  | ✅    | ❌       | ❌         |
| PDF documents    | ✅    | ✅       | ❌         |

---

## Client Workflow

```
[NEW] ──(validate-step1)──▶ [PROCESSING] ──(final-validation)──▶ [COMPLETED]
         sets appointmentDate    update appointment status
```

---

## Production Checklist

- [ ] Change `JWT_SECRET` (min 32 random chars)
- [ ] Change default admin password
- [ ] Set `NODE_ENV=production`
- [ ] Configure HTTPS on reverse proxy
- [ ] Set up PostgreSQL backups
- [ ] Update `CLIENT_URL` in backend `.env`
