# 🚀 Vercel Deployment - Simple Guide

## ✅ Environment Variables for Vercel

You only need **ONE** environment variable for your frontend!

### In Vercel Dashboard → Settings → Environment Variables:

```env
VITE_API_URL=https://your-railway-backend-url.up.railway.app/api
```

**That's it!** 🎉

---

## 📋 How to Deploy

### Step 1: Import from GitHub
1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your `PowerLink` repository

### Step 2: Configure Build
```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### Step 3: Add Environment Variable
Click **Environment Variables** and add:
- **Name:** `VITE_API_URL`
- **Value:** `https://your-railway-app.up.railway.app/api`
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Step 4: Deploy
Click **Deploy** button!

---

## 🔧 Get Your Railway Backend URL

1. Go to Railway Dashboard
2. Click on your backend service
3. Go to **Settings** tab
4. Find **Public Networking** section
5. Copy the URL (e.g., `https://powerlink-production-abc.up.railway.app`)
6. Add `/api` at the end

**Example:**
```
https://powerlink-production-abc.up.railway.app/api
```

---

## ✅ After Deployment

### 1. Update Railway CORS
In Railway, update the `CORS_ORIGIN` environment variable:
```
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

### 2. Test Your App
Visit your Vercel URL and verify:
- ✅ App loads
- ✅ Can fetch data from backend
- ✅ No CORS errors
- ✅ All features work

---

## 🆘 Troubleshooting

### CORS Error
```
Access to fetch blocked by CORS policy
```

**Fix:**
1. Go to Railway Dashboard
2. Update `CORS_ORIGIN` to your Vercel URL
3. Wait for Railway to redeploy

### API Connection Error
```
Failed to fetch
```

**Check:**
- Is `VITE_API_URL` correct in Vercel?
- Is Railway backend running?
- Does the URL end with `/api`?

### Build Error
**Check:**
- Is Root Directory set to `client`?
- Are there any console errors?
- Does `npm run build` work locally?

---

## 📝 Summary

**Environment Variables Needed:**
- ✅ `VITE_API_URL` - Your Railway backend URL

**Not Needed:**
- ❌ Auth0 variables (you're not using Auth0)
- ❌ Google OAuth (removed)
- ❌ Any other authentication services

**Simple Setup:**
1. Deploy backend on Railway
2. Get Railway URL
3. Add `VITE_API_URL` in Vercel
4. Deploy on Vercel
5. Update `CORS_ORIGIN` in Railway
6. Done! 🎉

---

**Your app will work with just the backend API URL!** 🚀
