# MERN Real-Time Chat & Story App

A full-stack social app with real-time messaging, ephemeral stories (24h), notifications, and online user tracking.

## Tech Stack

| Layer    | Technologies                                      |
|----------|---------------------------------------------------|
| Frontend | React, Vite, Tailwind CSS, Axios, Socket.IO Client, React Router, React Hot Toast |
| Backend  | Node.js, Express, MySQL, Socket.IO, JWT, Multer   |

## Project Structure

```
chat-story-app/
├── backend/          # Express API + Socket.IO server
├── frontend/         # React (Vite) client
└── README.md
```

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

Create the database and tables:

```bash
mysql -u root -p < backend/database/schema.sql
```

Or open `backend/database/schema.sql` in MySQL Workbench and run it.

### 2. Backend

```bash
cd backend
npm install
```

Edit `backend/.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=chatapp
JWT_SECRET=your_secret_key
```

Start the server:

```bash
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`

## API Routes

### Authentication
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user (protected)

### Users
- `GET /api/users` — List users
- `GET /api/users/:id` — Get user
- `PUT /api/users/:id` — Update profile
- `POST /api/users/:id/follow` — Follow user
- `DELETE /api/users/:id/follow` — Unfollow

### Messages
- `GET /api/messages/conversations` — List conversations
- `POST /api/messages` — Send message
- `GET /api/messages/:conversationId` — Get messages

### Stories
- `POST /api/stories` — Upload story (multipart)
- `GET /api/stories` — List active stories
- `DELETE /api/stories/:id` — Delete story
- `POST /api/stories/:id/like` — Like story
- `POST /api/stories/:id/comment` — Comment on story

### Notifications
- `GET /api/notifications` — List notifications
- `PUT /api/notifications/:id/read` — Mark one read
- `PUT /api/notifications/read-all` — Mark all read

## Socket.IO Events

| Event            | Direction   | Description              |
|------------------|-------------|--------------------------|
| `setup`          | Client → Server | Join with user info  |
| `sendMessage`    | Client → Server | Send chat message    |
| `receiveMessage` | Server → All    | Broadcast message    |
| `typing`         | Client → Server | Typing indicator     |
| `userOnline`     | Server → All    | User came online     |
| `userOffline`    | Server → All    | User disconnected    |

## Development Phases

1. **Phase 1** — Backend, frontend, MySQL connection
2. **Phase 2** — JWT authentication
3. **Phase 3** — Real-time chat with Socket.IO
4. **Phase 4** — Stories with image upload
5. **Phase 5** — Notifications and online users
6. **Phase 6** — UI polish and deployment

## Deployment

| Service   | Platform suggestions      |
|-----------|---------------------------|
| Frontend  | Vercel                    |
| Backend   | Render                    |
| Database  | PlanetScale, ClearDB, or any MySQL provider |

### Deploy frontend to Vercel

1. In Vercel, create a new project from the `frontend` folder.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add environment variables:
   - `VITE_API_URL=https://<your-render-backend>.onrender.com/api`
   - `VITE_SOCKET_URL=https://<your-render-backend>.onrender.com`
4. Deploy the site.

### Deploy backend to Render

1. Create a new Web Service on Render.
2. Connect your repository and set the root directory to `backend`.
3. Set the build command to `npm install` and the start command to `npm start`.
4. Add environment variables:
   - `PORT=5000`
   - `DB_HOST=<your-mysql-host>`
   - `DB_USER=<your-mysql-user>`
   - `DB_PASSWORD=<your-mysql-password>`
   - `DB_NAME=<your-mysql-database>`
   - `JWT_SECRET=<your-jwt-secret>`
   - `CLIENT_URL=https://<your-vercel-app>.vercel.app`
5. Deploy the service.

### MySQL database options

Use a hosted MySQL database for production. Recommended providers:
- PlanetScale
- ClearDB
- AWS RDS
- Azure Database for MySQL
- JawsDB

After creating the database, run the SQL schema from `backend/database/schema.sql`.

### Important notes

- `backend/uploads` is local storage. On Render, the filesystem is ephemeral, so uploaded files are not permanent. For production, replace this with cloud storage like AWS S3 or DigitalOcean Spaces.
- Use your Render backend URL in frontend environment variables.

## Future Features

- Group chat
- Voice / video calls
- Message reactions
- Dark mode toggle
- Push notifications
- End-to-end encryption
