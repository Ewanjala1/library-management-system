# Library Management System

A NestJS + Prisma + SQLite backend for a library's book catalog.

## Getting started

From the repository root, install the dependencies and configure the local SQLite
database:

```powershell
npm install
if (!(Test-Path .env)) { Copy-Item api/.env.example .env }
```

The example configures SQLite at `api/prisma/dev.db`, so no database server or
credentials are needed for local development. Keep an existing `.env`; do not
overwrite it with the example. Then generate the client, apply the checked-in
migrations, and load the sample data:

```powershell
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

Use `npm run prisma:migrate:status` to check migration state. For a deployed
environment, apply checked-in migrations with `npm run prisma:migrate:deploy`;
do not use the development migration command in production.

The NestJS server listens on port `3000` by default (or the value of `PORT`).
`GET /` returns a basic status response. `PrismaModule` provides `PrismaService`
for application modules that need database access.

The Prisma schema, initial migration, and seed script live in `api/prisma/`,
with Prisma CLI settings in the root `prisma.config.ts`. The seed script is
idempotent (it uses `upsert`), so running it again will not create duplicates.
It inserts 5 genres, 18 books, 2 users (one `LIBRARIAN`, one `PATRON`) and a
few sample reviews.

## Schema Decisions

### Why `Book` references `Genre` instead of embedding it

A `Book` stores a `genreId` foreign key with a `@relation` to a separate `Genre` table, rather than copying the genre's name (or the whole genre object) into every book row. The reasons:

1. **A genre is shared, not owned.** Many books belong to the same genre, and a genre exists independently of any one book. Embedding is a good fit for data that belongs to a single parent and is always read with it. Genre is the opposite: it is a shared entity.
2. **One source of truth.** Renaming "Science Fiction" to "Sci-Fi", or fixing a typo, is a single-row update. With an embedded copy, every book would need updating, and any missed row would leave the catalog inconsistent (for example "Sci-Fi" and "Science Fiction" as separate genres).
3. **Referential integrity.** SQLite enforces the foreign key, so a book can never point at a genre that doesn't exist. The relation uses `onDelete: Restrict`, so a genre that still has books cannot be deleted by accident.
4. **Efficient queries.** "All books in a genre" is an indexed lookup on `Book.genreId` (`@@index([genreId])`), and "list all genres" is a small table scan instead of a distinct query over every book.
5. **Room to grow.** Because `Genre` is its own table, it can carry its own fields (here, a `description`) and gain more later, such as a cover image or a parent genre, without touching `Book`.

**Trade-off:** reading a book together with its genre needs a join, written in Prisma as `include: { genre: true }`. For a catalog this size that cost is negligible compared to the consistency benefit.

### Other decisions

- **`Role` enum (`PATRON`, `LIBRARIAN`)** on `User`, defaulting to `PATRON`. An enum restricts the column to valid values at the database level and makes role checks type-safe in TypeScript.
- **`Book.isbn` is unique.** It prevents duplicate catalog entries and is used as the natural key for idempotent seeding.
- **`copiesAvailable` has a default of 1** so a newly added book is always borrowable.
- **`Review` (stretch)** links a `User` to a `Book` and carries its own fields (`rating`, `comment`). `@@unique([bookId, userId])` allows one review per user per book. Deleting a book or user cascades to their reviews.
- **Integer auto-increment IDs** keep the schema simple for this project. UUIDs would be a better choice if IDs were exposed publicly or generated across services.

## Prisma vs. a document database

Modeling this in Prisma felt different from a document database in one key way: the relationship is part of the schema, not a convention. In MongoDB I would have been tempted to embed the genre inside each book document, or to store a genre ID as a plain field that nothing checks. In Prisma I had to declare the relation explicitly, and SQLite then enforced it with a real foreign key. A bad `genreId` is rejected, genres can't be deleted out from under their books, and the schema changes through migrations rather than by writing documents in a new shape.
