# 🚀 Railway Backend - Quick Fix Checklist

## The Problem
You're getting: `{"error":{"message":"Not Found","code":"NOT_FOUND"}}`

## The Solution (5 Steps)

### ✅ Step 1: Set Root Directory
**In Railway Dashboard:**
1. Click on your backend service
2. Go to **Settings** tab
3. Find **Root Directory**
4. Set it to: `/server`
5. Click **Save Changes**

**This is the most common issue!**

---

### ✅ Step 2: Verify Environment Variables
**In Railway Dashboard → Variables tab:**

```env
PORT=${{PORT}}
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/powerlink
JWT_ACCESS_SECRET=your_jwt_access_secret_from_generator
JWT_REFRESH_SECRET=your_jwt_refresh_secret_from_generator
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGIN=*
NODE_ENV=production
```

**Don't have secrets?** Run:
```bash
node server/scripts/generate-jwt-secrets.js
```

---

### ✅ Step 3: Check MongoDB Connection

**If using MongoDB Atlas:**
1. Go to MongoDB Atlas Dashboard
2. Click **Network Access**
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (0.0.0.0/0)
5. Click **Confirm**

**Get Connection String:**
1. Click **Database** → **Connect**
2. Choose **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add it to Railway variables as `MONGODB_URI`

---

### ✅ Step 4: Push Latest Code

```bash
git add .
git commit -m "Fix: Railway configuration and API endpoints"
git push origin main
```

Railway will automatically redeploy!

---

### ✅ Step 5: Wait & Test

**Wait 2-3 minutes for deployment, then test:**

```bash
# Test health endpoint
curl https://your-app.up.railway.app/api/health

# Test API root
curl https://your-app.up.railway.app/api

# Test root
curl https://your-app.up.railway.app/
```

**Expected Response:**
```json
{"status":"ok"}
```

---

## 🔍 Check Railway Logs

**In Railway Dashboard:**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Look for these messages:
   - ✅ `MongoDB connected`
   - ✅ `API listening on :XXXX`
   - ❌ Any error messages

---

## 🎯 Common Errors & Quick Fixes

| Error | Fix |
|-------|-----|
| "Module not found" | Set Root Directory to `/server` |
| "bcrypt error" | Already fixed! Push latest code |
| "MongoDB connection failed" | Check MongoDB URI & whitelist IPs |
| "Cannot find package" | Verify package.json has all deps |
| "Port already in use" | Railway handles this automatically |

---

## ✅ Success Checklist

After fixing, verify:
- [ ] Railway deployment shows "Active" (green)
- [ ] Can access: `https://your-app.up.railway.app/`
- [ ] Can access: `https://your-app.up.railway.app/api/health`
- [ ] Railway logs show "MongoDB connected"
- [ ] No error messages in Railway logs

---

## 📝 Your Railway URL

After deployment, you'll get a URL like:
```
https://your-app-production-XXXX.up.railway.app
```

**Save this URL!** You'll need it for:
1. Testing the API
2. Configuring frontend environment variables
3. Updating CORS settings

---

## 🔄 Redeploy Trigger

If you need to force a redeploy:
1. Go to Railway Dashboard
2. Click **Deployments**
3. Click **⋮** (three dots)
4. Click **Redeploy**

---

## 🆘 Still Not Working?

1. **Check Root Directory** - Make sure it's `/server`
2. **Check Environment Variables** - All should be set
3. **Check Railway Logs** - Look for specific errors
4. **Test Locally** - Run `cd server && npm start`
5. **Verify GitHub** - Latest code should be pushed

---

**The #1 fix:** Set Root Directory to `/server` in Railway Settings!
