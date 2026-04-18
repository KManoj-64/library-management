# Library Management System

Full-stack Library Management System with a Node/Express/MongoDB backend and a React/Vite frontend.

## Project Structure

- backend: REST API, auth, transactions, cron reminders
- frontend1: React UI for admin and student flows

## Setup

### Backend

1. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

2. Create .env:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_gmail_address
   EMAIL_PASS=your_gmail_app_password
   FRONTEND_URL=http://localhost:5173
   PORT=5000
   ```

3. Run the API:

   ```bash
   node server.js
   ```

Optional seed:

```bash
node seed.js
```

### Frontend

1. Install dependencies:

   ```bash
   cd frontend1
   npm install
   ```

2. Create .env:

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

## Notes

- The backend cron job runs daily at midnight and sends reminders for books due in 2 days.
