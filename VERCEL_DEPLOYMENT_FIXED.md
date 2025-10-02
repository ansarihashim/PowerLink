# 🚀 Vercel Frontend Deployment Guide

## ✅ Quick Fix for Environment Variable Error

The error `"VITE_AUTH0_DOMAIN" references Secret "vite_auth0_domain", which does not exist` has been fixed!

I've updated `vercel.json` to remove the secret references. Now follow these steps:

---

## 📋 Step-by-Step Deployment

### Step 1: Push Latest Code

```bash
git add .
git commit -m "fix: Update vercel.json configuration"
git push origin main
```

### Step 2: Deploy on Vercel

1. **Go to Vercel Dashboard:** https://vercel.com
2. Click **Add New** → **Project**
3. **Import Git Repository:**
   - Select your GitHub account
   - Choose `PowerLink` repository
4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### Step 3: Add Environment Variables

**Before deploying, click on "Environment Variables" and add:**

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `VITE_API_URL` | `https://your-railway-app.up.railway.app/api` | Production, Preview, Development |
| `VITE_AUTH0_DOMAIN` | `dev-qpjc4ilyvkuf04ts.us.auth0.com` | Production, Preview, Development |
| `VITE_AUTH0_CLIENT_ID` | `GuDfjJqEPtF9hkLzGqo4RLSYvJ9JdhZq` | Production, Preview, Development |
| `VITE_AUTH0_REDIRECT_URI` | `https://your-app.vercel.app` | Production, Preview, Development |
| `VITE_APP_NAME` | `PowerLink` | Production, Preview, Development |
| `VITE_APP_VERSION` | `1.0.0` | Production, Preview, Development |

**Important:**
- Replace `https://your-railway-app.up.railway.app/api` with your actual Railway backend URL
- Replace `https://your-app.vercel.app` with your Vercel app URL (you'll get this after first deployment)

### Step 4: Deploy!

1. Click **Deploy**
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://power-link-xyz.vercel.app`

### Step 5: Update Environment Variables

After getting your Vercel URL:

1. **Update Auth0 Redirect URI:**
   - Go to Environment Variables
   - Update `VITE_AUTH0_REDIRECT_URI` to your actual Vercel URL
   - Redeploy

2. **Update Railway CORS:**
   - Go to Railway Dashboard
   - Update `CORS_ORIGIN` to your Vercel URL
   - Example: `https://power-link-xyz.vercel.app`

3. **Update Auth0 Dashboard:**
   - Go to Auth0 Dashboard
   - Applications → Your App
   - Add Vercel URL to:
     - Allowed Callback URLs
     - Allowed Logout URLs
     - Allowed Web Origins

---

## 🔧 If You Get Errors

### Error: "VITE_* is not defined"

**Solution:** Environment variables not set in Vercel

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add all `VITE_*` variables
3. Redeploy

### Error: "Failed to fetch" or CORS errors

**Solution:** Backend CORS not configured

1. Go to Railway Dashboard
2. Update `CORS_ORIGIN` environment variable
3. Set to your Vercel URL (e.g., `https://your-app.vercel.app`)

### Error: "Auth0 callback mismatch"

**Solution:** Auth0 configuration

1. Go to Auth0 Dashboard
2. Add your Vercel URL to allowed callbacks
3. Example: `https://your-app.vercel.app`

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] No console errors
- [ ] Can access backend API
- [ ] Auth0 login works (if applicable)
- [ ] All pages load correctly
- [ ] API calls work properly

---

## 🎯 Post-Deployment

### 1. Test Your App

Visit your Vercel URL and test:
- Homepage loads
- Navigation works
- API connections work
- Auth0 login (if using)

### 2. Set Custom Domain (Optional)

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add your custom domain
3. Update Auth0 and Railway with new domain

### 3. Enable Analytics (Optional)

Vercel provides free analytics:
1. Go to Analytics tab
2. Enable Web Analytics
3. Monitor your app performance

---

## 📝 Environment Variables Reference

### Required for Production:

```env
# Backend API
VITE_API_URL=https://your-railway-backend.up.railway.app/api

# Auth0 (if using authentication)
VITE_AUTH0_DOMAIN=dev-qpjc4ilyvkuf04ts.us.auth0.com
VITE_AUTH0_CLIENT_ID=GuDfjJqEPtF9hkLzGqo4RLSYvJ9JdhZq
VITE_AUTH0_REDIRECT_URI=https://your-app.vercel.app

# App Info
VITE_APP_NAME=PowerLink
VITE_APP_VERSION=1.0.0
```

---

## 🔄 Redeployment

Vercel automatically redeploys when you push to GitHub!

**Manual Redeploy:**
1. Go to Deployments tab
2. Click **⋮** on latest deployment
3. Click **Redeploy**

---

## 🆘 Troubleshooting

### Build Fails

1. Check build logs in Vercel
2. Verify `package.json` has all dependencies
3. Test build locally: `npm run build`

### Environment Variables Not Working

1. Make sure variable names start with `VITE_`
2. Redeploy after adding variables
3. Check variable names match exactly

### App Not Loading

1. Check browser console for errors
2. Verify `VITE_API_URL` is correct
3. Check Railway backend is running

---

## 📞 Support

- **Vercel Docs:** https://vercel.com/docs
- **Deployment Logs:** Check in Vercel Dashboard
- **Build Errors:** View in deployment details

---

**Your frontend is ready for deployment!** 🎉
