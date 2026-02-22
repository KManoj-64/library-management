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
