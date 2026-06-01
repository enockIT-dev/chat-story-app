# Deployment Guide

This repository is ready for production deployment. The live URL is not stored in the codebase, but these files show the current deployment setup and the service metadata found in the workspace.

## What is already configured

- `frontend/.vercel/project.json` — Vercel project metadata for the frontend
- `backend/.vercel/project.json` — Vercel project metadata for the backend
- `frontend/vercel.json` — Vercel frontend routing/build config
- `render.yaml` — Render backend service configuration
- `netlify.toml` — Netlify frontend static publish config
- `.github/workflows/netlify-deploy.yml` — GitHub Actions workflow to build and deploy frontend to Netlify
- `frontend/.env.example` — example frontend environment variables
- `backend/.env.example` — example backend environment variables

## Frontend deployment options

### Option 1: Netlify via GitHub Actions
1. Add the following GitHub repository secrets:
   - `VITE_API_URL` → `https://<your-backend-url>/api`
   - `VITE_SOCKET_URL` → `https://<your-backend-url>`
   - `NETLIFY_AUTH_TOKEN`
   - `NETLIFY_SITE_ID`
2. Push to the `master` branch.
3. GitHub Actions will build `frontend` and deploy `frontend/dist` to Netlify.

### Option 2: Vercel
1. Use the existing Vercel project metadata under `frontend/.vercel/project.json`.
2. Set build environment variables in the Vercel project:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`
3. Deploy the frontend project.

## Backend deployment options

### Option 1: Render
1. Create a Render Web Service using `render.yaml` and root `backend`.
2. Add environment variables:
   - `PORT`
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `JWT_SECRET`
   - `CLIENT_URL` = frontend URL

### Option 2: Vercel
1. Use the existing Vercel project metadata under `backend/.vercel/project.json`.
2. Add environment variables in the Vercel backend project.

## Required environment variables

### Backend `.env`

- `PORT=5000`
- `DB_HOST=your_mysql_host`
- `DB_USER=your_mysql_user`
- `DB_PASSWORD=your_mysql_password`
- `DB_NAME=chatapp`
- `JWT_SECRET=your_secret_key`
- `CLIENT_URL=https://your-frontend-url`

### Frontend `.env`

- `VITE_API_URL=https://your-backend-url/api`
- `VITE_SOCKET_URL=https://your-backend-url`

## Important notes

- The app stores uploaded files in `backend/uploads`. This is ephemeral on Render and Vercel, so for production use a cloud storage provider.
- The exact live domain is determined by the hosting service and is not tracked in source control.
- If you want the current live site URL, open the Vercel/Render/Netlify dashboard for the linked projects.
