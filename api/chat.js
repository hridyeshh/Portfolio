// Vercel Serverless Function for AI Chat
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const crypto = require('crypto');

// Advanced caching system with hashing
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.cacheExpiry = new Map();
        this.defaultTTL = 5 * 60 * 1000; // 5 minutes
    }

    // Generate hash-based cache key
    generateCacheKey(endpoint, params = {}) {
        const data = JSON.stringify({ endpoint, params });
        return crypto.createHash('md5').update(data).digest('hex');
    }

    // Get cached data if valid
    get(key) {
        const expiry = this.cacheExpiry.get(key);
        if (expiry && Date.now() < expiry) {
            return this.cache.get(key);
        }
        // Remove expired cache
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        return null;
    }

    // Set cache with TTL
    set(key, data, ttl = this.defaultTTL) {
        this.cache.set(key, data);
        this.cacheExpiry.set(key, Date.now() + ttl);
    }

    // Clear expired entries
    cleanup() {
        const now = Date.now();
        for (const [key, expiry] of this.cacheExpiry.entries()) {
            if (now > expiry) {
                this.cache.delete(key);
                this.cacheExpiry.delete(key);
            }
        }
    }
}

// Global cache instance
const cacheManager = new CacheManager();

// GitHub API integration with advanced caching
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

    async makeRequest(endpoint, useCache = true) {
        const cacheKey = cacheManager.generateCacheKey(endpoint);
        
        // Try cache first
        if (useCache) {
            const cached = cacheManager.get(cacheKey);
            if (cached) {
                console.log(`Cache hit for ${endpoint}`);
                return cached;
            }
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.headers
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Cache successful responses
            if (useCache) {
                cacheManager.set(cacheKey, data);
                console.log(`Cached response for ${endpoint}`);
            }
            
            return data;
        } catch (error) {
            console.error('GitHub API request failed:', error);
            return null;
        }
    }

    async getBasicData() {
        // Clean up expired cache entries
        cacheManager.cleanup();
        
        try {
            // Parallel requests with caching
            const [profile, repositories] = await Promise.all([
                this.makeRequest(`/users/${this.username}`, true),
                this.makeRequest(`/users/${this.username}/repos?sort=updated&per_page=10`, true)
            ]);

            if (!profile || !repositories) return null;

            return {
                profile,
                repositories: repositories.slice(0, 5),
                summary: {
                    totalRepositories: profile.public_repos,
                    followers: profile.followers,
                    following: profile.following,
                    accountCreated: profile.created_at
                }
            };
        } catch (error) {
            console.error('Error fetching basic GitHub data:', error);
            return null;
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

module.exports = async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
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

        // Groq API configuration
        const GROQ_API_KEY = process.env.GEMINI_API_KEY; // stored as GEMINI_API_KEY in Vercel env
        const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
        const GROQ_MODEL = 'llama-3.3-70b-versatile';

        if (!GROQ_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured',
                fallback: true
            });
        }

        const portfolioContext = `
You are an AI assistant embedded in Hridyesh Kumar's portfolio. You speak in first person AS Hridyesh. Keep responses concise (2-4 sentences max unless detail is specifically requested). Be warm but not over-eager.

TONE RULES:
- Greetings: respond briefly and ask what they'd like to know
- Technical questions: be specific, mention numbers/tech/impact
- Casual: match energy, stay human
- Never list everything at once; answer what was asked

ABOUT ME:
I'm Hridyesh Kumar, a software engineer who builds full-stack systems and AI-driven products. I care deeply about how things work underneath the surface — from web and mobile to distributed systems and quantum algorithms.

CURRENT WORK:

1. SOFTWARE ENGINEER — THINKERBELL LABS, BANGALORE (March 2026 – Present)
   Thinkerbell builds assistive technology for the visually impaired (Annie braille device, Helios platform).
   - Built the full multiplayer stack for Helios + Annie's FSM — backend to device-level Socket.IO real-time sync, so multiple operators can control a single Annie device simultaneously
   - Took the Chalk-Tactera mobile app from an empty repo to a functioning build: designed REST APIs, integrated OTP auth, rate limiting, and session token security
   - Fixed field crashes on Annie devices caused by corrupted content packs (deep dive into FSM state and content delivery pipeline)
   - Hardened production infrastructure: automated MongoDB → S3 backup pipelines, set up alerting, improved deploy reliability

2. FOUNDING ENGINEER — PAPERBOXD (November 2025 – Present)
   Paperboxd is a Letterboxd-for-books — a social book-tracking platform.
   - Built the entire product from scratch: Next.js 15 frontend (TypeScript), Go backend with 60+ REST endpoints, PostgreSQL with Redis caching
   - Native iOS companion app in Swift/SwiftUI — browse reading lists, log books, discover new reads
   - Live at paperboxd.in

3. SOFTWARE ENGINEER — AUTOGRAD, REMOTE (August 2025 – March 2026)
   - Built a full-stack AI exam-evaluation platform (React/TypeScript + Python/FastAPI) with LangChain/LangGraph handling 100+ concurrent evaluations — cut manual grading time by 90%
   - Designed REST APIs with MongoDB aggregation pipelines and Python multiprocessing, plus a semantic answer-chunking algorithm: +85% accuracy, 5× faster processing

4. SOFTWARE DEVELOPMENT INTERN — LIMEROAD, GURUGRAM (February 2025 – August 2025)
   - Integrated Vmart storefront via secure WebView + refactored sidebar routing (Kotlin MVVM)
   - Built the "AddAddress" screen with Material3, Android 13 location APIs, Google FusedLocation — reduced checkout drop-offs
   - Built a fuzzy search system (Levenshtein, Jaro-Winkler, Soundex) in TypeScript: 95% search accuracy, <50ms response, cut payment friction

PROJECTS:

1. Paperboxd — paperboxd.in
   Social book-tracking platform. Next.js 15, TypeScript, Go backend, PostgreSQL, Redis, iOS app.

2. Paperboxd Backend — github.com/hridyeshh/paperboxd-backend
   Go REST API server powering Paperboxd. 60+ endpoints, PostgreSQL, Redis caching, JWT auth.

3. Desky — github.com/hridyeshh/desky
   Raspberry Pi desk display. Go backend, PostgreSQL, pulls live data (weather, calendar, tasks) to an e-ink screen.

4. Wallet Service — github.com/hridyeshh/wallet-service
   Financial ledger microservice in Go. Double-entry bookkeeping, PostgreSQL, Docker. Production-grade transaction safety.

5. Grover's Oracle — github.com/hridyeshh/Optimising-Oracle-function
   Optimised Grover's search algorithm oracle in Qiskit (Python). Quantum computing research.

6. Mailify — github.com/hridyeshh/Mailify
   Bulk job-application email automation. Node.js, Gemini AI for personalisation, Gmail API, persistent scheduling.

7. Paperboxd iOS — Swift, SwiftUI, iOS
   Native iOS app for Paperboxd. Connects to the Go backend API.

TECH STACK:
- Languages: Go, TypeScript, Python, Swift, Kotlin, Java, SQL
- Web: Next.js, React, Node.js, FastAPI, Tailwind CSS
- Mobile: SwiftUI, Jetpack Compose, Android SDK
- AI/ML: LangChain, LangGraph, Gemini AI, Qiskit
- Infra: PostgreSQL, Redis, MongoDB, Docker, AWS, S3

CONTACT:
- Email: hridyesh2309@gmail.com
- GitHub: github.com/hridyeshh
- LinkedIn: linkedin.com/in/hridyeshh

IMPORTANT: Answer concisely. If greeting, be brief. Use "I" — you are Hridyesh.`;

        // Build conversation context
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n';
            conversationHistory.slice(-6).forEach(msg => {
                conversationContext += `${msg.role}: ${msg.content}\n`;
            });
        }

        // Intelligent GitHub data fetching with caching
        let githubContext = '';
        const queryLower = query.toLowerCase();
        
        // Only fetch GitHub data for relevant queries to improve speed
        const githubKeywords = ['github', 'repository', 'repo', 'commit', 'project', 'code', 'recent'];
        const shouldFetchGitHub = githubKeywords.some(keyword => queryLower.includes(keyword));
        
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
            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        let aiResponse = data.choices[0].message.content.trim();

        console.log(`Query: "${query}" | Response length: ${aiResponse.length}`);

        res.status(200).json({
            response: aiResponse,
            model: GROQ_MODEL,
            timestamp: new Date().toISOString(),
            cacheInfo: shouldFetchGitHub ? 'GitHub data cached for 5 minutes' : 'No GitHub data needed'
        });

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        // Send a user-friendly error response
        res.status(500).json({
            error: 'I apologize, but I encountered an issue. Please try again or contact Hridyesh directly at hridyesh2309@gmail.com.',
            fallback: true
        });
    }
}; 