#!/bin/bash

# 🚀 AI Portfolio Deployment Script
# This script helps you deploy your AI-powered portfolio to Vercel

echo "🚀 Starting AI Portfolio Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_status "Initializing git repository..."
    git init
    print_success "Git repository initialized"
else
    print_status "Git repository already exists"
fi

# Add all files
print_status "Adding files to git..."
git add .
print_success "Files added to git"

# Commit changes
print_status "Committing changes..."
git commit -m "AI Portfolio ready for Vercel deployment with trained responses"
print_success "Changes committed"

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote repository configured"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOUR_USERNAME/Portfolio.git"
    echo "3. Run: git push -u origin main"
    echo ""
    echo "🌐 Then deploy to Vercel:"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Add environment variable: GEMINI_API_KEY = AIzaSyDr62O2OODhj2Tm5LS8n5Ktc1ky5EkM134"
    echo "4. Deploy!"
    echo ""
else
    print_status "Pushing to remote repository..."
    git push origin main
    print_success "Code pushed to GitHub"
    
    echo ""
    echo "🎉 Code pushed successfully!"
    echo ""
    echo "🌐 Deploy to Vercel:"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Add environment variable: GEMINI_API_KEY = AIzaSyDr62O2OODhj2Tm5LS8n5Ktc1ky5EkM134"
    echo "4. Deploy!"
    echo ""
fi

echo "📋 Important Files:"
echo "✅ api/chat.js - Vercel serverless function with trained AI"
echo "✅ package.json - Dependencies for Vercel"
echo "✅ vercel.json - Vercel configuration"
echo "✅ index.html - Your portfolio frontend"
echo ""

echo "🧪 Test Questions for AI:"
echo "- 'Tell me about your experience at Amazon'"
echo "- 'What are your technical skills?'"
echo "- 'Tell me about your projects'"
echo "- 'What makes you unique?'"
echo ""

print_success "Deployment script completed! Follow the steps above to deploy to Vercel." 