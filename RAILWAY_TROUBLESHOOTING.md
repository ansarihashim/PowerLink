# 🚨 Railway Backend Deployment - Troubleshooting Guide

## Error: `{"error":{"message":"Not Found","code":"NOT_FOUND"}}`

This error means Railway can't find your API routes. Here's how to fix it:

---

## ✅ SOLUTION: Fix Railway Configuration

### Step 1: Set Correct Root Directory in Railway

**In Railway Dashboard:**
1. Go to your backend service
2. Click on **Settings** tab
3. Scroll to **Deploy** section
4. Set **Root Directory** to: `/server`
5. Click **Save**

**This is CRITICAL!** Railway needs to know your server code is in the `/server` folder.

---

### Step 2: Verify Environment Variables

**In Railway Dashboard → Variables, you MUST have:**

```env
PORT=${{PORT}}
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_long_secret_here
JWT_REFRESH_SECRET=your_long_secret_here
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CORS_ORIGIN=*
NODE_ENV=production
```

**Important Notes:**
- `PORT=${{PORT}}` - Railway auto-assigns the port (don't change this!)
- `CORS_ORIGIN=*` - For now, allow all origins (change after frontend is deployed)
- Replace MongoDB URI with your actual connection string

---

### Step 3: Check Build & Start Commands

**In Railway Dashboard → Settings:**

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Root Directory:** `/server`

---

### Step 4: Verify package.json

Your `server/package.json` should have:

```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon --env-file .env src/server.js"
  }
}
```

---

## 🔍 Common Issues & Solutions

### Issue 1: "Module not found" errors
**Solution:** 
- Make sure Root Directory is set to `/server`
- Check that all dependencies are in `package.json`
- Railway will run `npm install` automatically

### Issue 2: MongoDB connection fails
**Solution:**
- Verify `MONGODB_URI` is correct in Railway variables
- If using MongoDB Atlas:
  - Go to Atlas → Network Access
  - Add IP: `0.0.0.0/0` (allow all)
  - Or add Railway's IPs

### Issue 3: "Not Found" or 404 errors
**Solution:**
- Set Root Directory to `/server`
- Verify healthcheck path is `/api/health`
- Check that `src/app.js` has the health endpoint

### Issue 4: bcrypt errors
**Solution:**
- Already fixed! We replaced bcrypt with bcryptjs
- Make sure you pushed the latest code

### Issue 5: CORS errors
**Solution:**
- Set `CORS_ORIGIN=*` temporarily
- After frontend deployment, update to your Vercel URL

---

## 🧪 Test Your Deployment

### 1. Check Health Endpoint
```bash
curl https://your-app.up.railway.app/api/health
```
**Expected:** `{"status":"ok"}`

### 2. Test API Root
```bash
curl https://your-app.up.railway.app/api
```
**Expected:** List of available routes or 404 (not "Not Found")

### 3. Check Railway Logs
**In Railway Dashboard:**
- Go to Deployments tab
- Click on latest deployment
- View logs for errors

---

## 📋 Railway Setup Checklist

- [ ] Root Directory set to `/server`
- [ ] All environment variables added
- [ ] MongoDB connection string correct
- [ ] MongoDB Atlas allows Railway IPs
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Latest code pushed to GitHub
- [ ] bcryptjs (not bcrypt) in package.json

---

## 🔧 Quick Fix Commands

### Regenerate JWT Secrets
```bash
node server/scripts/generate-jwt-secrets.js
```

### Test MongoDB Connection Locally
```bash
cd server
npm start
```
If this works, MongoDB is fine. Issue is Railway config.

### Push Latest Code
```bash
git add .
git commit -m "Fix: Update Railway configuration"
git push origin main
```
Railway will auto-redeploy.

---

## 🎯 Expected Railway Logs (Success)

When working correctly, you should see:
```
MongoDB connected
API listening on :XXXX
```

---

## 📞 Still Not Working?

### Check These:

1. **Railway Dashboard → Deployments**
   - Status should be "Active" (green)
   - Click on deployment to see logs
   - Look for error messages

2. **Railway Dashboard → Settings → Networking**
   - Should have a public URL
   - URL should be accessible

3. **Railway Dashboard → Variables**
   - All variables should be set
   - No typos in variable names

4. **GitHub Repository**
   - Latest code should be pushed
   - Check that `/server` folder exists

---

## 🚀 After Fixing

1. **Update Frontend Environment Variable:**
   ```env
   VITE_API_URL=https://your-app.up.railway.app/api
   ```

2. **Update CORS in Railway:**
   ```env
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

3. **Test the API:**
   ```bash
   curl https://your-app.up.railway.app/api/health
   ```

---

## 💡 Pro Tips

1. **Always check Railway logs first** - They show exactly what's wrong
2. **Test locally before deploying** - If it works locally, it's config issue
3. **Set Root Directory correctly** - Most common mistake!
4. **Allow all IPs in MongoDB Atlas** - For testing
5. **Use Railway's auto-assigned PORT** - Don't hardcode 5000

---

**Need more help?** Check Railway logs and paste any error messages.
