# Campus Parking Booking System

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    cd server && npm install
    cd ../client && npm install
    ```

2.  **Environment Variables**:
    *   Create `server/.env` with the following:
    ```env
    ORACLE_USER=your_username
    ORACLE_PASSWORD=your_password
    ORACLE_HOST=localhost
    ORACLE_PORT=1521
    ORACLE_SID=xe
    JWT_SECRET=your_secure_secret
    STRIPE_SECRET_KEY=sk_test_placeholder
    ```

3.  **Database Setup**:
    *   Ensure your Oracle Database is running.
    *   Run the seed script to populate the database:
    ```bash
    cd server
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
*   **Admin**: Login (admin/admin123) and Dashboard.

## Tech Stack

*   **Frontend**: React, Vite, Tailwind CSS, TypeScript.
*   **Backend**: Node.js, Express, TypeORM (Oracle DB), TypeScript.

