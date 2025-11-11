# SmartFit Platform - MERN Stack Setup
## Prerequisites

- Node.js 16+ installed
- npm package manager
- MongoDB Atlas account (cloud database - no local MongoDB needed)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:5000/api
MONGODB_URI=mongodb+srv://zoak4242_db_user:6ypHpo5dzapuiXA0@cluster0.xtlarbd.mongodb.net/smartfit?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
PORT=5000
```

## Running the Application

### Development Mode (Runs both frontend and backend)

```bash
npm run dev:backend &
npm run dev:frontend
```

Or separately in two terminals:

Terminal 1 (Backend):
```bash
npm run dev:backend
```

Terminal 2 (Frontend):
```bash
npm run dev:frontend
```

### Production Build

```bash
npm run build
npm start
```

## Project Structure

- `/src` - React frontend application
- `/server` - Express backend
  - `/routes` - API endpoints
  - `/middleware` - Authentication and other middleware
  - `index.js` - Main server entry point

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current authenticated user

### Profiles
- `GET /api/profiles/me` - Get user profile
- `PUT /api/profiles/me` - Update user profile

### Plans
- `GET /api/plans` - Get all fitness plans
- `GET /api/plans/:id` - Get specific plan

### Classes
- `GET /api/classes` - Get all available classes
- `GET /api/classes/:id` - Get specific class

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Chat
- `GET /api/chat` - Get chat messages
- `POST /api/chat/message` - Send message to AI coach

### Stats
- `GET /api/stats` - Get user statistics
- `PUT /api/stats` - Update user statistics

## Default Test Credentials

After startup, you can create an account through the signup page or test with:
- Email: demo@example.com
- Password: demo123

## Features

- User authentication with JWT
- MongoDB Atlas cloud database for data persistence
- AI fitness coach chat with mock responses (falls back to demo data if API fails)
- Class booking system
- Fitness plans and pricing tiers
- User profile management
- Workout statistics tracking
- Responsive React UI with Vite
- Mock data fallback for API failures

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React
- **Backend**: Express.js, Node.js
- **Database**: MongoDB Atlas (Cloud)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Security**: CORS, bcrypt password hashing

## Notes

- The application uses MongoDB Atlas cloud database (no local MongoDB installation required)
- The application includes mock data that auto-seeds the database on first startup
- All API requests include JWT authentication (except public endpoints)
- Password reset and email verification are not implemented in this demo
- Chat messages use mock AI responses with fallback to demo data if API fails
