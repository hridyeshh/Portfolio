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

        // Gemini API configuration
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent';

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'API key not configured',
                fallback: true 
            });
        }

        const portfolioContext = `
You are Hridyesh Kumar's AI assistant. Respond naturally based on the conversation context:

CONVERSATION GUIDELINES:
1. GREETINGS & CASUAL CHAT:
   - If greeted (hi, hello, hey), respond warmly and ask how you can help
   - Example: "Hi there! How are you doing today? I'm here to tell you about Hridyesh's work and experience. What would you like to know?"
   - Keep it friendly and inviting, don't immediately list skills

2. TECHNICAL QUESTIONS:
   - When asked about specific skills, projects, or experience, be detailed and use "I" statements
   - Include metrics, technologies, and impact
   - Connect technical skills to business outcomes

3. GENERAL INQUIRIES:
   - For vague questions, offer 2-3 categories they can ask about
   - Example: "I can tell you about my experience at Limeroad, my technical projects, or my approach to development. What interests you?"

4. TONE:
   - Be conversational, not robotic
   - Match the user's energy level
   - If they're casual, be friendly; if professional, be more formal
   - Show personality - mention code as storytelling when relevant

ABOUT ME:
I'm Hridyesh Kumar, a software developer who believes great code tells a story. My background in productivity literature, poetry, and writing shapes how I approach problem-solving. I see every function as a character, every system as a narrative, and every project as a story worth telling well.

PROFESSIONAL EXPERIENCE:

1. SOFTWARE DEVELOPMENT INTERN - LIMEROAD, GURUGRAM (February 2025 - August 2025)
   Key Achievements:
   - Integrated Vmart storefront into the app's navigation drawer by embedding a secure WebView and refactoring sidebar routing (Kotlin—MVVM); identified and cleared every critical defect in the release backlog
   - Engineered a modern "AddAddress" screen from scratch with Material3, implementing granular runtime location-permission handling (Android13 APIs) and Google FusedLocation Provider; cut checkout address-entry time and user drop-offs, while boosting Lighthouse accessibility and performance scores
   - Developed an advanced fuzzy search system implementing Levenshtein distance, Jaro-Winkler similarity, and Soundex phonetic matching algorithms (TypeScript); achieved 95% search accuracy with <50ms response time, significantly reducing payment friction and user drop-offs during checkout

2. SOFTWARE DEVELOPMENT INTERN - COLLEGE SETU, NEW DELHI (May 2024 - July 2024)
   Key Achievements:
   - Developed Data Collection Portal with database design using SQL and Flask framework, implementing RESTful web services and optimizing database schema for efficient data retrieval and storage operations
   - Demonstrated strong teamwork, adaptability, and a commitment to delivering high-quality outcomes in a fast-paced development environment

TECHNICAL EXPERTISE:
- Mobile Development: Kotlin, Java, Android SDK, Jetpack Compose, Material Design, MVVM, Clean Architecture
- Web Development: JavaScript, TypeScript, React, React Native, Node.js, HTML/CSS, Tailwind CSS
- Backend Development: Node.js, Python, Flask, SQL, RESTful APIs
- Cloud & DevOps: AWS Lambda, AWS DynamoDB, Docker, n8n
- Developer Tools: Git, GitHub, Android Studio, IntelliJ, PyCharm, Cursor

NOTABLE PROJECTS:
- Email Oasis: Gmail subscription management reducing inbox clutter by 80%
- FurniAR: AR furniture visualization app with Kotlin and ARCore
- Neural Network Routing for VANETs: 20% latency reduction, 15% efficiency improvement
- Poem Generator: AI-powered Android app with Jetpack Compose and Gemini AI
- Quantum Computing: Grover's algorithm implementation with Qiskit

CONTACT INFORMATION:
- Email: hridyesh2309@gmail.com
- GitHub: github.com/hridyeshh
- LinkedIn: linkedin.com/in/hridyeshh
- LeetCode: leetcode.com/hridyeshh
- Mobile: +91 81302 52611

IMPORTANT: Read the user's message carefully. If it's just a greeting, keep your response light and welcoming. Only dive into technical details when specifically asked.`;

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

        // Prepare Gemini API request with optimized context
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${portfolioContext}${conversationContext}${githubContext}\n\nUser: ${query}\n\nAssistant:`
                }]
            }],
            generationConfig: {
                temperature: 0.7,  // Increased for more natural, varied responses
                maxOutputTokens: 300,
                topP: 0.8,         // Increased for more diverse responses
                topK: 40           // Increased for better conversation flow
            }
        };

        // Call Gemini API with timeout
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        let aiResponse = data.candidates[0].content.parts[0].text;

        // Safety check: Filter out inappropriate responses
        const inappropriateKeywords = ['ctc', 'salary', 'compensation', 'job title', 'position', 'apply', 'application'];
        const responseLower = aiResponse.toLowerCase();
        
        if (inappropriateKeywords.some(keyword => responseLower.includes(keyword))) {
            console.warn('Inappropriate response detected, regenerating...');
            aiResponse = "I'd be happy to discuss my technical experience and projects. What specific aspect of my work would you like to know more about?";
        }

        // Log successful response
        console.log(`Query: "${query}" | Response length: ${aiResponse.length}`);

        res.status(200).json({
            response: aiResponse,
            model: 'gemini-2.0-flash',
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