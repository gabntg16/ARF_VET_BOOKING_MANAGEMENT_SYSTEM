# 🔥 MySQL Setup Guide — ARF Vet Booking System

Your ARF veterinary clinic booking system now uses a Node.js backend with a MySQL database. This guide walks you through setting up the backend and connecting the frontend.

## 1. Install MySQL

1. Install MySQL Community Server on your machine.
2. Create a database named `arf_vet`, or use the default name from `.env.example`.
3. Optionally create a dedicated MySQL user for this project.

## 2. Configure environment variables

1. Copy `.env.example` to `.env`.
2. Set your MySQL connection values.

Example `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=arf_vet
DB_PORT=3306
API_PORT=3000
```

## 3. Install backend dependencies

From the project root:

```bash
npm install
```

## 4. Start the backend

```bash
npm start
```

The backend will:
- create the `arf_vet` database if it does not exist
- create required tables if they do not exist
- expose REST API endpoints at `http://localhost:3000/api`

## 5. Run the frontend

Open `index.html` in a browser or serve the project with a local web server.

## 6. API endpoints

The backend exposes REST routes for the app:
- `GET /api/clients`
- `GET /api/clients/:email`
- `POST /api/clients`
- `PUT /api/clients/:email`
- `DELETE /api/clients/:email`
- `GET /api/appointments`
- `GET /api/appointments/client/:email`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `GET /api/vets`
- `POST /api/vets`
- `PUT /api/vets/:id`
- `DELETE /api/vets/:id`
- `GET /api/patients`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `GET /api/settings`
- `PUT /api/settings/admin`
