# Team Task Manager

A production-style Team Task Manager web application built for a full-stack assignment. It uses a Next.js App Router frontend, an Express REST API, PostgreSQL, Prisma, JWT authentication, role-based project permissions, and Railway-ready deployment settings.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, shadcn-style components
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT, bcrypt
- API handling: Axios
- Deployment: Railway

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment files:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env.local
   ```

3. Update `apps/api/.env` with your PostgreSQL connection string.

4. Start PostgreSQL locally, or use any hosted PostgreSQL connection:

   ```bash
   docker compose up -d
   ```

5. Run Prisma migrations:

   ```bash
   npm run prisma:migrate -w apps/api
   npm run prisma:seed -w apps/api
   ```

6. Start both apps:

   ```bash
   npm run dev
   ```

Frontend: `http://localhost:3000`  
Backend: `http://localhost:4000`

## Demo Accounts

After seeding:

- Admin: `admin@example.com` / `Password123!`
- Member: `member@example.com` / `Password123!`

## API Testing Guide

Use the seeded admin account to log in:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Password123!"
}
```

Copy the returned token and use it as:

```http
Authorization: Bearer <token>
```

Useful endpoints:

- `GET /api/auth/me`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId`
- `GET /api/projects/:projectId/dashboard`

## Railway Deployment

Create three Railway services:

1. PostgreSQL database
2. Backend service from `apps/api`
3. Frontend service from `apps/web`

Backend variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.up.railway.app
NODE_ENV=production
PORT=4000
```

Backend commands:

- Build: `npm install && npm run build`
- Pre-deploy: `npm run prisma:deploy`
- Start: `npm run start`

Frontend variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app/api
```

Frontend commands:

- Build: `npm install && npm run build`
- Start: `npm run start`

## Interview Talking Points

- Roles are project-scoped through `ProjectMember`, so the same user can be an admin in one project and a member in another.
- JWT is issued by the backend and stored in an HTTP-only cookie for browser sessions, while Bearer tokens remain supported for API testing.
- Authorization is enforced in backend middleware, not only hidden in the UI.
- Prisma models capture the actual domain relationships between users, projects, memberships, tasks, and activity.
- Dashboard analytics are derived from task data and recent activity logs.
- Railway deployment uses separate services and environment variables, matching a realistic production setup.
