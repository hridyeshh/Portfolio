# AI-Powered Portfolio

A modern, interactive portfolio website featuring an AI-powered chat assistant. Users can ask questions about Hridyesh’s experience, skills, and projects, and receive context-aware, beautifully formatted answers. Built with custom HTML, CSS, and JavaScript, and powered by a Node.js backend with Google Gemini AI integration.

---

## Features

- **AI Chat Assistant**:  
  - Ask anything about my background, skills, or projects  
  - Supports Markdown rendering for rich, readable responses

- **Dynamic Experience & Projects**:  
  - Detailed timeline of internships and major projects  
  - Project cards with tech stack highlights and external links

- **Responsive, Animated UI**:  
  - Smooth transitions, custom cursor, and section-based color theming  
  - Mobile-friendly design with touch support

- **Contact & Resume**:  
  - Quick-access buttons for Email, LinkedIn, GitHub, LeetCode, and Resume  
  - Downloadable resume in PDF format

- **API Integration**:  
  - Node.js backend with Gemini AI API  
  - GitHub API integration for real-time project data
  - Local and Vercel deployment support  
  - Rate limiting and fallback responses for reliability

---

## Technology Stack

- **Frontend**:  
  - HTML5, CSS3 (custom, responsive, animated)  
  - Vanilla JavaScript (ES6+), marked.js for Markdown rendering

- **Backend**:  
  - Node.js, Express.js  
  - Google Gemini AI API integration

- **Deployment**:  
  - Vercel (production)  
  - Local Node.js server for development

---

## Usage Guide

### AI Chat

- Go to the Contact section (“Let’s connect.”)
- Type your question in the search bar (e.g., “What experience do you have at any_company?”)

### Resume & Contact

- Use the bottom buttons to email, view LinkedIn, GitHub, LeetCode, or download the resume

### Projects & Skills

- Browse the Projects and Skills sections for detailed cards and categorized skills

---

## Key Features

- **AI-Powered Answers**:  
  - Short summary paragraph  

- **Responsive & Animated UI**:  
  - Custom cursor, smooth section transitions, and mobile support

- **Robust API**:  
  - Handles both local and Vercel deployments  
  - Fallback responses if AI API is unavailable

---

## Project Structure

```
Portfolio/
├── api/                # API endpoints (legacy)
├── assets/             # Icons and images
├── backend/            # Node.js backend (Express server, .env, etc.)
├── data/               # Resume context and processed data
├── Resume/             # PDF resume files
├── scripts/            # Frontend JS scripts
├── styles/             # CSS stylesheets
├── index.html          # Main HTML file
├── local-server.js     # Local static/AI server
└── test_api.html       # API test page
```

---

## Configuration

### Environment Variables

```env
# backend/.env
GEMINI_API_KEY=your_google_gemini_api_key
```

### Vercel Deployment

- Edit `vercel.json` for custom routing if needed
- Set environment variables in the Vercel dashboard

---

## Deployment

### Local

```bash
node local-server.js
# Visit http://localhost:8000
```

### Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel
```

---

## Testing

- Use `/test_api.html` to test the AI chat endpoint directly
- Try various questions in the Contact section to see formatted answers

---

## Security & Best Practices

- API keys are stored in `.env` (never commit this file)
- Rate limiting on backend to prevent abuse
- No user data is stored or tracked

