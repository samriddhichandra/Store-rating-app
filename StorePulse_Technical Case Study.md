# StorePulse — Building a Full-Stack Rating Platform With AI-Assisted Engineering

**Submitted for:** AI Planet Engineering Role Application  
**Candidate:** Samriddhi Chandra  
**GitHub:** https://github.com/samriddhichandra/Store-rating-app  
**Demo Video:** Available in repository public folder  

**Stack:** NestJS · PostgreSQL · TypeORM · React 18 · Tailwind CSS · JWT/Passport

---

# What I Built

StorePulse is a full-stack store rating platform designed with three user roles:

- System Administrator
- Store Owner
- Normal User

Each role has its own protected dashboard, authentication flow, and controlled CRUD permissions.

I built this project to explore production-style full-stack development while following an AI-assisted engineering workflow.

During development, I used AI tools such as Claude and AI coding workflows for:

- Architecture discussions
- Debugging assistance
- Reviewing implementation approaches
- Exploring trade-offs
- Improving development efficiency

AI was used as an engineering assistant, not as a replacement for engineering judgment. I made the final technical decisions, reviewed generated suggestions, and validated implementations.

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
│  │  Module   │  │  Module  │  │  Module  │  │ Module   │  │
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

# Key Capabilities

## Administrator

- Create users and stores
- View platform statistics:
  - Total users
  - Total stores
  - Total ratings
- Browse sortable rating analytics
- View average ratings by user and store

## Store Owner

- View stores they own
- Track overall store rating
- View detailed rating information:
  - User name
  - Email
  - Address
  - Rating score
  - Timestamp

## Normal User

- Search stores by name/address
- Submit 1–5 star ratings
- Update existing ratings
- View updated ratings instantly

---

# AI-Assisted Development Workflow

My workflow was:

```
Problem Definition
        ↓
Architecture Discussion
        ↓
Evaluate Trade-offs
        ↓
Implementation
        ↓
Debugging
        ↓
Validation
```

AI helped with:

- Database design reviews
- Debugging framework-specific issues
- Exploring alternative solutions
- Performance discussions
- Code quality improvements

Every AI suggestion was tested and evaluated against the actual application requirements.

---

# Phase 1 — Database Schema & Architecture Design

## Initial Problem

The application required:

- Users
- Stores
- Ratings
- Rating calculations

My initial idea was storing average ratings directly inside the stores table.

Example:

```
stores
 └── averageRating
```

I reviewed this design with AI.

---

## Architecture Decision

The problem with storing average ratings:

- It creates derived data
- Every rating update requires synchronization
- Individual rating history becomes difficult to maintain

The final design used a normalized structure:

```
Users
Stores
Ratings
```

Database structure:

```
Users

id (uuid)
name
email
password
address
role
createdAt
updatedAt


Stores

id (uuid)
name
email
address
ownerId → users.id
createdAt
updatedAt


Ratings

id (uuid)
userId → users.id
storeId → stores.id
rating (1-5)
createdAt
updatedAt
```

The Rating entity uses:

```ts
@Unique(['userId', 'storeId'])
```

This allowed clean upsert behaviour.

Instead of maintaining:

```
POST /ratings
PATCH /ratings/:id
```

the system could naturally handle:

```
Create rating
or
Update existing rating
```

This reduced unnecessary frontend state handling.

---

# Phase 2 — Aggregated Query Design & Debugging

## Requirement

The store listing needed:

1. Overall rating across all users
2. Current user's submitted rating

My initial approach:

```
Fetch stores
+
Fetch user ratings separately
```

AI pointed out that this could create unnecessary API calls.

The improved solution moved aggregation logic into the backend.

---

## Query Implementation

```ts
const qb = this.storeRepo
.createQueryBuilder('store')
.leftJoin('store.ratings', 'rating')
.select([
 'store.id AS "id"',
 'store.name AS "name"'
])
.addSelect(
 'ROUND(AVG(rating.rating)::numeric, 2)',
 'overallRating'
)
.addSelect(
 'COUNT(rating.id)',
 'ratingsCount'
)
.groupBy('store.id');
```

---

# Debugging: Where AI Was Wrong

The first implementation used:

```ts
.getMany()
```

Problem:

Calculated fields returned:

```
overallRating = undefined
```

Reason:

TypeORM entity mapping only returns entity properties. Custom SQL aliases created through `.addSelect()` were not mapped.

I investigated the ORM behaviour and identified the issue.

Solution:

Changed:

```ts
.getMany()
```

to:

```ts
.getRawMany()
```

because raw queries preserve calculated fields.

Key learning:

AI can accelerate debugging, but understanding framework behaviour is still necessary.

---

# Handling User-Specific Ratings

I initially attempted:

```
Global aggregation
+
User-specific filtering
```

inside the same GROUP BY query.

The issue:

Global statistics and individual user ratings follow different aggregation logic.

Final solution:

1. Fetch aggregated store ratings
2. Fetch current user's ratings
3. Create a lookup map

Example:

```ts
const myRatings =
Object.fromEntries(
 ratings.map(r => [r.storeId, r.rating])
);
```

Then merge:

```ts
return rows.map(row => ({
 ...row,
 myRating: myRatings[row.id] ?? null
}));
```

Result:

- Cleaner aggregation
- O(1) lookup
- Simpler frontend logic

---

# Phase 3 — Authentication Optimization

## Initial Issue

JWT authentication worked, but my first approach fetched the complete user from the database during every authenticated request.

This created unnecessary database queries.

---

## Improvement

JWT payload already contained:

```
userId
email
role
```

So validation returned only required information:

```ts
async validate(payload) {
 return {
   userId: payload.sub,
   email: payload.email,
   role: payload.role
 }
}
```

This reduced unnecessary database calls.

---

# Phase 4 — Role Guard Debugging

Implemented:

- JWT Authentication Guard
- Role Authorization Guard

Issue:

RolesGuard was running before authentication populated `req.user`.

Problem:

```
RolesGuard
      ↓
req.user undefined
```

Correct execution order:

```
JwtAuthGuard
        ↓
RolesGuard
```

Authentication must happen before authorization.

---

# Phase 5 — Frontend Performance Improvements

## Initial Approach

After submitting a rating:

```
Submit rating
        ↓
Reload complete store list
```

Problem:

The interface felt slower because of unnecessary refreshes.

---

## Improvement

Implemented optimistic UI updates:

```
User clicks star
        ↓
Update UI immediately
        ↓
Send API request
        ↓
Refresh aggregate in background
```

Example:

```ts
setStores(prev =>
 prev.map(store =>
 store.id === storeId
 ? {...store,myRating:rating}
 : store
 ))
```

Additional improvement:

Added 300ms debounce on search inputs to avoid API calls on every keystroke.

---

# Phase 6 — Seeder Design & Edge Cases

Created realistic rating distributions:

| Store | Purpose |
|---|---|
| TechHub Electronics | High rating testing |
| FreshDaily Grocery | Average rating testing |
| CoffeeBean Cafe | Low rating handling |
| SweetDelights Bakery | Lowest range testing |

Also tested stores without assigned owners.

Handled empty cases:

```ts
if(storeIds.length === 0){
 return {
  stores:[],
  raters:[],
  averageRating:null
 }
}
```

---

# AI Interaction Examples

## Example 1 — Architecture Review

### Prompt

```
I have users, stores and ratings in NestJS + PostgreSQL.
Should average ratings be stored in the store table
or calculated dynamically?
```

### Outcome

Compared both approaches and selected a normalized rating table because it preserved consistency and rating history.

---

## Example 2 — Debugging

### Prompt

```
The computed columns from TypeORM query builder are undefined.
Could this be related to getMany vs getRawMany?
```

### Outcome

Identified the ORM mapping issue and switched to `.getRawMany()`.

---

# Testing

Current validation included:

- Manual API testing
- Role permission testing
- Rating update testing
- Edge case testing for empty data states

Future improvements:

- Jest unit tests for RatingsService
- Integration tests for aggregation queries
- Automated API testing pipeline

---

# Deployment & Production Improvements

Current project focuses on development and architecture.

Production improvements planned:

## Database

Replace:

```
synchronize:true
```

with:

```
TypeORM migrations
```

for safer schema changes.

## Performance

Add:

- Cursor-based pagination
- Better indexing
- Optimized aggregation queries

## Infrastructure

Recommended deployment setup:

```
Frontend:
Vercel

Backend:
Render / Railway

Database:
Managed PostgreSQL
```

---

# What Working With AI Taught Me

The biggest shift was learning to use AI for engineering reasoning, not only code generation.

The most valuable parts were:

- Challenging architecture assumptions
- Finding performance improvements
- Debugging framework-specific issues
- Reviewing trade-offs

The biggest lesson:

AI can confidently suggest solutions that may not match the exact framework behaviour.

The correct workflow is:

```
AI Suggestion
      ↓
Engineering Evaluation
      ↓
Implementation
      ↓
Testing
```

Treating AI output as a first draft that requires validation made the collaboration effective.

---

# Repository

GitHub:

https://github.com/samriddhichandra/Store-rating-app
