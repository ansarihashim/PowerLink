# 🚀 Vercel Deployment Guide - PowerLink Backend

## ✅ Current Folder Structure

```
server/
├── api/
│   └── index.js          # Main serverless handler (routes all requests through Express)
├── src/
│   ├── app.js            # Express app configuration (NO app.listen())
│   ├── routes/           # All your API routes
│   ├── controllers/      # Controllers
│   ├── models/           # Mongoose models
│   ├── middlewares/      # Auth, error handlers
│   ├── utils/
│   │   └── db.js         # Database connection with caching
│   └── config/
│       └── env.js        # Environment configuration
├── package.json
├── vercel.json           # Vercel configuration (rewrites)
└── .vercelignore         # Files to exclude from deployment

```

## 🔧 How It Works

### 1. Request Flow
```
User Request → Vercel → /api/index.js → Express App → Route Handler → Response
```

### 2. Key Files Explained

**api/index.js** - Serverless handler
- Initializes DB connection (cached)
- Passes requests to Express app
- Handles errors

**src/app.js** - Express app
- Configures middlewares (CORS, helmet, compression)
- Defines routes under `/api/*`
- Exports app (NO `.listen()`)

**vercel.json** - Deployment config
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```
This routes ALL requests to `/api/index.js`

**src/utils/db.js** - Database connection
- Caches MongoDB connection
- Prevents reconnecting on every request

## 🌐 Environment Variables Required

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_secret_here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGIN=https://power-link.vercel.app
NODE_ENV=production
```

## 🧪 Testing Locally

```bash
cd server
npm install
vercel dev
```

Visit:
- http://localhost:3000 → Root endpoint
- http://localhost:3000/api/health → Health check
- http://localhost:3000/api/auth/login → Auth endpoint

## 📦 Deploying to Vercel

### Option 1: Vercel CLI (Recommended)

```bash
cd server

# Login (first time only)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to vercel.com → New Project
3. Import your repository
4. Set Root Directory: `server`
5. Add environment variables
6. Deploy

## 🔍 Verifying Deployment

After deployment, test these endpoints:

```bash
# Replace YOUR_APP with your actual Vercel URL

# Root
curl https://YOUR_APP.vercel.app/

# Health check
curl https://YOUR_APP.vercel.app/api/health

# API info
curl https://YOUR_APP.vercel.app/api

# Auth endpoints
curl -X POST https://YOUR_APP.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🐛 Debugging 404 Errors

### Common Issues & Solutions

1. **404 on root path**
   - ✅ Fixed: `vercel.json` uses rewrites to route to `/api`

2. **404 on /api/something**
   - Check if route exists in `src/routes/`
   - Verify route is registered in `src/routes/index.js`

3. **500 Internal Server Error**
   - Check Vercel logs: `vercel logs YOUR_URL`
   - Verify environment variables are set
   - Check MongoDB connection string

4. **CORS errors**
   - Add frontend URL to `CORS_ORIGIN` env variable
   - Multiple origins: `https://app1.com,https://app2.com`

5. **Timeout errors (10s limit)**
   - Optimize database queries
   - Add indexes to MongoDB collections
   - Reduce middleware processing

## 📊 View Logs

```bash
# Real-time logs
vercel logs --follow

# Last 100 logs
vercel logs
```

## 🔄 Update Frontend

After deploying backend, update your frontend:

**client/.env**
```
VITE_API_URL=https://YOUR_BACKEND.vercel.app/api
```

Then redeploy your frontend.

## ✅ Route Mapping

Your routes are automatically available at:

```
Local Dev          → Production
localhost:3000/    → https://YOUR_APP.vercel.app/
localhost:3000/api → https://YOUR_APP.vercel.app/api

POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me

GET  /api/workers
POST /api/workers
GET  /api/workers/:id
PUT  /api/workers/:id

GET  /api/loans
POST /api/loans

GET  /api/expenses
POST /api/expenses

GET  /api/baana
GET  /api/beam
GET  /api/installments
GET  /api/stats
GET  /api/admin/users
```

## 🎯 Production Checklist

- [ ] All environment variables added in Vercel dashboard
- [ ] MongoDB Atlas is accessible (whitelist 0.0.0.0/0 for Vercel)
- [ ] CORS_ORIGIN includes your frontend URL
- [ ] JWT secrets are strong and secure
- [ ] Test all critical endpoints
- [ ] Update frontend .env with new backend URL
- [ ] Monitor Vercel logs for errors

## 🚨 Important Notes

1. **No app.listen()** - Vercel handles server startup
2. **10-second timeout** - Keep requests fast
3. **Stateless** - No file uploads to filesystem (use cloud storage)
4. **Connection caching** - Database connections are reused
5. **Cold starts** - First request may be slow (~2-3s)

## 💡 Performance Tips

1. Use MongoDB indexes for faster queries
2. Enable compression (already configured)
3. Cache frequently accessed data
4. Optimize database queries
5. Use connection pooling (already configured)

---

**Need help?** Check Vercel logs or contact support.
