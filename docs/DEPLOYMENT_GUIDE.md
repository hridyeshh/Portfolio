# Portfolio AI Backend Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Render (Recommended - Free)
1. **Sign up** at [render.com](https://render.com)
2. **Connect your GitHub** repository
3. **Create a new Web Service**
4. **Configure deployment:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `GEMINI_API_KEY`: Your Gemini API key
     - `NODE_ENV`: `production`
     - `ALLOWED_ORIGINS`: Your domain (e.g., `https://your-portfolio.vercel.app`)

5. **Deploy** and get your backend URL (e.g., `https://your-app.onrender.com`)

### Option 2: Railway (Alternative - Free tier)
1. **Sign up** at [railway.app](https://railway.app)
2. **Connect GitHub** and select your repository
3. **Add environment variables** in Railway dashboard
4. **Deploy** automatically

### Option 3: Heroku (Paid)
1. **Install Heroku CLI**
2. **Login:** `heroku login`
3. **Create app:** `heroku create your-portfolio-backend`
4. **Set environment variables:**
   ```bash
   heroku config:set GEMINI_API_KEY=your_key_here
   heroku config:set NODE_ENV=production
   ```
5. **Deploy:** `git push heroku main`

## 🔧 Frontend Configuration

After deploying your backend, update the frontend configuration:

### 1. Update Backend URL
In `scripts/script.js`, line ~150:
```javascript
const BACKEND_URL = 'https://your-actual-backend-url.com';
```

### 2. Update CORS Settings
In your backend's environment variables, set:
```
ALLOWED_ORIGINS=https://your-portfolio-domain.com,http://localhost:8000
```

## 🌐 Frontend Deployment

### Vercel (Recommended)
1. **Connect your GitHub** to [vercel.com](https://vercel.com)
2. **Import your repository**
3. **Deploy** - Vercel will automatically detect it's a static site
4. **Get your domain** (e.g., `https://your-portfolio.vercel.app`)

### Netlify (Alternative)
1. **Sign up** at [netlify.com](https://netlify.com)
2. **Connect GitHub** and select your repository
3. **Deploy** automatically

## 🔐 Security Best Practices

### 1. Environment Variables
- **Never commit API keys** to your repository
- Use environment variables in your deployment platform
- Keep your `.env` file in `.gitignore`

### 2. CORS Configuration
- Only allow your specific domain
- Don't use `*` for production
- Include both `http://localhost:8000` (for development) and your production domain

### 3. Rate Limiting
Your backend already includes rate limiting (100 requests/hour per IP)

## 📝 Step-by-Step Deployment

### Step 1: Deploy Backend to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `portfolio-ai-backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Root Directory:** `backend`
5. Add environment variables:
   - `GEMINI_API_KEY`: Your actual Gemini API key
   - `NODE_ENV`: `production`
6. Click "Create Web Service"
7. Wait for deployment and copy your URL (e.g., `https://portfolio-ai-backend.onrender.com`)

### Step 2: Update Frontend Configuration
1. Open `scripts/script.js`
2. Find line ~150: `const BACKEND_URL = 'https://your-render-backend-url.onrender.com';`
3. Replace with your actual Render URL
4. Commit and push changes

### Step 3: Deploy Frontend to Vercel
1. Go to [vercel.com](https://vercel.com) and sign up
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./` (root)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
5. Click "Deploy"
6. Get your domain (e.g., `https://your-portfolio.vercel.app`)

### Step 4: Update CORS Settings
1. Go back to your Render dashboard
2. Find your backend service
3. Go to "Environment" tab
4. Add environment variable:
   - `ALLOWED_ORIGINS`: `https://your-portfolio.vercel.app,http://localhost:8000`
5. Redeploy your backend

## 🧪 Testing Your Deployment

### Test Backend Health
```bash
curl https://your-backend-url.onrender.com/health
```

### Test AI Chat
```bash
curl -X POST https://your-backend-url.onrender.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Tell me about your experience"}'
```

### Test Frontend
1. Visit your Vercel domain
2. Go to the contact section
3. Try asking questions to the AI assistant

## 🔄 Updating Your Resume Data

### Method 1: Manual Update
1. Replace PDFs in `Resume/` folder
2. Run the processing scripts locally:
   ```bash
   cd scripts
   node multi_resume_processor.js
   ```
3. Copy the generated context to your backend's `portfolioContext` variable
4. Redeploy your backend

### Method 2: Automated Updates (Advanced)
Consider implementing a webhook system for automatic updates when you change your resume PDFs.

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check your `ALLOWED_ORIGINS` environment variable
   - Make sure your frontend domain is included

2. **API Key Issues**
   - Verify your Gemini API key is correct
   - Check if you have sufficient API quota

3. **Backend Not Responding**
   - Check Render/Railway logs
   - Verify environment variables are set correctly
   - Test with health endpoint

4. **Frontend Can't Reach Backend**
   - Verify the backend URL in `script.js`
   - Check if backend is actually deployed and running
   - Test backend directly with curl

### Debug Commands:
```bash
# Test backend health
curl https://your-backend-url.com/health

# Test AI chat
curl -X POST https://your-backend-url.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Hello"}'

# Check CORS
curl -H "Origin: https://your-frontend-domain.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS https://your-backend-url.com/api/chat
```

## 📊 Monitoring

### Render Dashboard
- Monitor request logs
- Check error rates
- View response times

### Vercel Analytics
- Track page views
- Monitor performance
- Check for errors

## 🔄 Continuous Deployment

Your setup supports automatic deployments:
- **Frontend:** Vercel auto-deploys on git push
- **Backend:** Render auto-deploys on git push

Just push to your main branch and both will update automatically!

## 💡 Pro Tips

1. **Use different API keys** for development and production
2. **Monitor your API usage** to avoid hitting limits
3. **Set up alerts** for when your backend is down
4. **Use a custom domain** for a more professional look
5. **Implement caching** for better performance
6. **Add analytics** to track AI assistant usage

## 🎯 Next Steps

1. Deploy your backend to Render
2. Update your frontend configuration
3. Deploy your frontend to Vercel
4. Test the complete system
5. Share your portfolio with the world!

Your AI assistant will now work on your hosted website with the same trained responses you get locally! 🚀 