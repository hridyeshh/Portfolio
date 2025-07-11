#!/bin/bash

echo "🚀 Portfolio AI Deployment Helper"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    echo "   git remote add origin https://github.com/yourusername/your-repo.git"
    echo "   git push -u origin main"
    exit 1
fi

# Check if backend files exist
if [ ! -f "backend/server.js" ]; then
    echo "❌ Backend files not found. Make sure you're in the project root directory."
    exit 1
fi

echo "✅ Repository structure looks good!"
echo ""

echo "📋 Deployment Checklist:"
echo "========================"
echo ""

echo "1. 🔧 Backend Deployment (Render)"
echo "   - Go to https://render.com"
echo "   - Sign up and connect GitHub"
echo "   - Create new Web Service"
echo "   - Configure:"
echo "     • Name: portfolio-ai-backend"
echo "     • Build Command: npm install"
echo "     • Start Command: npm start"
echo "     • Root Directory: backend"
echo "   - Add Environment Variables:"
echo "     • GEMINI_API_KEY: your_actual_api_key"
echo "     • NODE_ENV: production"
echo "   - Deploy and copy the URL"
echo ""

echo "2. 🔄 Update Frontend Configuration"
echo "   - Open scripts/script.js"
echo "   - Find line ~150: BACKEND_URL"
echo "   - Replace with your Render URL"
echo "   - Commit and push changes"
echo ""

echo "3. 🌐 Frontend Deployment (Vercel)"
echo "   - Go to https://vercel.com"
echo "   - Sign up and connect GitHub"
echo "   - Import your repository"
echo "   - Deploy (auto-detects static site)"
echo "   - Copy your domain URL"
echo ""

echo "4. 🔒 Update CORS Settings"
echo "   - Go back to Render dashboard"
echo "   - Add environment variable:"
echo "     • ALLOWED_ORIGINS: your-vercel-domain.vercel.app,http://localhost:8000"
echo "   - Redeploy backend"
echo ""

echo "5. 🧪 Test Everything"
echo "   - Visit your Vercel domain"
echo "   - Go to contact section"
echo "   - Try asking the AI assistant questions"
echo ""

echo "📝 Quick Commands:"
echo "=================="
echo ""

echo "# Push latest changes"
echo "git add ."
echo "git commit -m 'Update for deployment'"
echo "git push"
echo ""

echo "# Test backend locally"
echo "cd backend"
echo "GEMINI_API_KEY=your_key node server.js"
echo ""

echo "# Test frontend locally"
echo "python3 -m http.server 8000"
echo ""

echo "🎯 Your trained AI model will work on the hosted website!"
echo "   The same responses you get locally will be available online."
echo ""

echo "💡 Pro Tips:"
echo "============="
echo "• Use different API keys for dev/prod"
echo "• Monitor your API usage"
echo "• Set up alerts for downtime"
echo "• Consider a custom domain"
echo ""

echo "📚 Full guide: DEPLOYMENT_GUIDE.md"
echo "🔗 Render: https://render.com"
echo "🔗 Vercel: https://vercel.com" 