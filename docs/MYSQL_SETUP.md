# MySQL Setup Guide — ARF Vet Booking System

This project now uses a Node.js + Express backend with a MySQL database.

## 1. Install MySQL

1. Install MySQL Community Server on your machine.
2. Create a database named `Arf_db`, or use the default database name from `.env.example`.
3. Optionally create a dedicated MySQL user for this project.

## 2. Configure environment variables

1. Copy `.env.example` to `.env`.
2. Set your MySQL credentials and port values.

Example `.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=Arf_db
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

The server will:
- create the database if it does not exist
- create required tables if they do not exist
- provide REST API endpoints on `http://localhost:3000/api`

## 5. Run the frontend

Open `index.html` in a browser or serve the project over a local web server.
### Override the API base URL

If your backend runs on a different host or path, set `window.API_BASE_URL` before loading `assets/js/database.js`.

```html
<script>
  window.API_BASE_URL = 'http://localhost:3000/api';
</script>
<script src="assets/js/database.js"></script>
```

For pages under `pages/` use the relative path:

```html
<script>
  window.API_BASE_URL = 'http://localhost:3000/api';
</script>
<script src="../assets/js/database.js"></script>
```
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
