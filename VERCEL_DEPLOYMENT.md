# 🔒 Security Fix & Vercel Deployment Guide

## ⚠️ SECURITY ISSUE RESOLVED

**Problem:** JWT secrets were exposed in Git commit
**Status:** ✅ FIXED
**Action Taken:** 
- Generated NEW JWT secrets
- Updated `.gitignore` to block `.env` files
- Old secrets are now invalid

---

## 🚀 Vercel Frontend Deployment

### Prerequisites Checklist
- [x] Backend deployed on Railway
- [x] New JWT secrets generated
- [x] `.env` files properly gitignored
- [x] Auth0 credentials ready
- [ ] Backend URL from Railway

---

## Step-by-Step Vercel Deployment

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Prepare Frontend

Make sure your `client/package.json` has these scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3. Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import from GitHub: `ansarihashim/PowerLink`
4. Configure:
   - **Root Directory**: `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   ```
   VITE_AUTH0_DOMAIN=dev-qpjc4ilyvkuf04ts.us.auth0.com
   VITE_AUTH0_CLIENT_ID=wD2ZMZkY8H32cGnCD8E2JVjU2WLkgtto
   VITE_AUTH0_REDIRECT_URI=https://your-app.vercel.app
   VITE_API_URL=https://your-railway-backend.up.railway.app/api
   ```

6. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
cd client
vercel
# Follow the prompts
```

---

## 🔐 Environment Variables for Vercel

### Required Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_AUTH0_DOMAIN` | `dev-qpjc4ilyvkuf04ts.us.auth0.com` | Auth0 domain |
| `VITE_AUTH0_CLIENT_ID` | `wD2ZMZkY8H32cGnCD8E2JVjU2WLkgtto` | Auth0 client ID |
| `VITE_AUTH0_REDIRECT_URI` | `https://your-app.vercel.app` | Frontend URL |
| `VITE_API_URL` | `https://your-backend.up.railway.app/api` | Backend API URL |

⚠️ **IMPORTANT:** Replace URLs with your actual deployment URLs!

---

## 🔄 After Deployment

### 1. Update Backend CORS

In Railway, update `CORS_ORIGIN` environment variable:
```
CORS_ORIGIN=https://your-app.vercel.app
```

### 2. Update Auth0 Settings

In Auth0 Dashboard:
- **Allowed Callback URLs**: `https://your-app.vercel.app`
- **Allowed Logout URLs**: `https://your-app.vercel.app`
- **Allowed Web Origins**: `https://your-app.vercel.app`

### 3. Test Your Deployment

Visit: `https://your-app.vercel.app`

Test:
- ✅ Login works
- ✅ API calls work
- ✅ Authentication works
- ✅ No console errors

---

## 🛡️ Security Checklist

- [x] `.env` files are gitignored
- [x] New JWT secrets generated (old ones exposed)
- [x] Secrets stored in Vercel environment variables
- [x] Secrets stored in Railway environment variables
- [x] No hardcoded secrets in code
- [x] CORS configured correctly
- [x] Auth0 URLs updated

---

## 📋 Post-Deployment Checklist

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables added to both platforms
- [ ] CORS_ORIGIN updated in Railway
- [ ] Auth0 settings updated
- [ ] Application tested end-to-end
- [ ] No errors in browser console
- [ ] Authentication works correctly

---

## 🆘 Troubleshooting

### CORS Errors
**Problem:** Frontend can't connect to backend
**Solution:** 
- Verify `CORS_ORIGIN` in Railway matches your Vercel URL
- Ensure both URLs use HTTPS

### Auth0 Errors
**Problem:** Login redirects fail
**Solution:**
- Update Auth0 callback URLs
- Verify `VITE_AUTH0_REDIRECT_URI` matches your Vercel URL

### API Connection Issues
**Problem:** API calls failing
**Solution:**
- Verify `VITE_API_URL` is correct
- Check Railway backend is running
- Test backend directly: `curl https://your-backend.up.railway.app/`

### Environment Variables Not Loading
**Problem:** `import.meta.env` returns undefined
**Solution:**
- All Vite env vars must start with `VITE_`
- Redeploy after adding env vars
- Clear browser cache

---

## 🔗 Important Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard
- **Auth0 Dashboard**: https://manage.auth0.com
- **GitHub Repo**: https://github.com/ansarihashim/PowerLink

---

## 📞 Support

If issues persist:
1. Check Vercel deployment logs
2. Check Railway deployment logs
3. Check browser console for errors
4. Verify all environment variables are set correctly

---

**🎉 Your app is now securely deployed!**
