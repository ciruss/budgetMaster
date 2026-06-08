# BudgetMaster

BudgetMaster is a full-stack personal finance app for tracking transactions, budgets, assets, and net worth.

The repository contains:

- `frontend/`: React 19 + TypeScript + Vite single-page app
- `backend/`: Spring Boot API with JWT-based authentication
- PostgreSQL as the main database

## Features

- user signup and login
- monthly dashboard with summary metrics
- transaction management
- category management
- monthly spending budget
- asset and asset snapshot tracking
- net worth history

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- TanStack Router
- TanStack Query
- Tailwind CSS

Backend:

- Spring Boot
- Spring Security
- Spring Data JPA
- JWT authentication
- PostgreSQL

Infrastructure:

- Amazon S3 for static frontend hosting
- Amazon Elastic Beanstalk for backend hosting
- Amazon CloudFront in front of both frontend and backend
- PostgreSQL in production

## Project Structure

```text
budgetMaster/
├── backend/
├── frontend/
└── README.md
```

## Local Development

### Backend

Requirements:

- Java 21
- PostgreSQL

The backend uses Spring profiles. Local development settings live in `backend/src/main/resources/application-dev.properties`.

Start the backend from `backend/`:

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

The API is built around `/api/*` endpoints, for example:

- `/api/auth/signup`
- `/api/auth/login`
- `/api/me`
- `/api/transactions`
- `/api/categories`
- `/api/assets`
- `/api/budgets/{yearMonth}`
- `/api/summary/{yearMonth}`
- `/api/networth`

### Frontend

Requirements:

- Node.js
- npm

Install dependencies and start the frontend from `frontend/`:

```bash
npm ci
npm run dev
```

In local development, Vite proxies `/api` requests to `http://localhost:8080` via `frontend/vite.config.ts`.

The frontend also supports `VITE_API_BASE_URL` and currently resolves API calls from:

```ts
import.meta.env.VITE_API_BASE_URL ?? "/api"
```

That means:

- local dev can use the Vite proxy and relative `/api`
- production builds can point to a full backend URL if needed

## Production Build

Build the frontend from `frontend/`:

```bash
npm ci
npm run build
```

This creates static files in `frontend/dist/`.

Build the backend from `backend/`:

```bash
./mvnw clean package
```

This creates the Spring Boot jar in `backend/target/`.

## Notes For This Repo

- frontend routes are defined with TanStack Router in `frontend/src/router.tsx`
- API access is centralized in `frontend/src/lib/api.ts`
- backend CORS is configured in `backend/src/main/java/ee/johan/budgetmaster/config/SecurityConfig.java`
- backend runs on port `5000` in the current production profile
