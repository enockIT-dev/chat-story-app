# Complete Deployment Guide

## Architecture
```
Frontend (Vercel) ←→ Backend (Render) ←→ Database (MongoDB Atlas)
```

---

## Step 1: Setup MongoDB Atlas (Database)

### Create Free MongoDB Cluster
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Sign up (free tier: 512MB storage)
3. Create organization and project
4. Click "Create" → Choose "M0 Free" tier
5. Configure as cloud database
6. Create database admin user:
   - Username: `chat_admin`
   - Password: Generate strong password
7. Whitelist IP:
   - Click "Network Access"
   - Add IP Address: `0.0.0.0/0` (allows all - for development)
8. Get Connection String:
   - Click "Connect" → "Drivers"
   - Copy connection string
   - Format: `mongodb+srv://chat_admin:PASSWORD@cluster0.xxxxx.mongodb.net/chat-story?retryWrites=true&w=majority`

**Save:** Connection string for backend setup

---

## Step 2: Deploy Backend on Render

### Push Backend to GitHub
```bash
git add .
git commit -m "Add backend setup"
git push origin backend-setup
```

### Deploy on Render
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New+" → "Web Service"
4. Select repository: `chat-story-app`
5. Fill in:
   - **Name:** `chat-story-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free

6. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://chat_admin:PASSWORD@cluster0.xxxxx.mongodb.net/chat-story
   JWT_SECRET=your_super_secret_key_12345
   FRONTEND_URL=https://chat-story-app.vercel.app
   NODE_ENV=production
   ```

7. Click "Create Web Service"
8. Wait for deployment (~2-3 minutes)
9. Copy backend URL: `https://chat-story-backend.onrender.com`

**Save:** Backend URL

---

## Step 3: Update Frontend with Backend URL

### Create `.env.local` in Frontend Root
```
VITE_API_URL=https://chat-story-backend.onrender.com
VITE_SOCKET_URL=https://chat-story-backend.onrender.com
```

### Or Setup in Vercel
1. Go to Vercel project settings
2. Environment Variables
3. Add:
   - `VITE_API_URL=https://chat-story-backend.onrender.com`
   - `VITE_SOCKET_URL=https://chat-story-backend.onrender.com`

### Create Frontend API Service
Create `src/services/api.js`:
```javascript
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

export default api;
```

### Use in React Components
```javascript
import api, { socket } from '@/services/api';

// Login
const loginUser = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};

// Socket events
socket.on('receive_message', (data) => {
  console.log('New message:', data);
});
```

---

## Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New" → "Project"
4. Import `chat-story-app` repository
5. Configure:
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

6. Add Environment Variables:
   ```
   VITE_API_URL=https://chat-story-backend.onrender.com
   VITE_SOCKET_URL=https://chat-story-backend.onrender.com
   ```

7. Click "Deploy"
8. Wait for deployment (~5 minutes)
9. Get frontend URL: `https://chat-story-app.vercel.app`

---

## Step 5: Test Everything

### Backend Health Check
```
GET https://chat-story-backend.onrender.com/api/health
```

### Register User
```bash
curl -X POST https://chat-story-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get Stories
```bash
curl https://chat-story-backend.onrender.com/api/stories
```

### Frontend Access
Open: `https://chat-story-app.vercel.app`

---

## Troubleshooting

### Backend Won't Deploy
- Check `package.json` exists in `backend/` folder
- Ensure all npm dependencies are correct
- Check logs in Render dashboard

### Frontend Can't Connect to Backend
- Check backend URL in Vercel environment variables
- Verify MongoDB connection in Render logs
- Test API endpoint directly in browser

### MongoDB Connection Error
- Verify connection string in `.env`
- Check IP whitelist allows `0.0.0.0/0`
- Test connection locally first

### Socket.io Connection Issues
- Ensure backend URL doesn't have trailing slash
- Check CORS settings in `server.js`
- Verify frontend imports correct socket

---

## Environment Variables Summary

### MongoDB Atlas
- URL: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### Render (Backend)
```
MONGODB_URI=<from MongoDB Atlas>
JWT_SECRET=your_secret_key
FRONTEND_URL=https://chat-story-app.vercel.app
NODE_ENV=production
```

### Vercel (Frontend)
```
VITE_API_URL=https://chat-story-backend.onrender.com
VITE_SOCKET_URL=https://chat-story-backend.onrender.com
```

---

## Live URLs (After Deployment)

- **Frontend:** https://chat-story-app.vercel.app
- **Backend API:** https://chat-story-backend.onrender.com
- **Database:** MongoDB Atlas Cloud

---

## Monitoring & Maintenance

### Vercel Dashboard
- Real-time analytics
- Error tracking
- Deployment history

### Render Dashboard
- Log streaming
- Restart service
- Update environment variables

### MongoDB Atlas
- Monitor database usage
- Backup settings
- Performance metrics

---

## Next Steps
1. Merge `backend-setup` branch to `main`
2. Setup database and deploy
3. Test all features
4. Add more features as needed

