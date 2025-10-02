# 🔧 404 Error Troubleshooting Guide

## Current Status

✅ **Backend API is running:** `https://powerlink-production.up.railway.app/api/health` works  
❌ **Auth endpoints returning 404:** `/api/auth/refresh` not found  

---

## 🎯 **The Problem**

Your Railway backend is running BUT the auth routes aren't working. This means:
- Railway might be running OLD code
- Or there's a deployment issue

---

## ✅ **SOLUTION: Force Railway to Redeploy**

### **Step 1: Check Railway Deployment**

1. Go to **Railway Dashboard**: https://railway.app
2. Click on your **backend service**
3. Go to **Deployments** tab
4. Check the **latest deployment date/time**

**Is it recent?** Should be within the last hour.

### **Step 2: Check Environment Variables in Railway**

Make sure these are set:

```env
PORT=${{PORT}}
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGIN=https://power-link.vercel.app
NODE_ENV=production
```

**Important:** 
- `CORS_ORIGIN` should match your Vercel URL **exactly** (no trailing slash)
- Change `https://power-link.vercel.app/` to `https://power-link.vercel.app`

### **Step 3: Trigger Manual Redeploy**

1. In Railway Dashboard → Your service
2. Go to **Deployments** tab
3. Click **⋮** (three dots) on latest deployment
4. Click **"Redeploy"**
5. Wait 2-3 minutes

### **Step 4: Check Deployment Logs**

While deploying, click on the deployment and watch logs:

**Look for:**
- ✅ `MongoDB connected`
- ✅ `API listening on :XXXX`
- ❌ Any error messages

---

## 🔍 **Verify After Redeploy**

### **Test 1: Health Check**
```bash
curl https://powerlink-production.up.railway.app/api/health
```
**Expected:** `{"status":"ok"}`

### **Test 2: Auth Refresh**
```bash
curl -X POST https://powerlink-production.up.railway.app/api/auth/refresh
```
**Expected:** `{"error":"No refresh token"}` (NOT "Not Found")

### **Test 3: Login Endpoint**
```bash
curl -X POST https://powerlink-production.up.railway.app/api/auth/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test"}'
```
**Expected:** Some response (NOT 404)

---

## 🆘 **If Still Getting 404**

### **Option 1: Check Railway Root Directory**

1. Go to Railway → Settings
2. Find **Root Directory**
3. Make sure it's set to: `/server`
4. Save and redeploy

### **Option 2: Check Build Command**

1. Railway → Settings
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Save and redeploy

### **Option 3: Clear Build Cache**

1. Railway → Settings
2. Find build cache option
3. Clear cache
4. Redeploy

---

## 📋 **Quick Checklist**

- [ ] Railway Root Directory = `/server`
- [ ] Environment variables all set
- [ ] `CORS_ORIGIN` has NO trailing slash
- [ ] Latest code is pushed to GitHub
- [ ] Railway auto-deployed from GitHub
- [ ] Deployment logs show no errors
- [ ] Health endpoint works
- [ ] Auth endpoints work

---

## 🎯 **After Fix**

Once Railway redeploys correctly:

1. ✅ `/api/health` works
2. ✅ `/api/auth/login` works
3. ✅ `/api/auth/refresh` works
4. ✅ Vercel frontend can connect
5. ✅ Login page works
6. ✅ All features work

---

## 💡 **Most Likely Issue**

**CORS_ORIGIN mismatch!**

Change in Railway:
```
FROM: CORS_ORIGIN=https://power-link.vercel.app/
TO:   CORS_ORIGIN=https://power-link.vercel.app
```

Remove the trailing `/` slash!

---

**Fix the CORS_ORIGIN and redeploy Railway now!** 🚀
