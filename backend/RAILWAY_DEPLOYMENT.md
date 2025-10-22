# Railway Deployment Guide

## Prerequisites

1. Create a Railway account at [railway.app](https://railway.app)
2. Install Railway CLI (optional):
   ```bash
   npm install -g @railway/cli
   ```

## Deployment Steps

### Option 1: Deploy via GitHub (Recommended - CI/CD)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Add Railway configuration"
   git push origin main
   ```

2. **Connect to Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect the backend folder

3. **Configure Environment Variables**
   - In Railway dashboard, go to your project
   - Click on "Variables" tab
   - Add the following variables:
     ```
     PORT=5000
     NODE_ENV=production
     ```
   - Add database variables when you set up your database

4. **Deploy**
   - Railway will automatically deploy on every push to main branch
   - You'll get a public URL like: `https://your-app.railway.app`

### Option 2: Deploy via Railway CLI

1. **Login to Railway**
   ```bash
   railway login
   ```

2. **Initialize project**
   ```bash
   cd backend
   railway init
   ```

3. **Link to your project** (if already created)
   ```bash
   railway link
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Set environment variables**
   ```bash
   railway variables set PORT=5000
   railway variables set NODE_ENV=production
   ```

## Adding a Database

### PostgreSQL (Recommended)

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway automatically creates and injects these environment variables:
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

3. Install PostgreSQL client in your backend:
   ```bash
   npm install pg
   ```

4. Use in your code:
   ```javascript
   const { Pool } = require('pg');
   const pool = new Pool({
     connectionString: process.env.DATABASE_URL,
     ssl: { rejectUnauthorized: false }
   });
   ```

## Monitoring & Logs

- **View logs**: Railway dashboard → Your service → "Deployments" tab
- **Monitor usage**: Dashboard shows RAM, CPU, network usage
- **Check costs**: "Usage" tab shows current month spending

## Environment Variables Needed

Add these in Railway dashboard as you develop:

```bash
# Required
PORT=5000
NODE_ENV=production

# Database (auto-added if using Railway PostgreSQL)
DATABASE_URL=postgresql://...

# Add these when implementing features
JWT_SECRET=your_secret_key_here
API_KEY=your_api_key_here
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

## Custom Domain (Optional)

1. In Railway dashboard → Settings → Domains
2. Click "Generate Domain" for free Railway subdomain
3. Or add your custom domain

## Troubleshooting

### Build fails
- Check Railway build logs in dashboard
- Ensure `package.json` has correct `engines` field
- Verify all dependencies are in `dependencies` (not `devDependencies`)

### Server not responding
- Check if PORT environment variable is set
- Verify server is listening on `process.env.PORT`
- Check logs for errors

### Database connection fails
- Ensure PostgreSQL service is running
- Check DATABASE_URL is set correctly
- Verify SSL settings in connection config

## Auto-Deploy Setup

Railway automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit and push to main branch
3. Railway detects changes and redeploys automatically
4. Check deployment status in Railway dashboard

## Useful Commands

```bash
# View logs
railway logs

# Open dashboard
railway open

# Run commands in Railway environment
railway run node src/server.js

# Check status
railway status
```

## Cost Monitoring

- Free tier: $5/month credit
- Monitor usage in dashboard
- Set up usage alerts in settings
- Typical development costs: $0-5/month

## Next Steps

1. ✅ Deploy backend to Railway
2. ⬜ Add PostgreSQL database
3. ⬜ Connect frontend to Railway backend URL
4. ⬜ Set up environment variables
5. ⬜ Implement WebSocket for real-time scale data
