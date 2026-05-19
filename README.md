# GigFlow – Smart Leads Dashboard

A full-stack Lead Management Dashboard built with the MERN stack + TypeScript.

## Tech Stack

- **Frontend:** React.js, TypeScript, TailwindCSS, Vite
- **Backend:** Node.js, Express.js, TypeScript, MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Other:** Docker, CSV Export, Role-Based Access Control

## Features

- JWT Authentication (Register/Login)
- Leads CRUD (Create, Read, Update, Delete)
- Advanced Filtering (Status, Source, Search, Sort)
- Backend Pagination (10 records/page)
- Debounced Search
- CSV Export
- Role-Based Access Control (Admin / Sales)
- Docker Setup
- Responsive UI

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend/gigflow-frontend
npm install
npm run dev
```

### Docker Setup
```bash
docker-compose up --build
```

## API Documentation

### Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |

### Lead Routes (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/leads | Get all leads |
| POST | /api/leads | Create lead |
| PUT | /api/leads/:id | Update lead |
| DELETE | /api/leads/:id | Delete lead (Admin only) |
| GET | /api/leads/export | Export CSV |

## Environment Variables