# 🔗 GitHub API Integration Guide

This guide will help you set up GitHub API access for your portfolio's AI assistant, enabling it to provide real-time information about your projects, commits, and activity.

## 🎯 **What This Enables**

Your AI assistant will now be able to answer questions like:
- **"What are your most recent projects?"** → Real-time repository data
- **"How active are you on GitHub?"** → Live commit and activity stats
- **"What languages do you code in?"** → Current repository language analysis
- **"Tell me about your GitHub profile"** → Follower count, repository stats
- **"What's your latest work?"** → Recent commits and repository updates

## 🔑 **Step 1: Create GitHub Personal Access Token**

### **1.1 Go to GitHub Settings**
1. Log into your GitHub account
2. Click your profile picture → **Settings**
3. Scroll down to **Developer settings** (bottom left)
4. Click **Personal access tokens** → **Tokens (classic)**

### **1.2 Generate New Token**
1. Click **Generate new token** → **Generate new token (classic)**
2. Give it a descriptive name: `Portfolio AI Assistant`
3. Set expiration: **90 days** (recommended for security)
4. Select scopes:
   - ✅ **public_repo** (read public repositories)
   - ✅ **read:user** (read user profile)
   - ✅ **read:org** (read organization data if needed)

### **1.3 Copy Your Token**
- **⚠️ IMPORTANT**: Copy the token immediately - you won't see it again!
- Store it securely (we'll add it to environment variables)

## 🔧 **Step 2: Configure Environment Variables**

### **For Local Development**
1. Open `backend/.env` file
2. Add your GitHub token:
```env
GITHUB_TOKEN=ghp_your_actual_token_here
```

### **For Vercel Deployment**
1. Go to your Vercel dashboard
2. Select your portfolio project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: `ghp_your_actual_token_here`
   - **Environment**: Production, Preview, Development

### **For Render/Other Platforms**
Add the environment variable in your deployment platform's settings:
```env
GITHUB_TOKEN=ghp_your_actual_token_here
```

## 🧪 **Step 3: Test the Integration**

### **Test GitHub Data Endpoint**
```bash
# Local development
curl http://localhost:3001/api/github

# Vercel deployment
curl https://your-domain.vercel.app/api/github
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "profile": {
      "login": "hridyeshh",
      "public_repos": 25,
      "followers": 15,
      "following": 20,
      "html_url": "https://github.com/hridyeshh"
    },
    "repositories": [
      {
        "name": "Portfolio",
        "description": "AI-powered portfolio",
        "stargazers_count": 5,
        "forks_count": 2,
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "summary": {
      "totalRepositories": 25,
      "followers": 15,
      "following": 20
    }
  }
}
```

### **Test AI Chat with GitHub Data**
1. Go to your portfolio's Contact section
2. Ask: **"What are your recent GitHub projects?"**
3. The AI should now provide real-time repository information

## 📊 **What Data is Available**

### **Profile Information**
- Follower/Following counts
- Total public repositories
- Account creation date
- Profile URL

### **Repository Data**
- Repository names and descriptions
- Star and fork counts
- Last updated dates
- Repository URLs
- Language statistics

### **Activity Metrics**
- Recent commit activity
- Repository update frequency
- Contribution patterns

## 🔒 **Security Best Practices**

### **Token Security**
- ✅ Use **90-day expiration** for tokens
- ✅ Only grant **read-only** permissions
- ✅ Store tokens in **environment variables**
- ❌ Never commit tokens to code
- ❌ Don't share tokens publicly

### **Rate Limiting**
- GitHub API has rate limits (5,000 requests/hour for authenticated users)
- The system includes caching to minimize API calls
- Data is cached for 30 minutes to reduce API usage

## 🚀 **Advanced Features**

### **Custom Repository Filtering**
You can modify `github-api.js` to:
- Filter repositories by language
- Show only starred repositories
- Include private repositories (requires additional scopes)

### **Enhanced Analytics**
The system can provide:
- Language usage trends
- Commit frequency analysis
- Repository popularity metrics
- Contribution timeline

## 🐛 **Troubleshooting**

### **Common Issues**

**1. "GitHub API error: 401"**
- Check your token is valid and not expired
- Verify token has correct permissions

**2. "GitHub API error: 403"**
- You've hit rate limits
- Wait a few minutes and try again

**3. "Failed to fetch GitHub data"**
- Check your internet connection
- Verify the GitHub username is correct in the code

**4. No GitHub data in AI responses**
- Check environment variables are set correctly
- Verify the GitHub API integration is working
- Check server logs for errors

### **Debugging Steps**
1. Test the GitHub endpoint directly
2. Check environment variables
3. Verify token permissions
4. Check server logs
5. Test with a simple curl request

## 📈 **Monitoring Usage**

### **Check API Usage**
```bash
# Check your GitHub API rate limit
curl -H "Authorization: token YOUR_TOKEN" \
  https://api.github.com/rate_limit
```

### **Expected Response:**
```json
{
  "resources": {
    "core": {
      "limit": 5000,
      "remaining": 4990,
      "reset": 1642233600
    }
  }
}
```

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

1. **GitHub endpoint returns data** ✅
2. **AI responses include live repository info** ✅
3. **No rate limit errors** ✅
4. **Cached data refreshes every 30 minutes** ✅

## 🔄 **Updating Token**

When your token expires:
1. Generate a new token following Step 1
2. Update the environment variable
3. Redeploy your application
4. Test the integration

---

**🎯 Next Steps:**
1. Create your GitHub token
2. Add it to your environment variables
3. Test the integration
4. Ask your AI assistant about your GitHub activity!

Your AI assistant will now provide real-time, dynamic information about your GitHub profile and projects! 🚀 