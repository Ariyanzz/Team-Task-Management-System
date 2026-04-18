<<<<<<< HEAD
# TaskFlow — Team Task Management System

A full-stack productivity application built with Next.js, Express (TypeScript), and MongoDB. Manage tasks individually with a clean, modern UI.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | Next.js 14 (App Router), TypeScript |
| Styling      | Tailwind CSS                        |
| State        | TanStack Query v5                   |
| Forms        | React Hook Form                     |
| Backend      | Node.js + Express (TypeScript)      |
| Database     | MongoDB + Mongoose                  |
| Auth         | JWT (Bearer tokens)                 |
| Validation   | express-validator                   |
| Security     | Helmet, CORS, Rate Limiting         |

---

## Features

### Authentication & Authorization
- User registration and login with JWT
- Protected routes (frontend + backend)
- Role-based access: `admin` and `member`
- Secure logout

### Task Management (Full CRUD)
- Create, view, update, delete tasks
- Each task has: title, description, status, priority, due date, assignee, tags
- Kanban-style board (To Do / In Progress / Done)
- Search and filter by status, priority

### Team Collaboration
- Assign tasks to team members
- Team overview with per-member stats and completion rates
- View all team members and their workloads

### Dashboard
- Summary stats (total, todo, in-progress, done)
- Completion progress bar
- Recent tasks feed

### UX
- Fully responsive (mobile + desktop)
- Skeleton loading states
- Toast notifications
- Overdue / urgent due date highlighting
- Smooth animations

---

## Project Structure

```
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routers
│   │   └── server.ts     # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── dashboard/
    │   │   │   ├── tasks/        # Task list, detail, create, edit
    │   │   │   ├── team/         # Team overview
    │   │   │   ├── settings/     # Profile settings
    │   │   │   └── layout.tsx    # Sidebar layout
    │   │   ├── login/
    │   │   ├── register/
    │   │   └── layout.tsx
    │   ├── contexts/     # AuthContext
    │   ├── lib/          # API client, utils, withAuth HOC
    │   └── types/        # Shared TypeScript types
    ├── .env.example
    ├── package.json
    └── tailwind.config.ts
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

The API will run on `http://localhost:5000`.

**Environment variables:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local
npm install
npm run dev
```

The app will run on `http://localhost:3000`.

**Environment variables:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## API Endpoints

### Auth
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| POST   | /api/auth/register   | Create account    |
| POST   | /api/auth/login      | Login             |
| GET    | /api/auth/me         | Get current user  |

### Tasks (all protected)
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | /api/tasks           | List tasks (filterable) |
| GET    | /api/tasks/stats     | Task stats summary   |
| GET    | /api/tasks/:id       | Get single task      |
| POST   | /api/tasks           | Create task          |
| PUT    | /api/tasks/:id       | Update task          |
| DELETE | /api/tasks/:id       | Delete task          |

### Users (all protected)
| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | /api/users           | List all users       |
| PUT    | /api/users/profile   | Update own profile   |

---

## Deployment

### Backend → Railway / Render
1. Set all environment variables in the platform dashboard
2. Build command: `npm run build`
3. Start command: `npm start`

### Frontend → Vercel
1. Connect your GitHub repository
2. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL
3. Deploy — Vercel handles everything automatically

---

## Design Decisions

- **App Router** used for nested layouts, server components, and cleaner routing
- **TanStack Query** for server state — handles caching, background refetching, and invalidation
- **React Hook Form** for performant, uncontrolled form handling with validation
- **JWT in localStorage** — simple for this scope; cookie-based is preferred for production
- **Kanban grouping** activates only when no filters are applied — improves UX for browsing
- **Role-based access** enforced both in middleware (backend) and UI (frontend guards)
=======
# Team-Task-Management-System
A full-stack productivity application built with Next.js, Express (TypeScript), and MongoDB. Manage tasks individually with a clean, modern UI.
>>>>>>> 8ab6d2604f92e5374f2e0df3a3f3e2686019a948
