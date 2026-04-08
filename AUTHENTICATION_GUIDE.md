# Authentication System Setup Guide

## Overview
This MERN e-commerce application includes a complete authentication system with:
- ✅ User registration with email validation
- ✅ User login with email + password
- ✅ Password hashing using bcryptjs
- ✅ JWT token generation and verification
- ✅ Token storage in LocalStorage (frontend)
- ✅ Protected routes for Cart, Orders, and Profile

## Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

The following packages are required:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

### 2. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
MONGO_URI=mongodb://localhost:27017/mern-ecommerce
JWT_SECRET=your_random_secret_key_here
```

**Important:** Change `JWT_SECRET` to a random string in production!

### 3. Start MongoDB

Ensure MongoDB is running on your system:
```bash
# For local MongoDB
mongod
```

### 4. Start the Backend Server

```bash
npm run server  # uses nodemon for auto-restart
# or
npm start      # simple start
```

Server runs on `http://localhost:5000`

## Frontend Setup

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Add React Router (if not already installed)

```bash
npm install react-router-dom
```

### 3. Update your `App.jsx`

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Cart } from "./pages/Cart";
import { Orders } from "./pages/Orders";
import { Profile } from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

### 4. Start the Frontend

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication Routes

#### POST `/api/auth/register`
Register a new user

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Login user

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### GET `/api/auth/me`
Get current user (Protected)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Protected Routes Example

#### GET `/api/cart`
Get user's cart (Protected)

#### GET `/api/orders`
Get user's orders (Protected)

#### GET `/api/profile`
Get user's profile (Protected)

All protected routes require:
```
Authorization: Bearer <token>
```

## How It Works

### Registration Flow
1. User fills in name, email, password on `/register` page
2. Frontend sends request to `/api/auth/register`
3. Backend validates input
4. Password is hashed using bcryptjs (10 salt rounds)
5. User document is created in MongoDB
6. JWT token is generated
7. Token and user info stored in localStorage
8. User is redirected to home page

### Login Flow
1. User enters email and password on `/login` page
2. Frontend sends request to `/api/auth/login`
3. Backend finds user by email
4. Password is compared with hashed password using bcryptjs
5. If valid, JWT token is generated
6. Token and user info stored in localStorage
7. User is redirected to home page

### Accessing Protected Routes
1. When user tries to access `/cart`, `/orders`, or `/profile`
2. `ProtectedRoute` component checks if user is authenticated
3. If no token in localStorage, user is redirected to `/login`
4. If authenticated, token is sent in `Authorization` header
5. Backend verifies token using `authMiddleware`
6. If valid, request proceeds; if invalid, 401 error is returned

### Logout Flow
1. User clicks logout button
2. `logout()` function removes token and user from localStorage
3. User is redirected to `/login`

## Security Features

- ✅ **Password Hashing**: Passwords are hashed using bcryptjs with 10 salt rounds
- ✅ **JWT Tokens**: Tokens are signed and verified using JWT with a secret key
- ✅ **Token Expiration**: Tokens expire after 7 days
- ✅ **Password Comparison**: Uses bcryptjs.compare() for secure password verification
- ✅ **Protected Routes**: Routes are protected using authMiddleware on backend and ProtectedRoute on frontend
- ✅ **Email Validation**: Email validation using regex pattern and uniqueness constraint
- ✅ **Password Requirements**: Minimum 6 characters

## Testing the Authentication

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Access Protected Route (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/cart
```

### Using Postman

1. Import the API endpoints
2. For `/api/auth/register` and `/api/auth/login`:
   - Set method to POST
   - Add JSON body
3. For protected routes:
   - Set Authorization header: `Bearer <token>`
   - Add token from login response

## Troubleshooting

### "MongoDB Connected ❌"
- Ensure MongoDB is running
- Check `MONGO_URI` in `.env` file
- Verify connection string format

### "Invalid or expired token"
- Token may have expired (7 days)
- User needs to login again
- Check that token is being sent correctly in Authorization header

### "Email already registered"
- User already exists with that email
- Try logging in instead of registering
- Use different email for new account

### CORS Errors
- Ensure `cors()` middleware is added to Express
- Check frontend URL matches CORS configuration
- Frontend should be on `http://localhost:5173`

## Next Steps

1. **Add email verification**: Send confirmation email after registration
2. **Add refresh tokens**: Implement refresh token mechanism
3. **Add password reset**: Implement forgot password functionality
4. **Add OAuth**: Implement social login (Google, GitHub, etc.)
5. **Add two-factor authentication**: Add 2FA for enhanced security
6. **Add role-based access control**: Implement admin/user roles
7. **Add audit logging**: Log authentication events

## File Structure

```
server/
├── models/
│   └── User.js           # User schema with bcrypt
├── routes/
│   └── auth.js           # Auth endpoints
├── middleware/
│   └── auth.js           # JWT verification middleware
├── server.js             # Express server setup
├── .env                  # Environment variables
└── package.json

client/
├── src/
│   ├── pages/
│   │   ├── Login.jsx     # Login component
│   │   ├── Register.jsx  # Register component
│   │   ├── Cart.jsx      # Protected cart page
│   │   ├── Orders.jsx    # Protected orders page
│   │   └── Profile.jsx   # Protected profile page
│   ├── context/
│   │   └── AuthContext.jsx  # Auth context provider
│   ├── services/
│   │   └── authService.js   # API calls
│   ├── components/
│   │   └── ProtectedRoute.jsx  # Route protection
│   └── App.jsx
└── package.json
```

---

For questions or issues, check the error messages and logs in browser console and server terminal.
