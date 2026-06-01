# TODO

- [ ] Deploy backend on Render (configure env vars + verify API health at `/`).
- [ ] Provision Aiven MySQL (create database + run `backend/database/schema.sql`).
- [ ] Set Render DB env vars (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- [ ] Set Render JWT env var (`JWT_SECRET`).
- [ ] Set Render CORS env var (`CLIENT_URL` = your Vercel frontend URL).
- [ ] Deploy frontend on Vercel (build Vite app).
- [ ] Set Vercel env vars (build-time): `VITE_API_URL` and `VITE_SOCKET_URL` pointing to Render backend.
- [ ] Smoke test: login/register + authenticated REST calls.
- [ ] Smoke test: Socket.IO connection + send/receive message + typing/notifications.
- [ ] If MySQL fails on Render/Aiven: check if Aiven requires SSL and update `backend/config/db.js` accordingly.

