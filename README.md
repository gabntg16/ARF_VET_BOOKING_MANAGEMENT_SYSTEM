# ARF Veterinary Clinic Booking System

A deployable veterinary clinic website with appointment booking, admin clinic management, client accounts, exportable reports, and a Node.js + MySQL REST API.

## Project Structure

```text
ArfVet/
|-- public/                    # Browser pages served in production
|   |-- index.html              # Public clinic site and booking
|   |-- staff-login.html        # Staff sign-in page
|   |-- vet-booking-app.html    # Admin/staff dashboard
|   `-- client-dashboard.html   # Client portal
|-- assets/
|   |-- css/arf-styles.css      # Shared dashboard/client styling
|   |-- images/                 # Clinic photos, logo, and icons
|   `-- js/
|       |-- database.js         # API client helpers
|       |-- auth.js             # Login/session helpers
|       `-- vet-booking-app.js  # Admin dashboard logic
|-- src/
|   |-- server.js               # Express app, static hosting, startup
|   |-- config/db.js            # MySQL connection pool
|   `-- routes/api.js           # REST API routes
|-- docs/                       # Setup, deployment, and capstone notes
|-- .env.example                # Environment template
|-- render.yaml                 # Render deployment blueprint
|-- package.json
`-- server.js                   # Production entry wrapper
```

The production app serves pages from `public/` and shared files from `/assets`.

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your MySQL credentials.

4. Start the app:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Default Access

Admin login:

```text
ID: admin
Password: admin123
```

Client accounts are created from the admin dashboard.

## Deployment

This is a standard Node.js app. Deploy the whole project folder to a Node-capable host, set the environment variables from `.env.example`, provide a MySQL database, and run:

```bash
npm install --production
npm start
```

Required environment variables:

```text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
DB_PORT
DB_SKIP_CREATE
DB_SSL
DB_SSL_REJECT_UNAUTHORIZED
```

On hosts like Render, `PORT` is set automatically. See `docs/DEPLOYMENT.md` for the full Render + Aiven MySQL guide.

## Notes For Clinic Use

- Change the admin password from the Settings page after setup.
- Use the Client Accounts page to issue client portal access.
- Keep MySQL backups enabled on your host.
- For real production security, replace the current plain password storage with hashed passwords before storing sensitive client data.
