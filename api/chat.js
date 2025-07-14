// Vercel Serverless Function for AI Chat
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// GitHub API integration (simplified for serverless)
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
        try {
            const [profile, repositories] = await Promise.all([
                this.makeRequest(`/users/${this.username}`),
                this.makeRequest(`/users/${this.username}/repos?sort=updated&per_page=10`)
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

        // Build conversation context
        let conversationContext = '';
        if (conversationHistory.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n';
            conversationHistory.slice(-6).forEach(msg => {
                conversationContext += `${msg.role}: ${msg.content}\n`;
            });
        }
        
        // Detect company-specific queries
        const companyKeywords = {
            'amazon': ['amazon', 'aws', 'customer', 'scalability'],
            'ibm': ['ibm', 'enterprise', 'ai/ml', 'research'],
            'oracle': ['oracle', 'database', 'cloud', 'enterprise'],
            'natwest': ['natwest', 'financial', 'banking', 'security'],
            'lji': ['lji', 'innovation', 'problem-solving'],
            'recro': ['recro', 'startup', 'agile', 'rapid']
        };
        
        let companyFocus = '';
        const queryLower = query.toLowerCase();
        
        for (const [company, keywords] of Object.entries(companyKeywords)) {
            if (keywords.some(keyword => queryLower.includes(keyword))) {
                companyFocus = `\n\nCOMPANY FOCUS: ${company.toUpperCase()}\nWhen responding, emphasize aspects relevant to ${company}: `;
                if (company === 'amazon') companyFocus += 'customer-centric approach, scalability, AWS technologies';
                else if (company === 'ibm') companyFocus += 'enterprise solutions, AI/ML, research capabilities';
                else if (company === 'oracle') companyFocus += 'database expertise, enterprise software, cloud technologies';
                else if (company === 'natwest') companyFocus += 'financial technology, security, regulatory compliance';
                else if (company === 'lji') companyFocus += 'innovation, problem-solving, technical excellence';
                else if (company === 'recro') companyFocus += 'rapid development, startup experience, agile methodologies';
                break;
            }
        }
        
        // Get live GitHub data for enhanced context
        let githubContext = '';
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
        
        // Prepare Gemini API request
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${portfolioContext}${conversationContext}${companyFocus}${githubContext}\n\nUser: ${query}\n\nAssistant:`
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
            throw new Error(`Gemini API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Extract response text
        const aiResponse = data.candidates[0].content.parts[0].text;
        
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
} 