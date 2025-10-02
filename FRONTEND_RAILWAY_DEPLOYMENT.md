# 🚀 Deploy Frontend on Railway - Complete Guide

## 📋 What We've Prepared

### ✅ Files Created:
1. **`client/railway.json`** - Railway configuration
2. **`client/Procfile`** - Process configuration
3. **`client/.npmrc`** - NPM settings
4. **`client/vite.config.js`** - Updated with production settings
5. **`client/.env.production.example`** - Production environment template

---

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Backend First (If Not Done)

Make sure your backend is already deployed on Railway and you have the URL.
Example: `https://powerlink-backend-production.up.railway.app`

---

### Step 2: Commit Frontend Changes

```bash
git add .
git commit -m "Add Railway configuration for frontend"
git push origin main
```

---

### Step 3: Create New Railway Project for Frontend

1. **Go to Railway Dashboard**
   👉 https://railway.app/dashboard

2. **Create New Project**
   - Click "+ New Project"
   - Select "Deploy from GitHub repo"
   - Choose: `ansarihashim/PowerLink`
   - Railway will ask which service to deploy

3. **Configure Service**
   - **Name**: `PowerLink-Frontend` (or any name you prefer)
   - **Root Directory**: `/client`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

---

### Step 4: Add Environment Variables in Railway

Go to your frontend project → **Variables** tab and add:

```env
VITE_AUTH0_DOMAIN=dev-qpjc4ilyvkuf04ts.us.auth0.com
VITE_AUTH0_CLIENT_ID=wD2ZMZkY8H32cGnCD8E2JVjU2WLkgtto
VITE_AUTH0_REDIRECT_URI=https://your-frontend-app.up.railway.app
VITE_API_URL=https://your-backend-app.up.railway.app/api
```

**⚠️ IMPORTANT:** 
- Replace `your-frontend-app.up.railway.app` with your actual Railway frontend URL
- Replace `your-backend-app.up.railway.app` with your actual Railway backend URL

---

### Step 5: Deploy!

1. Railway will automatically start building
2. Wait for the build to complete (usually 2-5 minutes)
3. Once deployed, you'll get a URL like: `https://powerlink-frontend-production.up.railway.app`

---

### Step 6: Update Backend CORS

After frontend is deployed:

1. **Go to Backend Railway Project**
2. **Navigate to Variables**
3. **Update `CORS_ORIGIN`**:
   ```
   CORS_ORIGIN=https://your-frontend-app.up.railway.app
   ```
4. **Redeploy backend** (Railway will auto-redeploy)

---

### Step 7: Update Auth0 Settings

1. **Go to Auth0 Dashboard**
   👉 https://manage.auth0.com

2. **Navigate to Applications** → Your Application

3. **Update Settings**:
   - **Allowed Callback URLs**: Add `https://your-frontend-app.up.railway.app`
   - **Allowed Logout URLs**: Add `https://your-frontend-app.up.railway.app`
   - **Allowed Web Origins**: Add `https://your-frontend-app.up.railway.app`

4. **Save Changes**

---

## 🎯 Alternative: Use Railway's Built-in Static Site

If you prefer a simpler approach for static sites:

### Option A: Use Railway's Nixpacks (Current Setup)
- ✅ Already configured
- ✅ Runs Vite preview server
- ✅ Good for production

### Option B: Use a Static Web Server

Update `client/package.json`:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "serve": "npx serve -s dist -l $PORT"
  }
}
```

Update `client/Procfile`:
```
web: npx serve -s dist -l $PORT
```

Then add to dependencies:
```bash
cd client
npm install --save-dev serve
```

---

## 📦 What's Different from Vercel?

| Feature | Railway | Vercel |
|---------|---------|---------|
| Setup | Manual config needed | Auto-detects Vite |
| Build | Same (`vite build`) | Same |
| Hosting | Preview server or static | Edge network (CDN) |
| Domain | `.up.railway.app` | `.vercel.app` |
| Cost | Credit-based | Generous free tier |
| Performance | Good | Excellent (global CDN) |

**💡 Recommendation:** Railway is great for fullstack apps. If you only need frontend hosting, Vercel is faster and easier!

---

## ✅ Deployment Checklist

- [ ] Backend deployed on Railway
- [ ] Backend URL copied
- [ ] Frontend files committed and pushed
- [ ] New Railway project created for frontend
- [ ] Root directory set to `/client`
- [ ] Environment variables added (VITE_API_URL, VITE_AUTH0_*)
- [ ] Frontend deployed successfully
- [ ] Frontend URL obtained
- [ ] Backend CORS_ORIGIN updated with frontend URL
- [ ] Auth0 callback URLs updated
- [ ] Test: Can you access the frontend?
- [ ] Test: Can you login via Auth0?
- [ ] Test: Can frontend call backend API?

---

## 🐛 Troubleshooting

### Build Fails?
1. Check Railway logs
2. Ensure all dependencies are in `package.json`
3. Verify Node version (Railway uses latest by default)

### "Failed to fetch" API errors?
1. Check `VITE_API_URL` is correct
2. Verify backend CORS_ORIGIN includes frontend URL
3. Check backend is running

### Auth0 Login Not Working?
1. Verify Auth0 callback URLs include Railway URL
2. Check `VITE_AUTH0_REDIRECT_URI` is correct
3. Ensure Auth0 application is enabled

### Environment Variables Not Working?
1. Railway requires `VITE_` prefix for client-side variables
2. Redeploy after adding variables
3. Check variables tab in Railway dashboard

---

## 🎉 After Successful Deployment

### Your URLs:
- **Backend**: `https://your-backend.up.railway.app`
- **Frontend**: `https://your-frontend.up.railway.app`

### Test Your App:
1. ✅ Visit frontend URL
2. ✅ Try to login with Auth0
3. ✅ Check if data loads from backend
4. ✅ Test all features

---

## 💰 Railway Pricing Note

- Railway offers **$5 free credit per month**
- Pricing is usage-based (CPU, RAM, bandwidth)
- Small apps usually stay within free tier
- Monitor usage in Railway dashboard

---

## 🔄 Continuous Deployment

Railway auto-deploys on every push to main:
1. Make changes locally
2. Commit and push to GitHub
3. Railway detects changes
4. Automatically rebuilds and redeploys
5. Changes live in ~2-5 minutes

---

## 📞 Need Help?

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Vite Docs**: https://vitejs.dev

---

**🎊 You're all set! Deploy and enjoy!**
