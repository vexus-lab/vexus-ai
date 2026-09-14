# VEXUS V2.2 Full Stack — PostgreSQL Ready

VEXUS keeps the original Arabic RTL frontend and secure Node/Express backend, but replaces SQLite with PostgreSQL so user accounts and subscription data are not tied to the web server filesystem.

## Environment
Required:
- `DATABASE_URL`
- `JWT_SECRET`

Optional:
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_SUCCESS_URL`
- `STRIPE_CANCEL_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `SEED_GIFT_CODES`

## Local
```bash
npm install
node backend/seed.js
npm start
```
Open `http://localhost:8787`.

## Render
Create a PostgreSQL database and a Node Web Service. Set:
- Build Command: `npm install`
- Start Command: `npm start`
- `DATABASE_URL`: use the PostgreSQL connection string
- `JWT_SECRET`: long random secret
- add Gemini/Stripe secrets only when configured.

Do not set the old `DB_PATH`; this release does not use SQLite.

## Persistence
Render's web service can sleep on its free tier, but application data is stored in PostgreSQL rather than the web service filesystem. The server can wake up and reconnect to the same database without deleting users.
