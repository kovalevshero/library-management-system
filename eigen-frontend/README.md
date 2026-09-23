# Library Management System - React Frontend

A production-grade, Clean Architecture frontend application built with React, TypeScript, and Ant Design for managing library book loans, returns, member quotas, and penalties.

## Technology Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **UI Component Library**: [Ant Design (v5)](https://ant.design/) + [@ant-design/icons](https://ant.design/components/icon)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Testing**: [Jest](https://jestjs.io/) + [@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/) + [ts-jest](https://kulshekhar.github.io/ts-jest/)
- **Package Manager**: [pnpm](https://pnpm.io/) in workspace monorepo

---

## Clean Architecture Structure

This project strictly follows the Clean Architecture design pattern, separating business logic from UI frameworks and transport protocols:

```
src/
├── domain/                         # Enterprise & Business Rules (Pure TypeScript)
│   ├── entities/                   # Book, Member, BorrowRecord
│   └── repositories/               # Repository interfaces (IBookRepository, IMemberRepository, IBorrowRepository)
├── application/                    # Application Use Cases
│   └── use-cases/                  # GetBooksUseCase, GetMembersUseCase, BorrowBookUseCase, ReturnBookUseCase
├── infrastructure/                 # External Implementations
│   ├── api/                        # Axios client & error interceptor
│   ├── dtos/                       # API request & response contracts
│   ├── repositories/               # HttpBookRepository, HttpMemberRepository, HttpBorrowRepository
│   └── di/                         # Dependency injection container / service registry
└── presentation/                   # UI Layer
    ├── components/                 # Ant Design reusable components (Navbar, StatCard, Modals)
    ├── hooks/                      # Custom ViewModel hooks (useBooks, useMembers, useBorrowOperations)
    ├── pages/                      # Views (BooksCatalogPage, MembersPage, BorrowManagementPage)
    ├── theme/                      # Ant Design theme tokens & contrast styling
    ├── App.tsx                     # Main layout shell with ConfigProvider
    └── main.tsx                    # React DOM entry point
```

---

## Features & Business Rules Implemented

1. **Book Catalog (`/api/books`)**
   - Displays all registered books: Code, Title, Author, Total Stock, and Available Stock.
   - Books currently on loan are automatically deducted from available stock.
   - Real-time search across titles, authors, and book codes.
   - Filter to show only in-stock titles.
   - Row-level "Borrow" action, disabled when available stock is 0.

2. **Member Directory (`/api/members`)**
   - Lists all library members, current active borrow count, and penalty status.
   - Live badge indicators showing borrow quota (max 2 books).
   - Penalty tracking: displays penalty expiry date and disables new loans while penalized.
   - Quick action to process book returns.

3. **Borrow & Return Operations (`/api/borrow` and `/api/borrow/return`)**
   - Instant client-side validation against all 3 core borrow rules:
     - Member has not exceeded 2 books.
     - Book has available inventory.
     - Member is not under active penalty.
   - Returns policy: automated notification when return is overdue (> 7 days), applying a 3-day suspension.
   - Real-time transaction history log for the current session.

---

## Getting Started

### 1. Installation

From the monorepo root:
```bash
pnpm install
```

Or from the `eigen-frontend` directory:
```bash
cd "eigen-frontend"
pnpm install
```

### 2. Running Locally

Make sure the NestJS backend is running on `http://localhost:3000`:
```bash
# Terminal 1: Start backend
cd ../eigen-backend
pnpm start:dev

# Terminal 2: Start frontend
cd ../eigen-frontend
pnpm dev
```

The frontend will run on `http://localhost:5173`. API requests to `/api` are automatically proxied to `http://localhost:3000`.

### 3. Running Tests

Execute the Jest test suite:
```bash
pnpm test
```

Run test suite with coverage report:
```bash
pnpm test:coverage
```

### 4. Production Build

Verify type checking and produce an optimized production bundle:
```bash
pnpm build
```

---

## Antislop Compliance

Built according to strict Antislop design and engineering principles:
- **Design Dials**: ENERGY 2 / RHYTHM 2 / MOTION 1.
- No decorative emojis in buttons or headings.
- Real statistics and metrics only (no fake percentages or fabricated user avatars).
- Clear, descriptive empty, loading, and error states with actionable retry handlers.
- Accessible color palette compliant with WCAG AA contrast standards.
- Clean, concise code comments documenting domain logic without AI filler.
