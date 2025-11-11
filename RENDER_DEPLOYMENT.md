# SmartFit Backend Deployment Guide

## Render Deployment Setup

This document contains all the information needed to deploy the backend to Render.

### Backend Configuration Files Ready ✅

- ✅ `server/index.js` - Configured for environment variables
- ✅ `package.json` - Contains correct `start` script: `node server/index.js`
- ✅ `.env` - Local development configuration
- ✅ `.env.example` - Template for reference
- ✅ `.gitignore` - Prevents `.env` from being committed
- ✅ CORS - Configured to accept `FRONTEND_URL` environment variable

### Step-by-Step Render Deployment

#### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub for easier integration
- Verify email

#### 2. Create New Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository: `Ahmed4482/project`
- Select `main` branch

#### 3. Configure Service
```
Name: smartfit-backend
Environment: Node
Region: Singapore (or closest to you)
Build Command: (leave empty)
Start Command: npm start
```

#### 4. Add Environment Variables to Render

Add these variables in Render dashboard (Settings → Environment):

```
MONGODB_URI=mongodb+srv://zoak4242_db_user:6ypHpo5dzapuiXA0@cluster0.xtlarbd.mongodb.net/smartfit?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET=ahmed_key

NODE_ENV=production

PORT=5000

STRIPE_SECRET_KEY=sk_test_51SRrPo4vWGnEBM3E48lSB98ERzmPkydiNjRN3KwAfSr5tHS5LLkcFGJRF0PfZ7faGIPUV90W8MQewi7oRnKqx4eF00DLB02K8m

CLOUDINARY_CLOUD_NAME=dhputqxl7

CLOUDINARY_API_KEY=446572221419878

CLOUDINARY_API_SECRET=kvzx31Dhcji2WQ19XwOGq_Xx1bw

GROQ_API_KEY=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

FRONTEND_URL=(will update after frontend is deployed)
```

#### 5. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Check logs for "Server running" message
- Get your URL: `https://smartfit-backend.onrender.com`

#### 6. Test Deployment
```
curl https://smartfit-backend.onrender.com/api/health
```

Should return:
```json
{
  "status": "Server is running",
  "timestamp": "2025-11-11T...",
  "database": "Connected"
}
```

### Update MongoDB IP Whitelist

For the backend to connect to MongoDB:

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Enter `0.0.0.0/0` to allow all IPs (development/testing)
   - For production, add Render's specific IPs
4. Click "Confirm"

### After Backend is Deployed

Update your local `.env`:
```
VITE_API_URL=https://smartfit-backend.onrender.com/api
```

Then commit and push to trigger a new frontend build if needed.

### Important Notes

- ✅ `.env` file is in `.gitignore` - won't be exposed
- ✅ All secrets are stored in Render environment variables
- ✅ CORS is configured to allow FRONTEND_URL
- ✅ Server uses PORT from environment or defaults to 5000
- ✅ dotenv is loaded at server start

### Troubleshooting

**Issue: "Cannot connect to MongoDB"**
- Check MongoDB IP whitelist allows Render IPs
- Verify MONGODB_URI in Render environment variables

**Issue: "CORS errors from frontend"**
- Update FRONTEND_URL in Render when frontend is deployed
- Restart the service after updating environment variables

**Issue: "Port already in use"**
- Render assigns port automatically
- Check that code uses `process.env.PORT || 5000`
- ✅ Already configured in server/index.js

**Issue: "Service keeps crashing"**
- Check Render logs for errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct

### File Readiness Checklist

- [x] `server/index.js` - Ready (PORT and CORS configured)
- [x] `package.json` - Ready (start script defined)
- [x] `.env` - Ready (local dev values set)
- [x] `.env.example` - Ready (template created)
- [x] `.gitignore` - Ready (prevents .env exposure)
- [x] CORS configuration - Ready (accepts FRONTEND_URL)
- [x] GitHub repository - Ready (pushed and public)

### Quick Render Environment Variables Template

Copy and paste these into Render dashboard:

```
MONGODB_URI=mongodb+srv://zoak4242_db_user:6ypHpo5dzapuiXA0@cluster0.xtlarbd.mongodb.net/smartfit?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=ahmed_key
NODE_ENV=production
PORT=5000
STRIPE_SECRET_KEY=sk_test_51SRrPo4vWGnEBM3E48lSB98ERzmPkydiNjRN3KwAfSr5tHS5LLkcFGJRF0PfZ7faGIPUV90W8MQewi7oRnKqx4eF00DLB02K8m
CLOUDINARY_CLOUD_NAME=dhputqxl7
CLOUDINARY_API_KEY=446572221419878
CLOUDINARY_API_SECRET=kvzx31Dhcji2WQ19XwOGq_Xx1bw
GROQ_API_KEY=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
FRONTEND_URL=http://localhost:5173
```

---

**Status**: Ready for Render deployment ✅
**Last Updated**: November 11, 2025
