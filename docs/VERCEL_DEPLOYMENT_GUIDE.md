# 🚀 Vercel Deployment Guide for AI Portfolio

## Overview
This guide ensures your AI-powered portfolio works perfectly on Vercel with trained responses.

## 📋 Prerequisites
- GitHub account
- Vercel account
- Gemini API key

## 🔧 Step-by-Step Deployment

### 1. Create New GitHub Repository
```bash
# Initialize new repository
git init
git add .
git commit -m "Initial commit: AI-powered portfolio with trained responses"
```

### 2. Push to GitHub
```bash
# Create new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/Portfolio.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)

### 4. Environment Variables Setup
In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `GEMINI_API_KEY` | `AIzaSyDr62O2OODhj2Tm5LS8n5Ktc1ky5EkM134` | Production, Preview, Development |

### 5. Project Structure
```
Portfolio/
├── api/
│   └── chat.js          # Vercel serverless function
├── assets/              # Static assets
├── scripts/
│   └── script.js        # Frontend JavaScript
├── styles/
│   └── styles.css       # CSS styles
├── index.html           # Main portfolio page
├── package.json         # Dependencies
├── vercel.json          # Vercel configuration
└── .env                 # Local environment (not deployed)
```

## 🔍 Key Files Explained

### `api/chat.js`
- Vercel serverless function
- Handles AI chat requests
- Uses trained context for responses
- Requires `node-fetch` for API calls

### `package.json`
- Defines dependencies for Vercel
- Includes `node-fetch` for serverless functions
- Sets Node.js engine requirements

### `vercel.json`
- Routes API calls to serverless functions
- Configures static file serving
- Sets function timeout to 30 seconds

## 🧪 Testing Your Deployment

### 1. Test API Endpoint
```bash
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "Tell me about your experience at Amazon"}'
```

### 2. Test Frontend
- Visit your Vercel domain
- Go to Contact section
- Ask questions in the AI chat
- Verify you get trained responses, not generic ones

## 🔧 Troubleshooting

### Issue: Generic responses instead of trained ones
**Solution**: Check Vercel Function logs
1. Vercel Dashboard → Functions → chat
2. Look for errors like "fetch is not defined"
3. Ensure `GEMINI_API_KEY` is set correctly

### Issue: API calls failing
**Solution**: Verify environment variables
1. Vercel Dashboard → Settings → Environment Variables
2. Ensure `GEMINI_API_KEY` is set for all environments
3. Redeploy if needed

### Issue: Function timeout
**Solution**: Check vercel.json configuration
- `maxDuration: 30` should be sufficient
- If not, increase to 60 seconds

## 📊 Expected Behavior

### ✅ Working Correctly
- AI responds with detailed, trained information
- Company-specific responses (Amazon, IBM, etc.)
- Technical details and metrics mentioned
- Professional tone with "I" statements

### ❌ Not Working
- Generic responses like "I'm a software developer..."
- No specific company information
- Missing technical details
- Fallback responses

## 🎯 Success Criteria

After deployment, test these questions:
1. "Tell me about your experience at Amazon" → Should mention customer-centric approach
2. "What are your technical skills?" → Should list specific technologies
3. "Tell me about your projects" → Should mention Email Oasis, FurniAR, etc.
4. "What makes you unique?" → Should mention storytelling perspective

## 🚀 Quick Deploy Commands

```bash
# 1. Create new GitHub repo
# 2. Push code
git add .
git commit -m "AI portfolio ready for Vercel"
git push origin main

# 3. Deploy to Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Add environment variables
# - Deploy
```

## 📞 Support

If issues persist:
1. Check Vercel Function logs
2. Verify environment variables
3. Test API endpoint directly
4. Compare with local server behavior

---

**Note**: This setup ensures your AI chat works exactly like your local server with full trained responses! 