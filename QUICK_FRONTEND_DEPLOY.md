# 🎯 QUICK GUIDE: Deploy Frontend on Railway

## ⚡ Fast Track (5 Minutes)

### 1️⃣ Commit Files (1 min)
```bash
git add .
git commit -m "Add Railway frontend configuration"
git push origin main
```

### 2️⃣ Create Railway Project (2 min)
1. Go to https://railway.app/dashboard
2. Click "+ New Project"
3. Choose "Deploy from GitHub repo"
4. Select: `ansarihashim/PowerLink`

### 3️⃣ Configure Project (1 min)
**Settings:**
- Root Directory: `/client`
- Build Command: `npm install && npm run build`
- Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`

### 4️⃣ Add Environment Variables (1 min)
In Railway Variables tab:

```env
VITE_AUTH0_DOMAIN=dev-qpjc4ilyvkuf04ts.us.auth0.com
VITE_AUTH0_CLIENT_ID=wD2ZMZkY8H32cGnCD8E2JVjU2WLkgtto
VITE_AUTH0_REDIRECT_URI=https://YOUR-FRONTEND-URL.up.railway.app
VITE_API_URL=https://YOUR-BACKEND-URL.up.railway.app/api
```

Replace:
- `YOUR-FRONTEND-URL` → Copy from Railway after first deploy
- `YOUR-BACKEND-URL` → Your backend Railway URL

### 5️⃣ Deploy! ✨
Railway will automatically build and deploy!

---

## 🔄 After First Deploy

### Update Backend CORS:
In your **backend** Railway project → Variables:
```env
CORS_ORIGIN=https://your-frontend.up.railway.app
```

### Update Auth0:
In Auth0 Dashboard → Your Application → Settings:
- Add `https://your-frontend.up.railway.app` to:
  - Allowed Callback URLs
  - Allowed Logout URLs
  - Allowed Web Origins

---

## ✅ Done!
Visit your frontend URL and test! 🎉

---

## 📖 Need More Details?
See: `FRONTEND_RAILWAY_DEPLOYMENT.md`
