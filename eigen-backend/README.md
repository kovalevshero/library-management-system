# Library Management System Backend (NestJS + Prisma DDD)

Backend RESTful API untuk sistem manajemen dan peminjaman buku perpustakaan yang dibangun menggunakan **NestJS**, **Prisma ORM**, dan **PostgreSQL**, dengan arsitektur **Domain-Driven Design (DDD)** serta dokumentasi lengkap **Swagger/OpenAPI**.

---

## Fitur dan Aturan Bisnis

1. **Peminjaman Buku (`POST /api/borrow`)**:
   - Member tidak boleh meminjam lebih dari 2 buku secara bersamaan.
   - Buku yang sedang dipinjam oleh member lain tidak dapat dipinjam (stok tersedia = total stok dikurangi peminjaman aktif).
   - Member yang sedang dalam masa sanksi penalti tidak diizinkan meminjam buku.

2. **Pengembalian Buku (`POST /api/borrow/return`)**:
   - Buku yang dikembalikan harus merupakan buku yang benar-benar sedang dipinjam oleh member tersebut.
   - Jika buku dikembalikan lebih dari 7 hari sejak tanggal pinjam, member dikenakan penalti berupa penangguhan hak pinjam selama 3 hari.

3. **Pengecekan Buku (`GET /api/books`)**:
   - Menampilkan seluruh buku beserta kuantitas stok total dan stok yang tersedia (`availableStock`). Buku yang sedang dipinjam tidak dihitung dalam kuantitas tersedia.

4. **Pengecekan Member (`GET /api/members`)**:
   - Menampilkan seluruh data member beserta jumlah buku yang sedang dipinjam oleh masing-masing member dan status penalti aktif.

---

## Arsitektur (Domain-Driven Design / DDD)

Struktur direktori memisahkan domain core dari framework dan database:

```
src/
├── domain/                    # Lapisan Domain murni (tanpa dependensi framework)
│   ├── entities/              # Book, Member, BorrowRecord (invariants & business rules)
│   ├── repositories/          # Interface repositori (IBookRepository, IMemberRepository, dll.)
│   └── exceptions/            # Domain exceptions (MemberPenalizedException, dll.)
├── application/               # Lapisan Use Cases / Orkestrasi bisnis
│   ├── use-cases/             # BorrowBookUseCase, ReturnBookUseCase, GetBooksUseCase, GetMembersUseCase
│   └── dtos/                  # Kontrak data transfer
├── infrastructure/            # Lapisan implementasi eksternal
│   ├── database/              # Prisma client & lifecycle
│   └── repositories/          # PrismaBookRepository, PrismaMemberRepository, PrismaBorrowRecordRepository
└── presentation/              # Lapisan Web & HTTP
    ├── controllers/           # BooksController, MembersController, BorrowController
    ├── dtos/                  # Request/Response DTOs dengan validasi dan dekorator Swagger
    └── filters/               # GlobalHttpExceptionFilter (mapping domain exception ke status code HTTP)
```

---

## Kebutuhan Sistem

- **Node.js**: v20+ atau v24+
- **pnpm**: v9+ atau v12+
- **PostgreSQL**: v14+ (atau menggunakan Docker)
- **Docker & Docker Compose** (opsional, untuk containerization)

---

## Panduan Instalasi dan Menjalankan Lokal

### 1. Kloning dan Pasang Dependensi
```bash
pnpm install
```

### 2. Konfigurasi Environment
Salin berkas `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Sesuaikan nilai `DATABASE_URL` jika menggunakan instance PostgreSQL lokal:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/library_db?schema=public"
```

### 3. Migrasi Database dan Seed Mock Data
Jalankan migrasi dan seeder untuk memasukkan data awal buku dan member:
```bash
pnpm prisma db push
pnpm prisma db seed
```

### 4. Menjalankan Aplikasi
```bash
# Mode pengembangan
pnpm start:dev

# Mode produksi
pnpm build
pnpm start:prod
```

Aplikasi akan berjalan pada `http://localhost:3000`.

---

## Dokumentasi API (Swagger / OpenAPI)

Setelah server berjalan, dokumentasi interaktif Swagger dapat diakses di:

**URL**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

Daftar Endpoint:
- `GET /api/books`: Menampilkan seluruh buku dan kuantitas tersedia.
- `GET /api/members`: Menampilkan seluruh member dan jumlah buku yang sedang dipinjam.
- `POST /api/borrow`: Meminjam buku (payload: `memberCode`, `bookCode`).
- `POST /api/borrow/return`: Mengembalikan buku (payload: `memberCode`, `bookCode`).

---

## Menjalankan Unit Testing

Proyek dilengkapi 8 test suites dengan 31 skenario pengujian komprehensif mencakup Domain Entities, Invariants, Use Cases, dan Controllers:

```bash
pnpm test
```

Untuk melihat cakupan kode (*coverage report*):
```bash
pnpm test:cov
```

---

## Menjalankan dengan Docker Compose

Untuk menjalankan seluruh stack (PostgreSQL dan API) dalam container terisolasi:

```bash
docker compose up --build -d
```

Docker Compose akan:
1. Menjalankan service PostgreSQL dan menunggu health check siap.
2. Membangun image NestJS API menggunakan multi-stage build.
3. Menjalankan migrasi database dan seeding data mock secara otomatis saat container booting.
4. Mengekspos API pada port `3000`.

Untuk menghentikan:
```bash
docker compose down
```

---

## Load Testing dengan k6

Skenario pengujian beban (*load testing*) menggunakan k6 mencakup:
- Ramp-up virtual users (10 hingga 20 VUs).
- Simulasi request `GET /api/books`, `GET /api/members`, serta alur peminjaman dan pengembalian buku.
- Ambang batas (threshold) p95 < 500ms dan error rate < 5%.

Jalankan pengujian beban via Docker:
```bash
pnpm test:load
```
Atau jika k6 terpasang secara lokal:
```bash
k6 run k6/load-test.js
```
