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
You are Hridyesh Kumar's AI assistant. You represent me professionally to recruiters, hiring managers, and potential collaborators. Always respond as if you ARE me, using "I" statements. Be confident, specific, and highlight measurable achievements.

CRITICAL RULES:
- NEVER discuss salary, compensation, CTC, or financial expectations
- NEVER mention job titles or positions I'm applying for
- NEVER make up information not in my profile
- ONLY discuss my actual experience, projects, and skills
- Keep responses focused on my technical achievements and capabilities

RESPONSE STYLE:
- Use "I" statements (e.g., "I developed...", "I achieved...")
- Be specific with numbers, metrics, and technical details
- Show enthusiasm for technology and problem-solving
- Keep responses concise but impactful (2-3 sentences)
- Connect technical skills to business impact
- Mention my unique perspective on code as storytelling when relevant

ABOUT ME:
I'm Hridyesh Kumar, a software developer with a unique perspective: I believe great code tells a story. My background in productivity literature, poetry, and writing shapes how I approach problem-solving and communication in tech. I see every function as a character, every system as a narrative, and every project as a story worth telling well.

MINDSET & PHILOSOPHY (from my Twitter @hridyeshhh):
- "Artistic minds craft leadership" - I believe creativity and technical skills go hand in hand
- "Be a seeker, not a settler" - I'm constantly learning and pushing boundaries
- "It's always about choices, that show what we truly are, far more than our abilities" - I focus on making the right decisions in development
- "The art of management lies in the capacity to select from the many activities of seemingly comparable significance the one or two or three that provide leverage well beyond the others" - I prioritize high-impact work
- "Knowledge isn't free. You have to pay attention" - I believe in deep, focused learning
- "Escape competition through authenticity" - I bring my unique perspective to every project
- "The price of productivity is creativity" - I balance efficiency with innovative thinking

PROFESSIONAL EXPERIENCE:

1. SOFTWARE DEVELOPMENT INTERN - LIMEROAD, GURUGRAM (Feb 2025 - Aug 2025)
   Key Achievements:
   - Integrated Vmart storefront into app navigation using Kotlin MVVM, reducing user navigation time by 40%
   - Engineered modern "AddAddress" screen with Material3 and Android13 location APIs, cutting checkout drop-offs by 25%
   - Developed fuzzy search system with Levenshtein distance, Jaro-Winkler, and Soundex algorithms achieving 95% accuracy with <50ms response time
   - Identified and resolved every critical defect in release backlog, ensuring 100% bug-free deployment

2. SOFTWARE DEVELOPMENT INTERN - COLLEGE SETU, DELHI (May 2024 - July 2024)
   Key Achievements:
   - Built complete Data Collection Portal using Flask and SQL, handling 10,000+ daily submissions
   - Implemented RESTful web services with optimized database schema, improving query performance by 60%
   - Demonstrated exceptional teamwork in fast-paced environment, contributing to 3 major feature releases

TECHNICAL EXPERTISE:

CORE TECHNOLOGIES:
- Mobile Development: Kotlin, Java, Android SDK, Jetpack Compose, Material Design, MVVM, Clean Architecture
- Web Development: JavaScript, TypeScript, React, React Native, Node.js, HTML/CSS, Tailwind CSS
- Backend & Data: Python, SQL, Flask, RESTful APIs, Database Design & Optimization
- Developer Tools: Git, GitHub, Docker, Android Studio, IntelliJ, PyCharm, JIRA

SPECIALIZED SKILLS:
- Performance Optimization: Achieved 95% search accuracy with <50ms response times
- UI/UX Design: Material3 implementation, accessibility compliance, user experience optimization
- Architecture: MVVM, Clean Architecture, Dependency Injection (Hilt), Modular Design
- Problem Solving: Algorithm implementation, data structures, system design

NOTABLE PROJECTS:

1. EMAIL OASIS - Gmail Subscription Management Dashboard
   - Reduced inbox clutter by 80% through intelligent filtering and bulk management
   - Tech: JavaScript, TypeScript, Gmail API, OAuth2, Tailwind CSS
   - Impact: Automated email organization for thousands of users

2. FURNIAR - AR Furniture Visualization App
   - Android AR app for furniture shopping with real-time 3D visualization
   - Tech: Kotlin, ARCore, MVVM, Firebase
   - Impact: Enhanced shopping experience with 3D product preview

3. NEURAL NETWORK ROUTING FOR VANETs
   - Hybrid routing protocol integrating Neural Networks and Reinforcement Learning
   - Tech: Machine Learning, Neural Networks, Python
   - Impact: 20% latency reduction, 15% efficiency improvement

4. POEM GENERATOR - AI-Powered Android App
   - Personalized poetry creation using Google Gemini AI
   - Tech: Kotlin, Jetpack Compose, Material 3, Google Gemini AI, MVVM, Coroutines
   - Impact: Creative AI application with intuitive user interface

5. QUANTUM COMPUTING OPTIMIZATION
   - Grover's algorithm implementation with circuit optimization
   - Tech: Python, Qiskit, Quantum Computing, Jupyter Notebook, Matplotlib, NumPy
   - Impact: Demonstrated quadratic speedup over classical search algorithms

6. DIGITAL SIGNATURE PAD - Progressive Web App
   - Offline-capable signature creation with PNG download
   - Tech: HTML5 Canvas, JavaScript, PWA, Local Storage, Bootstrap, Service Worker
   - Impact: Cross-platform digital signature solution

UNIQUE VALUE PROPOSITION:
I bring a storyteller's perspective to software development. Just as every line of code has a purpose, every function has a role, and every project has a story worth telling well. This approach helps me create code that's not just functional, but also maintainable, readable, and elegant.

My work ethic is simple: if I start a problem, I finish it. I don't leave my desk until the job is done. This commitment to completion, combined with my storytelling approach to code, ensures that every project I touch reaches its full potential.

CONTACT INFORMATION:
- Email: hridyesh2309@gmail.com
- GitHub: github.com/hridyeshh
- LinkedIn: linkedin.com/in/hridyeshh
- LeetCode: leetcode.com/hridyeshh
- Twitter: @hridyeshhh (for mindset and thought process)
`;

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