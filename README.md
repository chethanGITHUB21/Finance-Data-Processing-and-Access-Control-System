<<<<<<< HEAD
# Finance-Data-Processing-and-Access-Control-System
=======
# Financial Track Project

A role-based financial tracking dashboard with authentication, user management, records tracking, and analytics summaries for income/expense trends.

**Base URL**
`http://localhost:3001`

**Quick Setup**

1. Install Node.js (LTS).
2. In the project folder, run the commands from `requirement.txt`.
3. Create the database and load the schema:

```powershell
psql -U postgres -c "CREATE DATABASE finance_db;"
psql -U postgres -d finance_db -f schema.sql
```

4. Create `.env`:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=finance_db
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
```

5. Start the server:

```powershell
npm start
```

**API Endpoints**

Domain: `http://localhost:3001/api/auth`
| Method | Endpoint | Working |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Login and receive JWT |

Domain: `http://localhost:3001/api/users`
| Method | Endpoint | Working |
|---|---|---|
| GET | `/` | Get all users |
| GET | `/:id` | Get user by id |
| POST | `/` | Create user (admin) |
| PUT | `/:id` | Update user |
| DELETE | `/:id` | Delete user |

Domain: `http://localhost:3001/api/records`
| Method | Endpoint | Working |
|---|---|---|
| POST | `/` | Create record |
| GET | `/get` | Get all records |
| GET | `/get/:id` | Get record by id |
| PUT | `/update/:id` | Update record |
| DELETE | `/delete/:id` | Soft-delete record |

Domain: `http://localhost:3001/api/summary`
| Method | Endpoint | Working |
|---|---|---|
| GET | `/overview` | Total income/expense/net |
| GET | `/Category` | Category totals |
| GET | `/trends` | Monthly trend totals |

Domain: `http://localhost:3001/api/lookup`
| Method | Endpoint | Working |
|---|---|---|
| GET | `/types` | List record types |
| GET | `/categories` | List categories |

**Authorization & Roles**
Authentication uses JWT (Bearer token in `Authorization` header).

Roles:

1. `ADMIN`
2. `ANALYST`
3. `VIEWER`

Access:

1. ADMIN: full access to users, records, and summaries.
2. ANALYST: read users, read records, view summaries.
3. VIEWER: view summaries only (read-only dashboard charts).

**Rate Limiting**
Rate limits are enforced per 15-minute window:

1. `POST /api/auth/register` → 5 requests
2. `POST /api/auth/login` → 10 requests
3. All other endpoints → 200 requests

**Pagination**
Pagination is handled on the frontend for tables:

1. Users table paginates results in the UI.
2. Records table paginates results in the UI.

**Soft Delete**
Records are soft-deleted (flagged with `is_deleted` and timestamped in `deleted_at`).

**Charts & Why They Exist**

1. Overview (bar chart): quick snapshot of total income, total expense, and net balance.
2. Category (horizontal bar): compares totals by category to reveal spending/earning distribution.
3. Trends (line chart): shows how income and expense change across months to spot growth or spikes.
>>>>>>> e9bd5c5 (initial commit)
