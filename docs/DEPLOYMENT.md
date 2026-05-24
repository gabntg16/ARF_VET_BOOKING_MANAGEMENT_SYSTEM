# ARF Vet Online Deployment Guide

This app needs two online services:

1. A Node.js web host for the ARF website and API.
2. A hosted MySQL database for appointments, clients, patients, and staff data.

GitHub Pages is not enough for this project because GitHub Pages only hosts static files. ARF Vet uses `server.js` and MySQL, so it needs a Node-capable host.

## Recommended Free School Setup

- Web app: Render Web Service
- Database: Aiven for MySQL free service

## Step 1: Create The MySQL Database

1. Create an Aiven account.
2. Create a free MySQL service.
3. Open the service connection details.
4. Copy these values:
   - Host
   - Port
   - User
   - Password
   - Database name

Use `Arf_db` as the database name when the provider lets you choose the name. If the provider gives you a different database name, use that exact name in Render.

## Step 2: Deploy The Web App On Render

1. Push the latest project to GitHub.
2. Open Render and create a new Web Service.
3. Connect this GitHub repository:
   `gabntg16/ARF_VET_BOOKING_MANAGEMENT_SYSTEM`
4. Use these settings:
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Branch: `main`

## Step 3: Add Environment Variables In Render

Add these in Render's Environment tab:

```text
DB_HOST=your_aiven_mysql_host
DB_USER=your_aiven_mysql_user
DB_PASSWORD=your_aiven_mysql_password
DB_NAME=your_database_name
DB_PORT=your_database_port
DB_SKIP_CREATE=true
DB_SSL=true
DB_SSL_REJECT_UNAUTHORIZED=true
NODE_ENV=production
```

Render sets `PORT` automatically. Do not put passwords directly in GitHub files.

## Step 4: Open The Website

After Render finishes deploying, open the Render website URL. The app should load the same pages as local development:

- Public booking website: `/`
- Staff login: `/staff-login.html`
- Admin dashboard: `/vet-booking-app.html`

## Important Notes

- Change the default admin password after deployment.
- Keep the database password private.
- For a real clinic, use hashed passwords and stronger authentication before storing sensitive client records.
