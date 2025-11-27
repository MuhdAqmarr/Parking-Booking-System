# Campus Parking Booking System

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Environment Variables**:
    *   `server/.env` is already set up with default values.
    *   `DATABASE_URL="file:./dev.db"`
    *   `JWT_SECRET="supersecretkey"`
    *   `STRIPE_SECRET_KEY="sk_test_placeholder"`

3.  **Database Setup**:
    ```bash
    cd server
    npx prisma migrate dev --name init
    npm run seed
    ```

4.  **Run Application**:
    From the root directory:
    ```bash
    npm run dev
    ```
    *   Frontend: http://localhost:5173
    *   Backend: http://localhost:3000

## Features

*   **Public Reservation**: Multi-step booking flow for Students, Staff, and Visitors.
*   **Ticket View**: View and print parking permits.
*   **Fines**: Search and pay parking fines (Stripe integration mock).
*   **Admin**: Login (admin/admin123) and Dashboard placeholder.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, TypeScript.
*   **Backend**: Node.js, Express, Prisma (SQLite), TypeScript.
