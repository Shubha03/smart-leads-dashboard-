# Smart Leads Dashboard

A full-stack Lead Management Dashboard built using the MERN stack with TypeScript.

This project was developed as part of the Full Stack Internship Assignment.

---

# Features

## Authentication

- JWT Authentication
- User Registration
- User Login
- Protected Routes
- Password Hashing using bcrypt
- Role-Based Access Control (RBAC)

### Roles

- Admin
- Sales User

---

# Leads Management

## CRUD Operations

- Create Lead
- View Leads
- Update Lead
- Delete Lead (Admin Only)

---

# Advanced Features

- Debounced Search
- Filter by Status
- Filter by Source
- Sort by Latest/Oldest
- CSV Export Functionality
- Loading/Error States
- Form Validation

---

# Tech Stack

## Frontend

- React.js
- TypeScript

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose

## Authentication

- JWT
- bcryptjs

---

# Folder Structure

```txt
smart-leads-dashboard/
│
├── backend/
│   ├── src/
│   │   ├── config.ts
│   │   ├── middleware.ts
│   │   ├── models.ts
│   │   ├── routes.ts
│   │   └── server.ts
│   │
│   ├── package.json
│   ├── tsconfig.json
│   
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   │
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│  
│
└── README.md
```

---

# Installation

## Clone Repository

```bash
git clone <>
```

---

# Backend Setup

## Navigate to backend

```bash
cd backend
```

## Install dependencies

```bash
npm install
```

## Create `.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-leads
JWT_SECRET=supersecret
```

## Run backend

```bash
npm run dev
```

Backend runs on:

```txt
http://localhost:5000
```

---

# Frontend Setup

## Navigate to frontend

```bash
cd frontend
```

## Install dependencies

```bash
npm install
```

## Run frontend

```bash
npm run dev
```

Frontend runs on:

```txt
http://localhost:5173
```

---

# Assignment Requirements Covered

- React + TypeScript
- Node + Express + TypeScript
- MongoDB + Mongoose
- JWT Authentication
- CRUD Operations
- CSV Export
- Proper Folder Structure
- Error Handling
- Docker Setup

---

# Future Improvements

- Email Notifications
- Analytics Dashboard
- Lead Activity Tracking
- Team Collaboration
- Deployment CI/CD

---

# Author

Shubha Barman

---

# License

This project is for internship assignment evaluation purposes.