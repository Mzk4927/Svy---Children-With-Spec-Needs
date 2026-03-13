# Special Needs Evaluation Platform

Full-stack web application for evaluating children with special needs, managing records, assigning support categories/tools, and generating printable medical reports.

## Tech Stack

- Frontend: React 18, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express
- Database: PostgreSQL (Neon cloud)
- ORM: Prisma
- Auth: JWT
- File Uploads: Multer (served via /uploads)

## Core Features

- Role-based login (Admin, Viewer)
- Child record management (create, update, delete)
- Category assignment per child (tags)
- Admin can create custom categories
- Built-in system categories (wheelchair, crutches, hearing aid, referrals, etc.)
- Dashboard analytics:
	- Total children
	- Age groups
	- Referral distribution
	- Equipment/tool distribution
- Report view + print PDF layout
- Child photo upload and image rendering in reports
- Record comments/reviews on reports

## Project Structure

```text
special-needs-app/
	client/                # React frontend
	server/                # Express + Prisma backend
	scripts/               # Root utility scripts (seed, backup)
	docker/                # Docker files (optional)
```

## Prerequisites

- Node.js 18+ recommended
- npm 9+
- PostgreSQL connection (Neon or local)

## Environment Variables

### Server (.env)

Create/update server/.env with:

```env
PORT=5000
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

### Client (.env)

Create/update client/.env with:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Installation

### 1) Install backend dependencies

```powershell
cd D:\zarar_project\special-needs-app\server
npm install
```

### 2) Install frontend dependencies

```powershell
cd D:\zarar_project\special-needs-app\client
npm install
```

## Database Setup

Sync Prisma schema to database:

```powershell
cd D:\zarar_project\special-needs-app\server
npx prisma db push --skip-generate
```

Optional tools:

```powershell
npx prisma studio
npx prisma migrate status
```

## Seed Demo Users

Two supported seed scripts are available.

### Option A (recommended, root script)

```powershell
cd D:\zarar_project\special-needs-app
node scripts/seedData.js
```

### Option B (server script)

```powershell
cd D:\zarar_project\special-needs-app\server
node scripts/seed.js
```

Demo credentials:

- Admin: admin@example.com / admin123
- Viewer: viewer@example.com / viewer123

## Run the App

Use two terminals.

### Terminal 1: Backend

```powershell
cd D:\zarar_project\special-needs-app\server
npm run dev
```

Expected startup logs include:

- Connected to cloud PostgreSQL database
- Server running on port 5000

### Terminal 2: Frontend

```powershell
cd D:\zarar_project\special-needs-app\client
npm start
```

App URL:

- Frontend: http://localhost:3000
- Backend health: http://localhost:5000/health

## Build Frontend

```powershell
cd D:\zarar_project\special-needs-app\client
npm run build
```

## Backup Data

```powershell
cd D:\zarar_project\special-needs-app
node scripts/backup.js
```

Backups are saved under scripts/backups.

## API Summary

Auth:

- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/refresh

Records:

- GET /api/records
- POST /api/records
- PUT /api/records/:id
- DELETE /api/records/:id
- GET /api/records/:id/reviews
- POST /api/records/:id/reviews

Categories:

- GET /api/categories
- POST /api/categories (admin)

Stats:

- GET /api/stats

Upload:

- POST /api/upload/image
- Static files: /uploads/:filename

## Troubleshooting

### 1) npm command fails with package.json not found

Reason: command executed from wrong folder.

Fix:

- Run commands from server or client folders
- Or use npm --prefix with absolute path

### 2) Dashboard shows zero after navigation

Fixed by global records cache in frontend context.

If still seen:

- Clear browser local storage once
- Login again
- Click Refresh Data

### 3) Report image is broken

Checklist:

- Re-upload image for old records with legacy file names
- Ensure backend is running
- Open image URL directly: http://localhost:5000/uploads/<filename>

### 4) Prisma migrate asks for reset

If your migration history changed, prefer:

```powershell
npx prisma db push --skip-generate
```

to avoid data loss in active environments.

## Notes

- Current setup is optimized for local development on Windows.
- For production, use strong JWT secrets, HTTPS, and proper process management.

