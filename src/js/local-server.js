const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// GitHub API integration (simplified for local server)
// Simple cache for GitHub data
let githubCache = null;
let lastGitHubFetch = 0;
const GITHUB_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

class GitHubAPI {
    constructor() {
        this.baseURL = 'https://api.github.com';
        this.username = 'hridyeshh';
        this.token = process.env.GITHUB_TOKEN;
        this.headers = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Portfolio-AI-Assistant'
        };
        
        if (this.token) {
            this.headers['Authorization'] = `token ${this.token}`;
        }
    }

    async makeRequest(endpoint) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('GitHub API request failed:', error);
            return null;
        }
    }

    async getBasicData() {
        const now = Date.now();
        
        // Return cached data if it's still fresh
        if (githubCache && (now - lastGitHubFetch) < GITHUB_CACHE_DURATION) {
            return githubCache;
        }
        
        try {
            const [profile, repositories] = await Promise.all([
                this.makeRequest(`/users/${this.username}`),
                this.makeRequest(`/users/${this.username}/repos?sort=updated&per_page=10`)
            ]);

            if (!profile || !repositories) return null;

            const data = {
                profile,
                repositories: repositories.slice(0, 5),
                summary: {
                    totalRepositories: profile.public_repos,
                    followers: profile.followers,
                    following: profile.following,
                    accountCreated: profile.created_at
                }
            };
            
            // Cache the data
            githubCache = data;
            lastGitHubFetch = now;
            
            return data;
        } catch (error) {
            console.error('Error fetching basic GitHub data:', error);
            return githubCache; // Return stale cache if available
        }
    }

    formatForAIContext(data) {
        if (!data) return '';

        const { profile, repositories, summary } = data;
        
        let context = `\n\nLIVE GITHUB DATA:\n`;
        context += `GitHub Profile: ${profile.html_url}\n`;
        context += `Followers: ${summary.followers} | Following: ${summary.following}\n`;
        context += `Public Repositories: ${summary.totalRepositories}\n\n`;

        context += `RECENT REPOSITORIES:\n`;
        repositories.forEach((repo, index) => {
            const lastUpdated = new Date(repo.updated_at).toLocaleDateString();
            
            context += `${index + 1}. ${repo.name}\n`;
            context += `   Description: ${repo.description || 'No description'}\n`;
            context += `   Stars: ${repo.stargazers_count} | Forks: ${repo.forks_count}\n`;
            context += `   Last Updated: ${lastUpdated}\n`;
            context += `   URL: ${repo.html_url}\n\n`;
        });

        return context;
    }
}

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Groq API configuration
const GROQ_API_KEY = process.env.GEMINI_API_KEY; // key stored under GEMINI_API_KEY in .env
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Portfolio context - customize this with your complete information
const portfolioContext = `
You are an AI assistant embedded in Hridyesh Kumar's portfolio. Speak in first person AS Hridyesh. Keep responses concise (2-4 sentences max unless detail is specifically requested). Be warm but direct.

TONE: Greetings → brief, ask what they want to know. Technical questions → specific, mention numbers/tech/impact. Never list everything at once; answer what was asked. Use "I" — you are Hridyesh.

CURRENT WORK:

1. SOFTWARE ENGINEER — THINKERBELL LABS, BANGALORE (March 2026 – Present)
   Thinkerbell builds assistive tech for the visually impaired (Annie braille device, Helios platform).
   - Built full multiplayer stack for Helios + Annie FSM — backend to device-level Socket.IO real-time sync
   - Took Chalk-Tactera mobile app from empty repo to functioning build: REST APIs, OTP auth, rate limiting, session token security
   - Fixed field crashes on Annie devices caused by corrupted content packs
   - Hardened production infra: automated MongoDB → S3 backup pipelines, alerting, deploy reliability

2. FOUNDING ENGINEER — PAPERBOXD (November 2025 – Present)
   Paperboxd is a Letterboxd-for-books social book-tracking platform.
   - Built entire product from scratch: Next.js 15 (TypeScript), Go backend with 60+ REST endpoints, PostgreSQL + Redis
   - Native iOS app in Swift/SwiftUI — browse reading lists, log books, discover new reads
   - Live at paperboxd.in

3. SOFTWARE ENGINEER — AUTOGRAD, REMOTE (August 2025 – March 2026)
   - Full-stack AI exam-evaluation platform (React/TypeScript + Python/FastAPI) with LangChain/LangGraph — 100+ concurrent evaluations, cut manual grading time by 90%
   - MongoDB aggregation pipelines + semantic answer-chunking: +85% accuracy, 5× faster processing

4. SOFTWARE DEVELOPMENT INTERN — LIMEROAD, GURUGRAM (February 2025 – August 2025)
   - Integrated Vmart storefront via secure WebView + refactored sidebar routing (Kotlin MVVM)
   - Built "AddAddress" screen with Material3, Android 13 location APIs — reduced checkout drop-offs
   - Fuzzy search system (Levenshtein, Jaro-Winkler, Soundex) in TypeScript: 95% accuracy, <50ms response

PROJECTS:
- Paperboxd (paperboxd.in) — Next.js 15, TypeScript, Go, PostgreSQL, Redis, iOS
- Paperboxd Backend (github.com/hridyeshh/paperboxd-backend) — Go, 60+ endpoints, JWT auth
- Desky (github.com/hridyeshh/desky) — Raspberry Pi desk display, Go, PostgreSQL
- Wallet Service (github.com/hridyeshh/wallet-service) — Go financial ledger, double-entry bookkeeping, Docker
- Grover's Oracle (github.com/hridyeshh/Optimising-Oracle-function) — Qiskit, Python, quantum computing
- Mailify (github.com/hridyeshh/Mailify) — Node.js, Gemini AI, Gmail API, bulk email automation
- Paperboxd iOS — Swift, SwiftUI, native iOS app

TECH STACK:
Languages: Go, TypeScript, Python, Swift, Kotlin, Java, SQL
Web: Next.js, React, Node.js, FastAPI, Tailwind CSS
Mobile: SwiftUI, Jetpack Compose, Android SDK
AI/ML: LangChain, LangGraph, Gemini AI, Qiskit
Infra: PostgreSQL, Redis, MongoDB, Docker, AWS, S3

CONTACT:
Email: hridyesh2309@gmail.com | GitHub: github.com/hridyeshh | LinkedIn: linkedin.com/in/hridyeshh
`;

// Rate limiting (optional but recommended)
const requestCounts = new Map();
const RATE_LIMIT = 100; // requests per hour per IP
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function checkRateLimit(ip) {
    const now = Date.now();
    const userRequests = requestCounts.get(ip) || [];
    // Filter out old requests
    const recentRequests = userRequests.filter(time => now - time < RATE_WINDOW);
    if (recentRequests.length >= RATE_LIMIT) {
        return false;
    }
    recentRequests.push(now);
    requestCounts.set(ip, recentRequests);
    return true;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    // Rate limiting
    const clientIp = req.ip || req.connection.remoteAddress;
    if (!checkRateLimit(clientIp)) {
        return res.status(429).json({ 
            error: 'Rate limit exceeded. Please try again later.' 
        });
    }
    try {
        const { query, conversationHistory = [] } = req.body;
        // Validate input
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({ error: 'Query is required' });
        }
        if (query.length > 500) {
            return res.status(400).json({ error: 'Query too long (max 500 characters)' });
        }
        // Build conversation context
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n';
            conversationHistory.slice(-6).forEach(msg => {
                conversationContext += `${msg.role}: ${msg.content}\n`;
            });
        }
        
        // Get live GitHub data for enhanced context (with caching)
        let githubContext = '';
        
        // Only fetch GitHub data for relevant queries to improve speed
        const githubKeywords = ['github', 'repository', 'repo', 'commit', 'project', 'code', 'recent'];
        const shouldFetchGitHub = githubKeywords.some(keyword => query.toLowerCase().includes(keyword));
        
        if (shouldFetchGitHub) {
            try {
                const githubAPI = new GitHubAPI();
                const githubData = await githubAPI.getBasicData();
                if (githubData) {
                    githubContext = githubAPI.formatForAIContext(githubData);
                }
            } catch (error) {
                console.error('Error fetching GitHub data for chat:', error);
                // Continue without GitHub data if it fails
            }
        }
        
        // Prepare Groq API request
        const messages = [
            { role: 'system', content: portfolioContext + (githubContext ? '\n' + githubContext : '') }
        ];
        if (conversationHistory.length > 0) {
            conversationHistory.slice(-6).forEach(msg => messages.push({ role: msg.role, content: msg.content }));
        }
        messages.push({ role: 'user', content: query });

        const requestBody = {
            model: GROQ_MODEL,
            messages,
            temperature: 0.7,
            max_tokens: 300,
            top_p: 0.9
        };
        // Call Groq API
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Groq API Error:', errorData);
            
            // Handle rate limiting specifically
            if (response.status === 429) {
                console.log('Rate limit hit, using intelligent fallback response');
                
                // Enhanced intelligent fallback with better keyword matching
                const queryLower = query.toLowerCase();
                let fallbackResponse = "I'm experiencing high traffic right now, but I'd be happy to help! ";
                
                // Experience and work related
                if (queryLower.includes('experience') || queryLower.includes('work') || queryLower.includes('intern') || 
                    queryLower.includes('job') || queryLower.includes('career') || queryLower.includes('background') ||
                    queryLower.includes('limeroad') || queryLower.includes('college setu') || queryLower.includes('android') ||
                    queryLower.includes('kotlin') || queryLower.includes('typescript') || queryLower.includes('flask')) {
                    fallbackResponse += "I'm a Software Development Intern at Limeroad, where I work on Android development with Kotlin and implement advanced search systems with TypeScript. I previously interned at College Setu developing data collection portals with Flask and SQL.";
                } 
                // Skills and technology related
                else if (queryLower.includes('skill') || queryLower.includes('technology') || queryLower.includes('language') ||
                         queryLower.includes('programming') || queryLower.includes('code') || queryLower.includes('develop') ||
                         (queryLower.includes('java') && !queryLower.includes('who')) || 
                         (queryLower.includes('javascript') && !queryLower.includes('who')) || 
                         (queryLower.includes('react') && !queryLower.includes('who')) ||
                         (queryLower.includes('android') && !queryLower.includes('who')) || 
                         (queryLower.includes('sdk') && !queryLower.includes('who')) || 
                         (queryLower.includes('framework') && !queryLower.includes('who'))) {
                    fallbackResponse += "My key skills include Java, Kotlin, JavaScript, TypeScript, React, Android SDK, and various development tools. I'm passionate about clean architecture and performance optimization.";
                    return res.status(200).json({
                        response: fallbackResponse,
                        model: 'fallback',
                        timestamp: new Date().toISOString(),
                        rateLimited: true
                    });
                } 
                // Who/About questions (MUST come first to avoid conflicts)
                if (queryLower.includes('who are you') || queryLower.includes('what is your name') || 
                    queryLower.includes('tell me about yourself') || queryLower.includes('introduce yourself') ||
                    (queryLower.includes('who') && !queryLower.includes('project')) || 
                    (queryLower.includes('name') && !queryLower.includes('project')) || 
                    (queryLower.includes('about') && !queryLower.includes('project'))) {
                    fallbackResponse += "I'm Hridyesh Kumar, a software developer passionate about creating elegant solutions. I believe great code tells a story and approach every project with creativity and technical rigor. I love productivity literature, poetry, and writing!";
                    return res.status(200).json({
                        response: fallbackResponse,
                        model: 'fallback',
                        timestamp: new Date().toISOString(),
                        rateLimited: true
                    });
                }
                // Personal and interests related (MUST come before projects to avoid conflicts)
                else if (queryLower.includes('hobby') || queryLower.includes('hobbies') || queryLower.includes('like') || 
                         queryLower.includes('passion') || queryLower.includes('interest') || queryLower.includes('poetry') || 
                         queryLower.includes('writing') || queryLower.includes('literature') || queryLower.includes('productivity') ||
                         queryLower.includes('personal') || queryLower.includes('life') || queryLower.includes('outside')) {
                    fallbackResponse += "I'm Hridyesh Kumar, a software developer passionate about creating elegant solutions. I love productivity literature, poetry, and writing - these interests shape how I approach problem-solving and communication in tech. Every line of code tells a story!";
                    return res.status(200).json({
                        response: fallbackResponse,
                        model: 'fallback',
                        timestamp: new Date().toISOString(),
                        rateLimited: true
                    });
                } 
                // Projects and work related
                else if (queryLower.includes('project') || queryLower.includes('build') || queryLower.includes('create') ||
                         queryLower.includes('app') || queryLower.includes('application') || queryLower.includes('developed') ||
                         queryLower.includes('email oasis') || queryLower.includes('furniar') || queryLower.includes('quantum') ||
                         queryLower.includes('vanet') || queryLower.includes('poem generator') || queryLower.includes('ar')) {
                    fallbackResponse += "I've built projects like Email Oasis (Gmail subscription manager), FurniAR (AR furniture app), Neural Network Routing for VANETs, Poem Generator with AI, and a Quantum Computing optimization project. Check out my Projects section for more details!";
                    return res.status(200).json({
                        response: fallbackResponse,
                        model: 'fallback',
                        timestamp: new Date().toISOString(),
                        rateLimited: true
                    });
                } 
                // Contact and communication related
                else if (queryLower.includes('contact') || queryLower.includes('email') || queryLower.includes('reach') ||
                         queryLower.includes('message') || queryLower.includes('connect') || queryLower.includes('linkedin') ||
                         queryLower.includes('github') || queryLower.includes('leetcode') || queryLower.includes('resume')) {
                    fallbackResponse += "You can reach me at hridyesh2309@gmail.com, connect on LinkedIn (hridyeshh), check out my code on GitHub (hridyeshh), or see my problem-solving skills on LeetCode.";
                    return res.status(200).json({
                        response: fallbackResponse,
                        model: 'fallback',
                        timestamp: new Date().toISOString(),
                        rateLimited: true
                    });
                } 

                // Education and learning related
                else if (queryLower.includes('education') || queryLower.includes('study') || queryLower.includes('learn') ||
                         queryLower.includes('university') || queryLower.includes('college') || queryLower.includes('degree') ||
                         queryLower.includes('course') || queryLower.includes('training')) {
                    fallbackResponse += "I'm constantly learning and exploring new technologies. My approach combines formal education with hands-on experience, always staying curious about emerging trends in software development and AI.";
                    return res.status(200).json({
                        response: fallbackResponse,
                        model: 'fallback',
                        timestamp: new Date().toISOString(),
                        rateLimited: true
                    });
                }
                // Default response for other queries
                else {
                    fallbackResponse += "I'm Hridyesh Kumar, a software developer passionate about creating elegant solutions. I believe great code tells a story and approach every project with creativity and technical rigor. Feel free to explore my portfolio sections or contact me directly!";
                }
                
                return res.status(200).json({
                    response: fallbackResponse,
                    model: 'fallback',
                    timestamp: new Date().toISOString(),
                    rateLimited: true
                });
            }
            
            throw new Error(`Groq API error: ${response.status}`);
        }
        const data = await response.json();
        let aiResponse = data.choices[0].message.content.trim();

        console.log(`[${new Date().toISOString()}] Query: "${query}" | Response length: ${aiResponse.length}`);
        res.json({
            response: aiResponse,
            model: GROQ_MODEL,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        // Send a user-friendly error response
        res.status(500).json({
            error: 'I apologize, but I encountered an issue. Please try again or contact Hridyesh directly at hridyesh2309@gmail.com.',
            fallback: true
        });
    }
});

// GitHub data endpoint
app.get('/api/github', async (req, res) => {
    try {
        const githubAPI = new GitHubAPI();
        const data = await githubAPI.getBasicData();
        if (data) {
            res.json({
                success: true,
                data: data
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to fetch GitHub data'
            });
        }
    } catch (error) {
        console.error('GitHub endpoint error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Local server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from current directory`);
    console.log(`🔗 Test API at http://localhost:${PORT}/api/chat`);
    console.log(`🧪 Test page at http://localhost:${PORT}/test_api.html`);
});