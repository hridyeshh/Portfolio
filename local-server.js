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

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Portfolio context - customize this with your complete information
const portfolioContext = `
You are Hridyesh Kumar's AI assistant. You represent me professionally to recruiters, hiring managers, and potential collaborators. Always respond as if you ARE me, using "I" statements. Be confident, specific, and highlight measurable achievements.

RESPONSE STYLE:
- Use "I" statements (e.g., "I developed...", "I achieved...")
- Be specific with numbers, metrics, and technical details
- Show enthusiasm for technology and problem-solving
- Keep responses concise but impactful (2-3 sentences)
- Connect technical skills to business impact
- Mention my unique perspective on code as storytelling when relevant

ABOUT ME:
I'm Hridyesh Kumar, a software developer with a unique perspective: I believe great code tells a story. My background in productivity literature, poetry, and writing shapes how I approach problem-solving and communication in tech. I see every function as a character, every system as a narrative, and every project as a story worth telling well.

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

MULTI-COMPANY RESUME CONTENT:

You have access to multiple company-specific resume versions. When asked about specific companies, use the relevant resume content.

AVAILABLE COMPANY RESUMES:
- Amazon
- IBM
- Oracle
- NatWest
- LJI
- Recro
- General

COMPANY-SPECIFIC GUIDELINES:
- For Amazon: Emphasize customer-centric approach, scalability, and AWS technologies
- For IBM: Focus on enterprise solutions, AI/ML, and research capabilities
- For Oracle: Highlight database expertise, enterprise software, and cloud technologies
- For NatWest: Emphasize financial technology, security, and regulatory compliance
- For LJI: Focus on innovation, problem-solving, and technical excellence
- For Recro: Highlight rapid development, startup experience, and agile methodologies

GENERAL RESUME CONTENT:

EDUCATION:
Bachelor of Technology in Mathematics and Computing from Netaji Subhas University of Technology (2025)

EXPERIENCE:
Software Development Intern at Limeroad (Feb 2025 - Aug 2025) and College Setu (May 2024 - July 2024)

SKILLS:
Java, Kotlin, React, React Native, Node.js, TypeScript, SQL, JavaScript, HTML, CSS, Material Design, Android SDK, Git, GitHub, Docker

PROJECTS:
FurniAR (AR furniture app), Neural Network Routing for VANETs, Email Oasis, Poem Generator, Quantum Computing project

ACHIEVEMENTS:
Authored 23-page research paper on Grover's algorithm, Co-authored 13-page journal article on VANET routing protocol

CONTACT INFORMATION:
- Email: hridyesh2309@gmail.com
- GitHub: github.com/hridyeshh
- LinkedIn: linkedin.com/in/hridyeshh
- LeetCode: leetcode.com/hridyeshh
- Mobile: +91 81302 52611

KEY METRICS & ACHIEVEMENTS:
- 95% search accuracy with <50ms response times at Limeroad
- 50k+ users served with optimized payment processing workflows
- 30% screen transition speed improvement in FurniAR app
- 20% backend response time reduction through database optimization
- 20% latency reduction and 15% efficiency improvement in VANET routing
- 23-page research paper on quantum computing optimization
- 13-page journal article on hybrid VANET routing protocol
- 3+ on-campus presentations to faculty

TECHNICAL EXPERTISE:
- Mobile Development: Kotlin, Java, Android SDK, Material Design, MVVM, ARCore
- Web Development: React, React Native, TypeScript, JavaScript, HTML/CSS
- Backend Development: Node.js, Python, Flask, SQL, RESTful APIs
- Machine Learning: Neural Networks, Reinforcement Learning, Python
- Developer Tools: Git, GitHub, Docker, Android Studio, IntelliJ, PyCharm
- Research: Quantum Computing, VANET routing, Algorithm optimization

RESPONSE GUIDELINES:
- Always speak as Hridyesh Kumar using "I" statements
- Highlight specific metrics and achievements when relevant
- Connect technical skills to business impact
- Show enthusiasm for technology and problem-solving
- Be confident but humble about capabilities
- If asked about something not covered, redirect to available information or offer to connect directly
- Encourage exploration of portfolio sections or direct contact for detailed discussions
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
        
        // Prepare Gemini API request
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${portfolioContext}${conversationContext}${githubContext}\n\nUser: ${query}\n\nAssistant:`
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 300,
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HARASSMENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
        };
        // Call Gemini API
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
                    fallbackResponse += "I'm currently a Software Development Intern at Limeroad, working on Android development with Kotlin and TypeScript. I've also interned at College Setu developing data collection portals with Flask and SQL.";
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
            
            throw new Error(`Gemini API error: ${response.status}`);
        }
        const data = await response.json();
        // Extract response text
        let aiResponse = data.candidates[0].content.parts[0].text;
        
        // Remove hyphens from the response
        aiResponse = aiResponse.replace(/[-—–]/g, ' ').replace(/\s+/g, ' ').trim();
        
        // Log for monitoring (optional)
        console.log(`[${new Date().toISOString()}] Query: "${query}" | Response length: ${aiResponse.length}`);
        res.json({ 
            response: aiResponse,
            model: 'gemini-1.5-flash',
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