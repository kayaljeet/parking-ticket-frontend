# Future Authentication Plan

This document outlines the architectural changes required to implement a secure user authentication system (login/logout flow) in both the frontend and backend, moving away from static demo tokens.

---

## 1. Backend Requirements

### Database Schema (MongoDB)
* Create a new `users` collection in the MongoDB database.
* User document schema:
  ```json
  {
    "_id": "ObjectId",
    "username": "string (unique)",
    "password_hash": "string (bcrypt hashed)",
    "role": "string ('admin' | 'reportee')",
    "name": "string (e.g. 'DemoAdmin' or 'Joe')",
    "created_at": "ISODate"
  }
  ```

### CLI Command to Create Users
* Create a command-line script (e.g. `npm run create-user -- --username=... --password=... --role=... --name=...`) to safely add users.
* This script should use `bcrypt` to hash the password before saving it to the database.

### Authentication Endpoints
1. **`/api/login` (POST):**
   * Expects: `{ username, password }`.
   * Action:
     1. Find user by username in the `users` collection.
     2. Verify password using `bcrypt.compare`.
     3. Generate a secure JSON Web Token (JWT) containing the user's `id`, `username`, `name`, and `role`.
   * Returns: `{ token, user: { name, role } }`.
2. **Endpoint Middleware Update:**
   * Modify the backend authentication middleware to decode and verify the JWT signature using a `JWT_SECRET` environment variable.
   * Attach the decoded payload to the request (`req.user`) to dynamically restrict access based on roles.

---

## 2. Frontend Requirements

### Login Page Component
* Implement a dedicated Login screen (`/login` route) containing:
  * Username and Password fields.
  * Validation and loading states.
* Ensure this is a "Sign-In Only" page:
  * If a user is not authenticated, all other routes should automatically redirect to `/login`.
  * If a user is already logged in, visiting `/login` should redirect them to their dashboard.

### State & Token Management
* **Login Success:**
  * Upon receiving the JWT token from the backend `/api/login` response, store it securely in `localStorage` under `auth_token`.
  * Store user profile details (like `name` and `role`).
* **Axios Interceptor:**
  * Retrieve the token from `localStorage.getItem('auth_token')` and append it dynamically as `Authorization: Bearer <token>` for all API requests.
* **Logout:**
  * Clear `auth_token` and other user info from `localStorage`.
  * Redirect the user immediately to `/login`.
