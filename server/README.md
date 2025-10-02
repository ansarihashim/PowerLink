# PowerLink Server (Auth MVP)

Node.js + Express + MongoDB backend providing authentication for the PowerLink app.

## Stack
- Express (ESM)
- MongoDB + Mongoose
- JWT (access + refresh) with rotation (tokenVersion)
- bcryptjs password hashing (pure JavaScript, deployment-friendly)
- zod validation
- Helmet, CORS, compression, rate limiting, morgan logging

## Quick Start
```bash
cp .env.example .env
# edit secrets
npm install
npm run dev
```
Server runs on http://localhost:5000 (change PORT in .env).

## Environment Variables
See `.env.example`.

| Variable | Purpose |
|----------|---------|
| PORT | Port to run server |
| MONGODB_URI | Mongo connection string |
| JWT_ACCESS_SECRET | Secret for access tokens |
| JWT_REFRESH_SECRET | Secret for refresh tokens |
| ACCESS_TOKEN_TTL | Access token expiry (e.g. 15m) |
| REFRESH_TOKEN_TTL | Refresh token expiry (e.g. 7d) |
| CORS_ORIGIN | Allowed frontend origin |
| NODE_ENV | environment |

## Auth Flow
- Register (first user becomes admin, others viewer).
- Access token (short-lived) returned in JSON.
- Refresh token stored as httpOnly cookie `pl_refresh` (SameSite=Lax; Secure in prod; path=/api/auth).
- Refresh rotates tokens; logout increments `tokenVersion` so old refresh tokens become invalid.

## Endpoints
Base prefix: `/api`

| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| POST | /auth/refresh | Rotate tokens using refresh cookie |
| POST | /auth/logout | Logout & invalidate refresh |
| GET | /auth/me | Current user (Bearer access token) |
| GET | /health | Health check |

### Request / Response Examples

Register:
```http
POST /api/auth/register
Content-Type: application/json

{ "name":"Admin User", "email":"admin@example.com", "password":"Passw0rd!" }
```
Response 201:
```json
{ "user": {"id":"...","name":"Admin User","email":"admin@example.com","role":"admin","createdAt":"..."}, "accessToken": "<jwt>" }
```

Login:
```http
POST /api/auth/login
{ "email":"admin@example.com", "password":"Passw0rd!" }
```
Response 200 same shape as register.

Refresh:
```http
POST /api/auth/refresh
```
Response 200:
```json
{ "accessToken": "<newAccess>" }
```

Me:
```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

Logout:
```http
POST /api/auth/logout
```
204 No Content

### Error Format
```json
{ "error": { "message": "Invalid credentials", "code": "INVALID_CREDENTIALS" } }
```

## Integrating Frontend (Summary)
1. On login/register store `accessToken` in memory (context) & user object.
2. Attach `Authorization: Bearer <accessToken>` to API calls.
3. On 401, call `/api/auth/refresh` with `credentials: 'include'` to get new access token (if refresh cookie still valid), then retry once.
4. On logout: POST /api/auth/logout (credentials include), clear local auth state.

Example fetch login:
```js
const res = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include'
});
const data = await res.json();
if (!res.ok) throw new Error(data.error?.message || 'Login failed');
// data.accessToken + data.user
```

Refresh helper:
```js
async function refreshAccess() {
  const r = await fetch('http://localhost:5000/api/auth/refresh', { method:'POST', credentials:'include' });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'Refresh failed');
  return d.accessToken;
}
```

## Next Steps
- Add domain models (Workers, Loans, etc.)
- Implement list + CRUD endpoints
- Add dashboard & calendar aggregation
- Server-side CSV export
- Role-based authorization for future routes

## License
Internal / TBD
