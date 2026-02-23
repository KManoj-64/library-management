# Library Management System (minimal scaffold)

Structure:

- `server/` - Express API + MongoDB (mongoose)
- `client/` - static pages, scripts, and CSS

Quick start:

1. Ensure MongoDB is running locally (default `mongodb://localhost:27017`) or update `MONGODB_URI` in `server/.env`.

2. Open a terminal in `server/` and run:

```bash
npm install
npm start
```

3. Open http://localhost:3000 in your browser.

Notes:
- This scaffold uses MongoDB with mongoose for data persistence.
- Authentication uses JWT. Set `JWT_SECRET` in `server/.env` for production.
- Replace with a hosted DB (e.g., MongoDB Atlas) and production auth flow when deploying.
- On first run with an empty database, seed creates demo users and 15 sample books.

Security features:
- Password hashing with `bcrypt`.
- JWT authentication with protected routes.
- Role-based access control for librarian-only endpoints.
- Input validation and sanitization middleware for auth/books/transactions.
- Duplicate book prevention by ISBN or title+author.
- Centralized not-found and error handling middleware.

Email setup (SMTP):
- Copy `server/.env.example` to `server/.env` and fill SMTP fields.
- Required keys: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.
- For Gmail, use an App Password (not your normal account password).
- Borrow and return actions trigger email notifications.

Demo users:
- Admin (librarian): `admin` / `admin123`
- Student: `student1` / `password123`
- Student: `student2` / `password456`
