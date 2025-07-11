# Vercel Deployment Guide for Portfolio AI

## 🚀 Deploy Everything to Vercel (Frontend + Backend)

Your portfolio with the trained AI model can be deployed entirely on Vercel using serverless functions!

### **✅ What's Ready:**
- ✅ `api/chat.js` - Vercel serverless function with your trained AI model
- ✅ `vercel.json` - Vercel configuration
- ✅ Frontend updated to use `/api/chat` endpoint
- ✅ All your resume data and company-specific contexts included

### **🎯 Step-by-Step Deployment:**

#### **Step 1: Deploy to Vercel**
1. **Go to [vercel.com](https://vercel.com)** and sign up
2. **Connect your GitHub** repository
3. **Import your repository** as a new project
4. **Vercel will auto-detect** the configuration from `vercel.json`
5. **Add Environment Variable:**
   - Go to Project Settings → Environment Variables
   - Add: `GEMINI_API_KEY` = `AIzaSyDr62O2OODhj2Tm5LS8n5Ktc1ky5EkM134`
6. **Deploy** - Vercel will build and deploy everything automatically

#### **Step 2: Test Your AI Assistant**
1. Visit your Vercel domain (e.g., `https://your-portfolio.vercel.app`)
2. Go to the contact section
3. Try asking questions like:
   - "Tell me about your experience"
   - "What are your skills?"
   - "Tell me about your Amazon experience"
   - "What projects have you worked on?"

### **🔧 How It Works:**

#### **Frontend (`index.html` + `scripts/script.js`)**
- Serves your portfolio website
- Makes API calls to `/api/chat` (same domain)
- No CORS issues since everything is on Vercel

#### **Backend (`api/chat.js`)**
- Vercel serverless function
- Contains your complete trained AI model
- Includes all resume data and company-specific contexts
- Handles Gemini API calls securely

#### **Configuration (`vercel.json`)**
- Routes API calls to serverless functions
- Serves static files (HTML, CSS, JS)
- Sets function timeout to 30 seconds

### **🎯 Benefits of Vercel Deployment:**

✅ **Everything in one place** - Frontend and backend on same domain  
✅ **No CORS issues** - Same origin requests  
✅ **Automatic scaling** - Serverless functions scale automatically  
✅ **Free tier** - Generous free limits  
✅ **Easy deployment** - Just push to GitHub  
✅ **Custom domains** - Easy to set up  
✅ **Analytics** - Built-in performance monitoring  

### **🧪 Testing Your Deployment:**

#### **Test Backend Function:**
```bash
curl -X POST https://your-portfolio.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"query":"Tell me about your experience"}'
```

#### **Test Frontend:**
1. Visit your Vercel domain
2. Go to contact section
3. Ask the AI assistant questions

### **🔒 Security Features:**

✅ **Environment variables** - API key stored securely  
✅ **Input validation** - Query length and content checks  
✅ **Error handling** - Graceful fallbacks  
✅ **Rate limiting** - Built into Vercel  
✅ **CORS handling** - Proper headers set  

### **📊 Monitoring:**

#### **Vercel Dashboard:**
- Function execution logs
- Performance metrics
- Error tracking
- Usage statistics

#### **Function Logs:**
- API call logs
- Response times
- Error messages

### **🔄 Updating Your AI Model:**

#### **Method 1: Update Context in Code**
1. Edit the `portfolioContext` in `api/chat.js`
2. Commit and push to GitHub
3. Vercel auto-deploys

#### **Method 2: Update Resume Data**
1. Replace PDFs in `Resume/` folder
2. Run processing scripts locally
3. Copy generated context to `api/chat.js`
4. Deploy

### **🚨 Troubleshooting:**

#### **Common Issues:**

1. **Function Timeout**
   - Increase `maxDuration` in `vercel.json`
   - Optimize API calls

2. **Environment Variable Missing**
   - Check Vercel dashboard → Environment Variables
   - Redeploy after adding

3. **API Key Issues**
   - Verify Gemini API key is correct
   - Check API quota

4. **CORS Errors**
   - Shouldn't happen with Vercel (same domain)
   - Check if using correct endpoint

### **💡 Pro Tips:**

1. **Use Vercel CLI** for local testing:
   ```bash
   npm i -g vercel
   vercel dev
   ```

2. **Monitor API usage** to avoid hitting limits

3. **Set up custom domain** for professional look

4. **Enable analytics** to track AI assistant usage

5. **Use preview deployments** for testing changes

### **🎯 Quick Start:**

1. **Push your code:**
   ```bash
   git add .
   git commit -m "Add Vercel deployment"
   git push
   ```

2. **Deploy to Vercel:**
   - Go to vercel.com
   - Import your repository
   - Add `GEMINI_API_KEY` environment variable
   - Deploy

3. **Test everything:**
   - Visit your domain
   - Test AI assistant
   - Share your portfolio!

### **✅ Result:**
Your trained AI model will work perfectly on your hosted website with the same quality responses you get locally! 🚀

The AI assistant will have all your resume data, company-specific contexts, and personalized responses available online. 