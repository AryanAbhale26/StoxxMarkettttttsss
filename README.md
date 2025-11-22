# StockMaster - Inventory Management System

## Backend Setup

### Prerequisites
- Python 3.8+
- MongoDB

### Installation

1. Navigate to Backend directory:
```bash
cd Backend
```

2. Create virtual environment:
```bash
python -m venv venv
```

3. Activate virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Configure environment variables in `.env`

6. Run the server:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

## Frontend Setup

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Navigate to Frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables in `.env`

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Features Implemented

### Authentication
- ✅ User Signup with email verification
- ✅ User Login with JWT tokens
- ✅ Forgot Password with OTP
- ✅ OTP-based Password Reset
- ✅ Protected Routes

### Tech Stack
- **Backend**: FastAPI, MongoDB, JWT, SMTP
- **Frontend**: React, TypeScript, Tailwind CSS, React Router
- **Authentication**: JWT-based authentication
- **Email**: SMTP for OTP delivery

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new user account
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/forgot-password` - Request OTP for password reset
- `POST /api/v1/auth/verify-otp` - Verify OTP
- `POST /api/v1/auth/reset-password` - Reset password with OTP
