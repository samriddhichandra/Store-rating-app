# StorePulse — Store Rating Platform

A full‑stack store rating application built with **NestJS** (backend) and **React** (frontend).  
Users can browse stores, submit ratings, and store owners can view aggregated feedback.  
The system supports three distinct roles with role‑based access control.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema](#database-schema)
4. [Backend API](#backend-api)
5. [Frontend Application](#frontend-application)
6. [Authentication & Authorization](#authentication--authorization)
7. [Setup & Installation](#setup--installation)
8. [Seed Data & Demo Accounts](#seed-data--demo-accounts)
9. [Environment Variables](#environment-variables)
10. [Running the Application](#running-the-application)
11. [Project Structure](#project-structure)

---

## Tech Stack

### Backend (`backend/`)

| Technology       | Purpose                              |
|------------------|--------------------------------------|
| **NestJS** 10.x  | Node.js framework (controllers, services, modules) |
| **TypeScript** 5.x | Type‑safe development              |
| **PostgreSQL**   | Relational database                  |
| **TypeORM** 0.3.x | ORM with active record / data mapper |
| **Passport** + `passport-jwt` | JWT authentication strategy |
| **bcryptjs**     | Password hashing                     |
| **class-validator** / **class-transformer** | DTO validation & transformation |

### Frontend (`frontend/`)

| Technology          | Purpose                              |
|---------------------|--------------------------------------|
| **React** 18        | UI library                           |
| **Vite**            | Build tool & dev server              |
| **React Router** v6 | Client‑side routing                  |
| **Tailwind CSS** 3  | Utility‑first styling                |
| **Axios**           | HTTP client for API calls            |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐ │
│  │ Landing  │  │  Login   │  │  Signup  │  │ UpdatePwd  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘ │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Protected Routes (by role)               │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │  │
│  │  │  Admin   │  │  User    │  │  Store Owner     │   │  │
│  │  │ Dashboard│  │ StoreList│  │  OwnerDashboard  │   │  │
│  │  │ Users CRUD│  │ (rate)  │  │  (view ratings)  │   │  │
│  │  │ Stores   │  └──────────┘  └──────────────────┘   │  │
│  │  └──────────┘                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │ Axios + JWT                        │
└────────────────────────┼────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────┐
│                  Backend (NestJS)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │  Users   │  │  Stores  │  │ Ratings  │  │
│  │ Module   │  │  Module  │  │  Module  │  │ Module   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Dashboard Module (admin stats)           │  │
│  └──────────────────────────────────────────────────────┘  │
│                        │ TypeORM                            │
└────────────────────────┼────────────────────────────────────┘
                         │
                  ┌──────┴──────┐
                  │ PostgreSQL  │
                  │  Database   │
                  └─────────────┘
```

### Key Design Decisions

- **Role‑based routing**: The frontend `Navbar` renders different navigation links based on the logged‑in user's role. `ProtectedRoute` components guard each route.
- **One rating per user per store**: The `ratings` table has a `UNIQUE(userId, storeId)` constraint. Submitting a new rating for the same store updates the existing one (upsert).
- **Password security**: Passwords are hashed with bcrypt (10 salt rounds). The `password` field is stripped from all API responses via `toSafeUser()`.
- **JWT tokens**: Tokens include `sub` (user ID), `email`, and `role`. They expire after 7 days by default.
- **Synchronized schema**: TypeORM's `synchronize: true` auto‑creates tables on startup (suitable for development; use migrations in production).

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      users       │       │     stores       │       │     ratings      │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (UUID) PK     │       │ id (UUID) PK     │       │ id (UUID) PK     │
│ name (varchar60) │       │ name (varchar60) │       │ rating (int 1-5) │
│ email (varchar)  │◄──────┤ email (varchar)  │       │ userId (UUID) FK │──► users.id
│ password (hash)  │       │ address(varchar) │       │ storeId(UUID) FK │──► stores.id
│ address(varchar) │       │ ownerId(UUID) FK │──► id │ createdAt        │
│ role (enum)      │       │ createdAt        │       │ updatedAt        │
│ createdAt        │       │ updatedAt        │       └──────────────────┘
│ updatedAt        │       └──────────────────┘       UNIQUE(userId, storeId)
└──────────────────┘
```

### Table: `users`

| Column      | Type                    | Constraints                        |
|-------------|-------------------------|------------------------------------|
| `id`        | UUID                    | Primary Key, auto‑generated        |
| `name`      | VARCHAR(60)             | NOT NULL                           |
| `email`     | VARCHAR(255)            | UNIQUE INDEX, NOT NULL             |
| `password`  | VARCHAR(255)            | NOT NULL (bcrypt hash)             |
| `address`   | VARCHAR(400)            | NOT NULL                           |
| `role`      | ENUM (`ADMIN`, `NORMAL_USER`, `STORE_OWNER`) | DEFAULT `NORMAL_USER` |
| `createdAt` | TIMESTAMP               | Auto‑set                           |
| `updatedAt` | TIMESTAMP               | Auto‑updated                       |

**Relationships:**
- `User` → `Rating`: One‑to‑Many (`user.ratings`)
- `User` → `Store`: One‑to‑Many (`user.stores`) — only relevant for `STORE_OWNER` role

### Table: `stores`

| Column      | Type                    | Constraints                        |
|-------------|-------------------------|------------------------------------|
| `id`        | UUID                    | Primary Key, auto‑generated        |
| `name`      | VARCHAR(60)             | NOT NULL                           |
| `email`     | VARCHAR(255)            | NOT NULL                           |
| `address`   | VARCHAR(400)            | NOT NULL                           |
| `ownerId`   | UUID (nullable)         | Foreign Key → `users.id`, ON DELETE SET NULL |
| `createdAt` | TIMESTAMP               | Auto‑set                           |
| `updatedAt` | TIMESTAMP               | Auto‑updated                       |

**Relationships:**
- `Store` → `User` (owner): Many‑ToOne (`store.owner`)
- `Store` → `Rating`: One‑To‑Many (`store.ratings`)

### Table: `ratings`

| Column      | Type                    | Constraints                        |
|-------------|-------------------------|------------------------------------|
| `id`        | UUID                    | Primary Key, auto‑generated        |
| `rating`    | INTEGER                 | NOT NULL (1–5)                     |
| `userId`    | UUID                    | Foreign Key → `users.id`, ON DELETE CASCADE |
| `storeId`   | UUID                    | Foreign Key → `stores.id`, ON DELETE CASCADE |
| `createdAt` | TIMESTAMP               | Auto‑set                           |
| `updatedAt` | TIMESTAMP               | Auto‑updated                       |

**Unique Constraint:** `UNIQUE(userId, storeId)` — each user can rate a store only once. Subsequent ratings update the existing row.

---

## Backend API

All API endpoints are prefixed with the global prefix (if configured). The default port is `5000`.

### Authentication (`/auth`)

| Method | Endpoint            | Auth Required | Description                          |
|--------|---------------------|---------------|--------------------------------------|
| POST   | `/auth/signup`      | No            | Register a new `NORMAL_USER` account |
| POST   | `/auth/login`       | No            | Login, returns JWT + user object     |
| POST   | `/auth/update-password` | Yes       | Change password (requires current password) |
| GET    | `/auth/me`          | Yes           | Get current user's profile           |

**Signup DTO:**
```json
{
  "name": "string (max 60)",
  "email": "string (max 255)",
  "password": "string",
  "address": "string (max 400)"
}
```

**Login DTO:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Login Response:**
```json
{
  "accessToken": "jwt_token_string",
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "NORMAL_USER",
    "name": "string"
  }
}
```

### Users (`/users`) — Admin Only

| Method | Endpoint            | Auth Required | Role Required | Description                          |
|--------|---------------------|---------------|---------------|--------------------------------------|
| GET    | `/users`            | Yes           | ADMIN         | List users (filterable, sortable)    |
| GET    | `/users/:id`        | Yes           | ADMIN         | Get detailed user info               |
| POST   | `/users`            | Yes           | ADMIN         | Create a user (any role)             |

**Query Parameters for `GET /users`:**
- `name` — filter by name (ILIKE)
- `email` — filter by email (ILIKE)
- `address` — filter by address (ILIKE)
- `role` — filter by role (`ADMIN`, `NORMAL_USER`, `STORE_OWNER`)
- `sortBy` — sort field (`name`, `email`, `address`, `role`, `createdAt`; default: `name`)
- `order` — sort direction (`ASC` or `DESC`; default: `ASC`)

**Response includes `avgRating`** for `STORE_OWNER` users (average rating across all their stores).

### Stores (`/stores`)

| Method | Endpoint                  | Auth Required | Role Required    | Description                          |
|--------|---------------------------|---------------|------------------|--------------------------------------|
| GET    | `/stores`                 | Yes           | Any              | List stores with overall rating      |
| GET    | `/stores/:id`             | Yes           | Any              | Get store details                    |
| POST   | `/stores`                 | Yes           | ADMIN            | Create a new store                   |
| GET    | `/stores/owner/dashboard` | Yes           | STORE_OWNER      | Owner dashboard (raters + avg rating)|

**Query Parameters for `GET /stores`:**
- `name` — filter by name (ILIKE)
- `email` — filter by email (ILIKE)
- `address` — filter by address (ILIKE)
- `sortBy` — sort field (`name`, `email`, `address`, `rating`; default: `name`)
- `order` — sort direction (`ASC` or `DESC`; default: `ASC`)

**Response includes:**
- `overallRating` — average rating across all users (nullable)
- `ratingsCount` — total number of ratings
- `myRating` — the current authenticated user's rating (if any), only included when a user is logged in

### Ratings (`/ratings`)

| Method | Endpoint            | Auth Required | Role Required    | Description                          |
|--------|---------------------|---------------|------------------|--------------------------------------|
| POST   | `/ratings`          | Yes           | NORMAL_USER      | Submit or update a rating (upsert)   |

**Rating DTO:**
```json
{
  "storeId": "uuid",
  "rating": 4
}
```

The rating value must be an integer between 1 and 5. If the user has already rated the same store, the existing rating is updated.

### Dashboard (`/dashboard`)

| Method | Endpoint            | Auth Required | Role Required | Description                          |
|--------|---------------------|---------------|---------------|--------------------------------------|
| GET    | `/dashboard/admin`  | Yes           | ADMIN         | Platform‑wide statistics             |

**Response:**
```json
{
  "totalUsers": 5,
  "totalStores": 3,
  "totalRatings": 12
}
```

---

## Frontend Application

### Route Map

| Path                  | Role Required    | Component            | Description                          |
|-----------------------|------------------|----------------------|--------------------------------------|
| `/`                   | Public           | `Landing`            | Landing page with hero + features    |
| `/login`              | Public           | `Login`              | Login form                           |
| `/signup`             | Public           | `Signup`             | Registration form (creates NORMAL_USER) |
| `/update-password`    | Any authenticated | `UpdatePassword`    | Change password form                 |
| `/admin`              | ADMIN            | `AdminDashboard`     | Stats overview (users, stores, ratings) |
| `/admin/users`        | ADMIN            | `AdminUsers`         | User list with filters & sorting     |
| `/admin/users/new`    | ADMIN            | `AdminAddUser`       | Create user (any role)               |
| `/admin/users/:id`    | ADMIN            | `AdminUserDetail`    | View single user details             |
| `/admin/stores`       | ADMIN            | `AdminStores`        | Store list with filters & sorting    |
| `/admin/stores/new`   | ADMIN            | `AdminAddStore`      | Create a new store                   |
| `/stores`             | NORMAL_USER      | `StoreList`          | Browse stores & submit/update ratings |
| `/owner`              | STORE_OWNER      | `OwnerDashboard`     | View store ratings & raters          |

### Key Frontend Components

| Component              | Description                              |
|------------------------|------------------------------------------|
| `Navbar`               | Role‑aware navigation bar with theme toggle, user info, logout |
| `ProtectedRoute`       | Wraps routes; redirects unauthenticated users or users without required role |
| `SortableTable`        | Reusable table with column sorting       |
| `StarRating`           | Interactive / read‑only star rating widget |
| `BackgroundEffects`    | Decorative background (grid, noise, shapes) |
| `FloatingCollage`      | Animated collage on the landing page     |

### Theme System

The app supports **dark** and **light** modes via CSS custom properties. The `ThemeContext` persists the user's preference in `localStorage`. The toggle button in the `Navbar` switches between modes with smooth transitions.

---

## Authentication & Authorization

### Flow

1. **Signup / Login** → Backend validates credentials, returns a JWT `accessToken` and a `user` object.
2. **Token storage** → The frontend stores the token in `localStorage` under the key `token`.
3. **Subsequent requests** → Axios interceptor attaches the token as `Authorization: Bearer <token>`.
4. **Token verification** → The backend's `JwtStrategy` (Passport) validates the token on every protected route.
5. **Role enforcement** → The `RolesGuard` checks the `role` claim in the JWT against the roles required by the route (set via the `@Roles()` decorator).

### Role Hierarchy

| Role           | Can Sign Up Publicly | Created By     | Accessible Frontend Routes              |
|----------------|----------------------|----------------|-----------------------------------------|
| `ADMIN`        | No                   | Another ADMIN  | `/admin/*`                              |
| `NORMAL_USER`  | Yes                  | Public signup or ADMIN | `/stores`                      |
| `STORE_OWNER`  | No                   | ADMIN          | `/owner`                                |

### JWT Payload

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "NORMAL_USER",
  "iat": 1700000000,
  "exp": 1700604800
}
```

---

## Setup & Installation

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 14.x (running on `localhost:5432` or a remote instance)
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd store-rating-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL credentials and a secure JWT secret:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=store_rating_db

JWT_SECRET=your_secure_random_string_here
JWT_EXPIRES_IN=7d

SEED_ADMIN_NAME=System Administrator Account
SEED_ADMIN_EMAIL=admin@storerating.com
SEED_ADMIN_PASSWORD=Admin@1234
SEED_ADMIN_ADDRESS=Head Office, Baner, Pune, Maharashtra
```

Create the database (if it doesn't exist):

```bash
psql -U postgres -c "CREATE DATABASE store_rating_db;"
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```bash
cp .env.example .env
```

Set the API base URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## Seed Data & Demo Accounts

Run the seed script to populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates the following accounts:

| Role          | Email                    | Password      | Name                          |
|---------------|--------------------------|---------------|-------------------------------|
| **ADMIN**     | `admin@storerating.com`  | `Admin@1234`  | System Administrator Account  |
| **STORE_OWNER** | `owner@storerating.com` | `Owner@1234`  | Rajesh Kumar Electronics Store |
| **NORMAL_USER** | `user@storerating.com`  | `User@1234`   | Samriddhi Chandra Test Account |

Additionally, the seed script creates:
- **1 Store**: "Rajesh Electronics" (owned by the store owner)
- **1 Rating**: 4/5 from the normal user to the store

> **Note**: The seed script is idempotent — running it multiple times will not create duplicate records.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Default                        | Description                          |
|-----------------------|--------------------------------|--------------------------------------|
| `PORT`                | `5000`                         | Backend server port                  |
| `DB_HOST`             | `localhost`                    | PostgreSQL host                      |
| `DB_PORT`             | `5432`                         | PostgreSQL port                      |
| `DB_USERNAME`         | `postgres`                     | PostgreSQL username                  |
| `DB_PASSWORD`         | `postgres`                     | PostgreSQL password                  |
| `DB_NAME`             | `store_rating_db`              | PostgreSQL database name             |
| `JWT_SECRET`          | (required)                     | Secret key for signing JWT tokens    |
| `JWT_EXPIRES_IN`      | `7d`                           | JWT expiration duration              |
| `SEED_ADMIN_NAME`     | `System Administrator Account` | Name for the seeded admin user       |
| `SEED_ADMIN_EMAIL`    | `admin@storerating.com`        | Email for the seeded admin user      |
| `SEED_ADMIN_PASSWORD` | `Admin@1234`                   | Password for the seeded admin user   |
| `SEED_ADMIN_ADDRESS`  | `Head Office, Baner, Pune...`  | Address for the seeded admin user    |

### Frontend (`frontend/.env`)

| Variable             | Default                        | Description                          |
|----------------------|--------------------------------|--------------------------------------|
| `VITE_API_BASE_URL`  | `http://localhost:5000`        | Backend API base URL                 |

---

## Running the Application

### Start the Backend (Development)

```bash
cd backend
npm run start:dev
```

The server starts at `http://localhost:5000`. It auto‑restarts on file changes.

### Start the Frontend (Development)

```bash
cd frontend
npm run dev
```

The dev server starts at `http://localhost:5173` (or the next available port). It proxies API requests to the backend.

### Production Build

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
# Serve the `dist/` folder with any static file server
```

---

## Project Structure

```
store-rating-app/
├── README.md
│
├── backend/                          # NestJS Backend
│   ├── .env.example                  # Environment variable template
│   ├── package.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   └── src/
│       ├── main.ts                   # Entry point
│       ├── app.module.ts             # Root module (TypeORM, Config, feature modules)
│       │
│       ├── auth/                     # Authentication module
│       │   ├── auth.module.ts
│       │   ├── auth.controller.ts    # POST /auth/signup, /login, /update-password, GET /me
│       │   ├── auth.service.ts       # Business logic (signup, login, password update)
│       │   ├── dto/
│       │   │   ├── signup.dto.ts
│       │   │   ├── login.dto.ts
│       │   │   └── update-password.dto.ts
│       │   └── strategies/
│       │       └── jwt.strategy.ts   # Passport JWT strategy
│       │
│       ├── users/                    # Users module
│       │   ├── users.module.ts
│       │   ├── users.controller.ts   # CRUD endpoints (admin only)
│       │   ├── users.service.ts      # Business logic (create, find, list with avg rating)
│       │   ├── entities/
│       │   │   └── user.entity.ts    # User entity definition
│       │   └── dto/
│       │       ├── create-user.dto.ts
│       │       └── query-user.dto.ts
│       │
│       ├── stores/                   # Stores module
│       │   ├── stores.module.ts
│       │   ├── stores.controller.ts  # CRUD + owner dashboard
│       │   ├── stores.service.ts     # Business logic (list with ratings, owner dashboard)
│       │   ├── entities/
│       │   │   └── store.entity.ts   # Store entity definition
│       │   └── dto/
│       │       ├── create-store.dto.ts
│       │       └── query-store.dto.ts
│       │
│       ├── ratings/                  # Ratings module
│       │   ├── ratings.module.ts
│       │   ├── ratings.controller.ts # POST /ratings (upsert)
│       │   ├── ratings.service.ts    # Upsert logic (one rating per user per store)
│       │   ├── entities/
│       │   │   └── rating.entity.ts  # Rating entity definition
│       │   └── dto/
│       │       └── create-rating.dto.ts
│       │
│       ├── dashboard/                # Dashboard module
│       │   ├── dashboard.module.ts
│       │   ├── dashboard.controller.ts  # GET /dashboard/admin
│       │   └── dashboard.service.ts     # Aggregated stats
│       │
│       ├── common/                   # Shared utilities
│       │   ├── enums/
│       │   │   └── role.enum.ts      # Role enum (ADMIN, NORMAL_USER, STORE_OWNER)
│       │   ├── decorators/
│       │   │   └── roles.decorator.ts # @Roles() decorator
│       │   └── guards/
│       │       └── roles.guard.ts    # Role-based access guard
│       │
│       └── database/
│           └── seed.ts               # Database seeder (run with `npm run seed`)
│
└── frontend/                         # React Frontend
    ├── .env.example                  # Environment variable template
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx                  # Entry point (BrowserRouter, providers)
        ├── App.jsx                   # Route definitions
        ├── index.css                 # Global styles + Tailwind directives
        │
        ├── api/
        │   └── axios.js              # Axios instance with JWT interceptor
        │
        ├── context/
        │   ├── AuthContext.jsx       # Auth state (login, signup, logout, user)
        │   └── ThemeContext.jsx      # Dark/light theme toggle
        │
        ├── components/
        │   ├── Navbar.jsx            # Role-aware navigation bar
        │   ├── ProtectedRoute.jsx    # Route guard (auth + role check)
        │   ├── SortableTable.jsx     # Reusable sortable table
        │   ├── StarRating.jsx        # Star rating widget
        │   ├── BackgroundEffects.jsx # Decorative background effects
        │   └── FloatingCollage.jsx   # Animated landing page collage
        │
        └── pages/
            ├── Landing.jsx           # Public landing page
            ├── Login.jsx             # Login form
            ├── Signup.jsx            # Registration form
            ├── UpdatePassword.jsx    # Password change form
            │
            ├── admin/
            │   ├── AdminDashboard.jsx    # Stats overview
            │   ├── AdminUsers.jsx        # User list (filterable, sortable)
            │   ├── AdminAddUser.jsx      # Create user form
            │   ├── AdminUserDetail.jsx   # User detail view
            │   ├── AdminStores.jsx       # Store list (filterable, sortable)
            │   └── AdminAddStore.jsx     # Create store form
            │
            ├── user/
            │   └── StoreList.jsx     # Browse stores + rate them
            │
            └── owner/
                └── OwnerDashboard.jsx # View store ratings & raters
```

---

## Key Business Logic

### Rating Upsert

When a `NORMAL_USER` submits a rating via `POST /ratings`, the backend:

1. Verifies the store exists.
2. Checks if the user has already rated this store.
3. If yes → updates the existing rating.
4. If no → creates a new rating row.

This ensures the `UNIQUE(userId, storeId)` constraint is never violated.

### Average Rating Calculation

- **Store listing**: Uses `ROUND(AVG(rating.rating)::numeric, 2)` in a SQL query with `GROUP BY store.id`.
- **Owner dashboard**: Computed in‑memory from all ratings across the owner's stores.
- **User detail (admin)**: For `STORE_OWNER` users, the average rating is calculated from all ratings across all stores owned by that user.

### Role‑Based Data Visibility

- **ADMIN**: Full access to all users, stores, and platform statistics.
- **NORMAL_USER**: Can browse stores and submit ratings. Cannot view other users or admin panels.
- **STORE_OWNER**: Can view their own store(s) and the ratings submitted by users. Cannot browse other stores or rate stores.

---

## Security Considerations

1. **Password Hashing**: All passwords are hashed with bcrypt (10 rounds) before storage.
2. **Password Never Exposed**: The `password` field is explicitly excluded from all API responses via the `toSafeUser()` method.
3. **JWT Expiration**: Tokens expire after 7 days by default. Configure via `JWT_EXPIRES_IN`.
4. **Role Enforcement**: Both frontend (route guards) and backend (`RolesGuard`) enforce role‑based access.
5. **Input Validation**: All DTOs use `class-validator` decorators for validation.
6. **SQL Injection Protection**: TypeORM's query builder parameterizes all user inputs.
7. **CORS**: Configured in `main.ts` to allow the frontend origin.

---

## Development Commands

```bash
# Backend
cd backend
npm run start:dev      # Start in watch mode
npm run build          # Compile TypeScript
npm run start:prod     # Start production build
npm run seed           # Seed the database
npm run lint           # Lint source files
npm run format         # Format with Prettier

# Frontend
cd frontend
npm run dev            # Start Vite dev server
npm run build          # Build for production
npm run preview        # Preview production build
```

---

## License

This project is developed as a full‑stack application demonstration. All rights reserved.