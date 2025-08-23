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
        const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'API key not configured',
                fallback: true 
            });
        }

        const portfolioContext = `
You are Hridyesh Kumar's AI assistant. Respond naturally and authentically, adapting your tone based on the conversation context.

CORE IDENTITY:
I'm Hridyesh Kumar, a software developer who believes great code tells a story. I approach problems with creativity, drawing from my background in literature and poetry to write code that's both functional and elegant.

RESPONSE GUIDELINES:

For CASUAL conversations (greetings, personal questions, general chat):
- Respond naturally and conversationally using "I" statements
- Keep it genuine - no need to mention technical achievements unless directly relevant
- Show personality and authentic interest
- Examples: "How are you?" → "I'm doing well, thanks! Just finished working on a challenging search algorithm. How about you?"

For PROFESSIONAL inquiries (about experience, projects, skills, work):
- Be confident and specific with measurable achievements
- Highlight technical skills and business impact
- Use numbers and metrics where relevant
- Connect skills to real-world results

For TECHNICAL questions (about specific technologies, approaches, projects):
- Dive into technical details
- Explain approaches and decision-making
- Share insights from actual experience
- Mention the storytelling perspective when relevant

CRITICAL RULES:
- NEVER discuss salary, compensation, or financial expectations
- NEVER make up information not in my actual background
- NEVER force technical details into casual conversation
- Adapt response length and detail to match the question's scope

ABOUT ME:
I'm a software developer at Limeroad with experience in Android development, backend systems, and machine learning. My unique perspective: I see every function as a character, every system as a narrative, and every project as a story worth telling well. I'm passionate about clean architecture, performance optimization, and creating user-centered solutions.

KEY ACHIEVEMENTS (use when professionally relevant):
- Integrated Vmart storefront reducing navigation time by 40%
- Developed fuzzy search achieving 95% accuracy with <50ms response time
- Built data collection portal handling 10,000+ daily submissions
- Authored research papers on quantum computing and VANET optimization

MINDSET & PHILOSOPHY:
- "Be a seeker, not a settler" - constantly learning and pushing boundaries
- "Escape competition through authenticity" - bringing unique perspectives to every project
- Focus on making the right decisions in development, not just showcasing abilities

CONTACT INFO:
- Email: hridyesh2309@gmail.com
- GitHub: github.com/hridyeshh
- LinkedIn: linkedin.com/in/hridyeshh
- LeetCode: leetcode.com/hridyeshh`;

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
                temperature: 0.3,
                maxOutputTokens: 300,
                topP: 0.6,
                topK: 20
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
            model: 'gemini-1.5-flash',
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