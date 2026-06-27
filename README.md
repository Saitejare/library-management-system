# Library Management System

A simple Express + MongoDB backend for managing library books, members, and borrowing records.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables by copying `.env`.

3. Start the app in development:

```bash
npm run dev
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/books`
- `GET /api/books/:id`
- `POST /api/books`
- `PUT /api/books/:id`
- `DELETE /api/books/:id`
- `GET /api/members`
- `GET /api/members/:id`
- `PUT /api/members/:id`
- `DELETE /api/members/:id`
- `GET /api/borrow`
- `POST /api/borrow`
- `POST /api/borrow/:id/return`
