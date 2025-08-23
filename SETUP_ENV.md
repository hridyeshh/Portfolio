# Environment Setup Guide

## 🔐 Secure API Key Setup

To protect your API keys, follow these steps:

### 1. Create Environment File
```bash
cp backend/env.example backend/.env
```

### 2. Add Your API Keys
Edit `backend/.env` and add your actual API keys:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_actual_gemini_api_key_here

# GitHub API Configuration (Optional)
GITHUB_TOKEN=your_github_token_here

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8000,https://your-portfolio-domain.com
```

### 3. Security Benefits
- ✅ API keys are no longer exposed in frontend code
- ✅ Keys are stored securely in backend environment
- ✅ Frontend only communicates with your backend
- ✅ Backend handles all API calls securely

### 4. Important Notes
- Never commit `.env` files to git
- The `.env` file is already in `.gitignore`
- Your API keys are now secure and private

## 🚀 Start Server
```bash
npm start
```

Your portfolio will now use secure backend API calls instead of exposing keys in the frontend!
