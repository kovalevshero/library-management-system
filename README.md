# Library Management System

A fullstack Library Management System monorepo built using **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

## 🚀 Tech Stack

- **Monorepo**: [pnpm Workspaces](https://pnpm.io/workspaces)
- **Backend**: [NestJS](https://nestjs.com/), [TypeScript](https://www.typescriptlang.org/), [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/), [Docker](https://www.docker.com/), [Swagger (OpenAPI)](https://swagger.io/)
- **Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Ant Design v5](https://ant.design/), [Vite](https://vitejs.dev/), [Axios](https://axios-http.com/), [Jest](https://jestjs.io/) & React Testing Library

---

## 📁 Monorepo Structure

```text
library-management-system/
├── backend/                # NestJS backend API with Prisma ORM & PostgreSQL
│   ├── prisma/             # Prisma schema, migrations, and database seed
│   ├── src/
│   │   ├── domain/         # Enterprise business rules & entities (Book, Member, BorrowRecord)
│   │   ├── application/    # Application use cases (borrow, return, check loans, etc.)
│   │   ├── infrastructure/ # Prisma repositories, database services
│   │   └── presentation/   # NestJS controllers & DTOs
│   ├── test/               # Unit, integration, and e2e tests
│   └── docker-compose.yml  # Docker compose configuration for API and PostgreSQL
├── frontend/               # React SPA built with Ant Design v5 & Clean Architecture
│   ├── src/
│   │   ├── domain/         # Domain entities and repository contracts
│   │   ├── application/    # Application use cases
│   │   ├── infrastructure/ # HTTP repositories, Axios client, DI container
│   │   └── presentation/   # Ant Design pages, components, hooks
│   └── tests/              # Jest unit tests for use cases, entities, and components
├── package.json            # Root workspace scripts
├── pnpm-workspace.yaml     # pnpm workspace definition
└── README.md
```

---

## ✨ Features & Business Rules

1. **Books Catalog**:
   - Lists all books with code, title, author, and available stock.
   - Books currently borrowed by members are excluded from available stock.

2. **Member Management**:
   - Lists all registered members with their current borrowed book counts.
   - Tracks member penalty status and penalty expiration timestamps.

3. **Borrowing Policy**:
   - Members may borrow up to **2 books** at a time.
   - Members currently under penalty cannot borrow any books.
   - Books cannot be borrowed if already borrowed by another member.

4. **Return Policy & Late Penalties**:
   - Books returned after more than **7 days** automatically incur a **3-day penalty**.
   - Return modal dynamically filters books to only show those currently borrowed by the selected member.

5. **Transaction Activity Logs**:
   - Persistent transaction logs stored in PostgreSQL and retrieved via `GET /api/borrow/history`.
   - Scroll-based infinite loading and manual "Load More" pagination in the frontend Recent Activity feed.

---

## 🛠️ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (v9+)
- [Docker](https://www.docker.com/) & Docker Compose

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/kovalevshero/library-management-system.git
cd library-management-system
pnpm install
```

### 2. Start Backend (Docker)
```bash
cd backend
docker compose up -d --build
```
- API Server: `http://localhost:3000`
- Swagger Documentation: `http://localhost:3000/api/docs`

### 3. Start Frontend
```bash
cd ../frontend
pnpm dev
```
- Frontend UI: `http://localhost:5173`

---

## 🧪 Testing

### Frontend Tests
```bash
pnpm --filter frontend test
```

### Backend Tests
```bash
pnpm --filter backend test
```

---

## 📄 License
MIT
