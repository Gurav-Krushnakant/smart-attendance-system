# Smart Attendance Management System Pro

A complete full-stack web application designed to digitize college attendance management. This project is built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and features role-based access, strict security workflows, attendance percentage calculations (handling Official vs. Personal Leaves), and CSV report generation.

## Tech Stack
- **Frontend**: React.js, React-Bootstrap, Axios, React-Router-DOM, Vite
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Auth**: JSON Web Tokens (JWT), bcryptjs
- **Exporting**: json2csv

## Key Features
- **Admin Module**: Manage system, create teachers, approve pending student registrations.
- **Teacher Module**: View classes, mark attendance, generate/export CSV reports, approve/reject student leaves (assigning them as Official or Personal).
- **Student Module**: Track attendance percentage visually, submit leave requests with reasoning.

## Running Locally

### 1. Backend
```bash
cd backend
npm install
# To seed demo data (Admin, Teachers, Students, Classes):
node seeder/seed.js 
# Run server
node server.js
```
*Note: Make sure MongoDB is running locally on `mongodb://localhost:27017/smart-attendance-pro` or update `.env`.*

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

### Default Credentials (from Seeder)
- **Password for all**: `password123`
- **Admin**: `admin@college.com`
- **Teacher**: `teacher1@college.com`
- **Student**: `student1@college.com`
