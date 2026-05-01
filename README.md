# Helper

## Overview
Helper is a neighborhood task exchange platform where people can post tasks, offer help, and connect with their local community.

The app enables users to find assistance for everyday needs, support others nearby, and build stronger community connections through a simple and interactive experience.

---

## Core Features

### 🧩 Task Marketplace
- Post tasks for help (e.g., errands, small jobs)
- Browse available tasks in the community
- Accept and complete tasks

### 🤝 Community Interaction
- Connect with nearby users
- Offer help based on skills or availability
- Build trust through repeated interactions

### 💬 Real-Time Communication
- Live messaging using Socket.io
- Instant updates on task status and interactions

### 👤 User System
- Authentication (login / signup)
- Email verification system using Resend
- User profiles
- Track posted and completed tasks

---

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Prisma ORM

### Real-Time
- Socket.io

### Email Service
- Resend (email verification & transactional emails)

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/helper.git
cd helper
```
### 2. Install Dependencies
```bash
#Frontend
cd client
npm install
#Backend
cd server
npm install
```
### 3. Set Up Environment Variables
```env
#Backend .env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secret_key
EMAIL_USER=
EMAIL_PASS=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
### 4. Run the App
```bash
#Start Backend
cd backend
npm run dev
#Start Frontend
cd frontend
npm run dev
```
### 5. Open in Browser

### Vision

Helper aims to strengthen local communities by making it easy for people to support one another through simple, task-based collaboration.

### License

This project is for educational and development purposes.
