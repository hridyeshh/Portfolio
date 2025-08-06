// Google Design Style Cursor
const cursor = document.querySelector('.cursor');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

// Update mouse position
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor animation using requestAnimationFrame
function animateCursor() {
    // Ease the cursor position with smooth following
    const dx = mouseX - cursorX;
    const dy = mouseY - cursorY;
    
    cursorX += dx * 0.5; // Smooth following speed
    cursorY += dy * 0.5;
    
    // Apply transform (center the cursor on mouse position)
    cursor.style.transform = `translate(${cursorX - 20}px, ${cursorY - 20}px)`;
    
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hide cursor when leaving window
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
});

// Initialize cursor position
cursorX = mouseX = window.innerWidth / 2;
cursorY = mouseY = window.innerHeight / 2;

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Navigation scroll effect
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// Section background-to-body sync
const sections = document.querySelectorAll('section');
function updateBodyBg() {
    let found = false;
    sections.forEach((section, idx) => {
        const rect = section.getBoundingClientRect();
        if (!found && rect.top <= window.innerHeight/2 && rect.bottom >= window.innerHeight/2) {
            found = true;
            if ((idx+1) % 2 === 1) {
                document.body.classList.add('bg-white');
                document.body.classList.remove('bg-black');
            } else {
                document.body.classList.add('bg-black');
                document.body.classList.remove('bg-white');
            }
        }
    });
}

// Dynamic contact section background opacity
function updateContactBgOpacity() {
    const contactSection = document.querySelector('#contact');
    const videoBg = document.querySelector('.contact-video-bg');
    if (!contactSection || !videoBg) {
        console.log('Contact section or video not found');
        return;
    }
    
    // Debug video element
    console.log('Video element found:', videoBg);
    console.log('Video readyState:', videoBg.readyState);
    console.log('Video currentSrc:', videoBg.currentSrc);
    console.log('Video paused:', videoBg.paused);
    
    // Ensure video is playing with slow motion
    if (videoBg.tagName === 'VIDEO') {
        if (videoBg.paused) {
            videoBg.play().catch(e => console.log('Video autoplay failed:', e));
        }
        // Set playback rate to 0.5 for slow motion
        videoBg.playbackRate = 0.5;
    }
    
    const rect = contactSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the contact section is visible
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    
    // Custom opacity settings for video background
    let opacity = 1; // Default full opacity
    
    if (sectionTop < windowHeight && sectionTop + sectionHeight > 0) {
        // Section is visible - calculate scroll-based opacity
        const visibleHeight = Math.min(windowHeight, sectionTop + sectionHeight) - Math.max(0, sectionTop);
        const visibilityRatio = visibleHeight / Math.min(windowHeight, sectionHeight);
        
        // Custom opacity curve - adjust these values as needed
        if (document.body.classList.contains('bg-white')) {
            // White theme - more subtle video presence
            opacity = Math.max(0.2, Math.min(0.4, visibilityRatio * 0.4));
        } else {
            // Black theme - more prominent video
            opacity = Math.max(0.6, Math.min(1.0, visibilityRatio * 1.2));
        }
    }
    
    // Apply opacity to video with smooth transition
    videoBg.style.opacity = opacity;
    videoBg.style.setProperty('opacity', opacity, 'important');
    console.log('Video opacity set to:', opacity, 'Theme:', document.body.classList.contains('bg-white') ? 'white' : 'black');
}

// Hero hands fade out on scroll
function updateHeroHandsVisibility() {
    const heroSection = document.querySelector('#home');
    const heroHandsContainer = document.querySelector('.hero-hands-container');
    
    if (!heroSection || !heroHandsContainer) return;
    
    const rect = heroSection.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Calculate how much of the hero section is visible
    let visibilityRatio = 1;
    
    if (rect.top < 0) {
        // Hero section is scrolling up and out of view
        visibilityRatio = Math.max(0, (rect.bottom) / windowHeight);
    } else if (rect.bottom > windowHeight) {
        // Hero section is partially visible from the top
        visibilityRatio = Math.max(0, (windowHeight - rect.top) / windowHeight);
    }
    
    // Ensure visibility ratio is between 0 and 1
    visibilityRatio = Math.max(0, Math.min(1, visibilityRatio));
    
    // Apply opacity to the hero hands container
    heroHandsContainer.style.setProperty('--hands-opacity', visibilityRatio);
}

// Fade hero background image on scroll
function updateHeroBgOpacity() {
    const hero = document.getElementById('home');
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    let ratio = 1;
    if (rect.top < 0) {
        ratio = Math.max(0, (rect.bottom) / windowHeight);
    } else if (rect.bottom > windowHeight) {
        ratio = Math.max(0, (windowHeight - rect.top) / windowHeight);
    }
    ratio = Math.max(0, Math.min(1, ratio));
    hero.style.setProperty('--hero-bg-opacity', ratio);

    // Zoom out: scale from 1 (fully visible) to 1.2 (zoomed out as it fades)
    const scale = 1 + (1 - ratio) * 0.8;
    hero.style.setProperty('--hero-bg-scale', scale);
}

window.addEventListener('scroll', updateBodyBg);
window.addEventListener('scroll', updateHeroHandsVisibility);
window.addEventListener('scroll', updateHeroBgOpacity);
window.addEventListener('scroll', updateContactBgOpacity);
window.addEventListener('resize', updateBodyBg);
window.addEventListener('resize', updateHeroHandsVisibility);
window.addEventListener('resize', updateHeroBgOpacity);
window.addEventListener('resize', updateContactBgOpacity);
document.addEventListener('DOMContentLoaded', updateBodyBg);
document.addEventListener('DOMContentLoaded', updateHeroHandsVisibility);
document.addEventListener('DOMContentLoaded', updateHeroBgOpacity);
document.addEventListener('DOMContentLoaded', updateContactBgOpacity);

// Initialize contact video opacity immediately
document.addEventListener('DOMContentLoaded', () => {
    const videoBg = document.querySelector('.contact-video-bg');
    if (videoBg) {
        // Add video event listeners for debugging
        videoBg.addEventListener('loadstart', () => console.log('Video loadstart'));
        videoBg.addEventListener('loadedmetadata', () => console.log('Video loadedmetadata'));
        videoBg.addEventListener('loadeddata', () => console.log('Video loadeddata'));
        videoBg.addEventListener('canplay', () => console.log('Video canplay'));
        videoBg.addEventListener('canplaythrough', () => console.log('Video canplaythrough'));
        videoBg.addEventListener('error', (e) => console.log('Video error:', e));
        
        setTimeout(updateContactBgOpacity, 100); // Small delay to ensure video is loaded
    }
});

// Back to Top button functionality
document.getElementById('backToTop').addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Show/hide Back to Top button from About section onward
const backToTopBtn = document.getElementById('backToTop');
const aboutSection = document.getElementById('about');

function toggleBackToTopBtn() {
    const rect = aboutSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight * 0.5) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
}
window.addEventListener('scroll', toggleBackToTopBtn);
window.addEventListener('resize', toggleBackToTopBtn);
document.addEventListener('DOMContentLoaded', toggleBackToTopBtn);

// Contact Section with Google Gemini AI Integration
function initContactSection() {
    const typingContent = document.querySelector('.typing-content');
    const aiSearchContainer = document.querySelector('.ai-search-container');
    const contactIconsContainer = document.querySelector('.contact-icons-container');
    const searchInput = document.querySelector('.ai-search-input');
    const searchButton = document.querySelector('.search-button');
    const aiResponseArea = document.querySelector('.ai-response-area');
    
    // Configuration - Update these values
    const BACKEND_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8000/api/chat'  // Local development
        : '/api/chat';                       // Vercel deployment
    const USE_BACKEND = true; // Set to false for client-side only (less secure)
    const GEMINI_API_KEY = 'AIzaSyDr62O2OODhj2Tm5LS8n5Ktc1ky5EkM134'; // Only used if USE_BACKEND is false
    
    if (!typingContent) return;
    
    const text = "Let's connect.";
    let index = 0;
    let conversationHistory = [];
    
    // Portfolio context for AI
    const portfolioContext = `
    You are an AI assistant representing Hridyesh Kumar's portfolio. Be friendly, professional, and concise (2-3 sentences max).
    
    ABOUT ME:
    I'm a software developer who believes that great code tells a story. I'm passionate about productivity literature, poetry, and writing. These interests shape how I approach problem-solving and communication in tech. I believe every line of code has a purpose, every function has a role, and every project has a story worth telling well.
    
    EXPERIENCE:
    1. Software Development Intern at Limeroad, Gurugram (February 2025 - August 2025)
       - Integrated Vmart storefront using Kotlin MVVM architecture
       - Engineered modern AddAddress screen with Material3 and location permissions
       - Developed fuzzy search system with Levenshtein distance achieving 95% accuracy
    
    2. Software Development Intern at College Setu, Delhi (May 2024 - July 2024)
       - Developed Data Collection Portal with Flask and SQL
       - Implemented RESTful web services and optimized database schema
    
    SKILLS:
    - Languages: Java, Kotlin, JavaScript, TypeScript, SQL, HTML, CSS
    - Frameworks: React, React Native, Node.js, Android SDK, Material Design, Jetpack Compose
    - Android: MVVM, Clean Architecture, Dependency Injection (Hilt)
    - Tools: Git, GitHub, Docker, Android Studio, IntelliJ, PyCharm
    
    PROJECTS:
    1. Email Oasis - Gmail subscription management dashboard reducing inbox clutter by 80%
    2. FurniAR - AR furniture visualization Android app
    3. Neural Network Routing for VANETs - 20% latency reduction
    4. Poem Generator - AI-powered Android app using Google Gemini
    5. Quantum Computing optimization using Grover's algorithm
    6. Digital Signature PWA with offline capabilities
    
    CONTACT:
    - Email: hridyesh2309@gmail.com
    - GitHub: github.com/hridyeshh
    - LinkedIn: linkedin.com/in/hridyeshh
    - LeetCode: leetcode.com/hridyeshh
    `;
    
    // Typing animation
    function typeText() {
        if (index < text.length) {
            typingContent.textContent += text.charAt(index);
            index++;
            const delay = text.charAt(index - 1) === '.' ? 150 : 50;
            setTimeout(typeText, delay);
        } else {
            // Show search bar immediately after typing completes
            aiSearchContainer?.classList.add('visible');
            contactIconsContainer?.classList.add('visible');
        }
    }
    
    // Start typing when contact section is visible
    const contactSection = document.getElementById('contact');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const typingObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && typingContent.textContent === '') {
                // Start typing immediately when section is visible
                typeText();
                typingObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    if (contactSection) {
        typingObserver.observe(contactSection);
    }
    
    // Gemini AI Integration
    async function callGeminiAPI(query) {
        if (USE_BACKEND) {
            // Backend approach (recommended)
            try {
                const response = await fetch(`${BACKEND_URL}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        query,
                        conversationHistory 
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Backend request failed: ${response.status}`);
                }
                
                const data = await response.json();
                return data.response;
                
            } catch (error) {
                console.error('Backend Error:', error);
                throw error;
            }
        } else {
            // Client-side approach (less secure but works)
            try {
                const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
                
                const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${portfolioContext}\n\nConversation history: ${JSON.stringify(conversationHistory)}\n\nUser: ${query}\n\nAssistant:`
                            }]
                        }],
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 200,
                        }
                    })
                });
                
                if (!response.ok) throw new Error('Gemini API request failed');
                
                const data = await response.json();
                return data.candidates[0].content.parts[0].text;
                
            } catch (error) {
                console.error('Gemini API Error:', error);
                throw error;
            }
        }
    }
    
    // Fallback responses when API fails
    const fallbackResponses = {
        'experience': "I have experience as a Software Development Intern at Limeroad (Feb-Aug 2025) where I worked on Android development with Kotlin and TypeScript, and at College Setu (May-July 2024) where I developed a data collection portal with Flask and SQL.",
        'skills': "My key skills include: Languages (Java, Kotlin, JavaScript, TypeScript, SQL), Android Development (MVVM, Jetpack Compose, Material Design), Web Development (React, Node.js, Tailwind CSS), and various developer tools like Git, Docker, and Android Studio.",
        'projects': "I've built several projects including Email Oasis (Gmail subscription manager), FurniAR (AR furniture app), Neural Network Routing for VANETs, Poem Generator with AI, and a Quantum Computing optimization project. Check out my Projects section for more details!",
        'contact': "You can reach me via email at hridyesh2309@gmail.com, connect with me on LinkedIn (hridyeshh), check out my code on GitHub (hridyeshh), or see my problem-solving skills on LeetCode.",
        'interests': "I'm passionate about productivity literature, poetry, and writing. These interests shape how I approach problem-solving and communication in tech. I believe every line of code tells a story!",
        'default': "I'm Hridyesh Kumar, a software developer passionate about creating elegant solutions. Feel free to explore my portfolio or contact me directly!"
    };
    
    function getFallbackResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        for (const [key, response] of Object.entries(fallbackResponses)) {
            if (key !== 'default' && lowerQuery.includes(key)) {
                return response;
            }
        }
        
        if (lowerQuery.includes('intern') || lowerQuery.includes('work')) {
            return fallbackResponses.experience;
        }
        if (lowerQuery.includes('know') || lowerQuery.includes('language') || lowerQuery.includes('framework')) {
            return fallbackResponses.skills;
        }
        if (lowerQuery.includes('built') || lowerQuery.includes('created') || lowerQuery.includes('developed')) {
            return fallbackResponses.projects;
        }
        if (lowerQuery.includes('email') || lowerQuery.includes('linkedin') || lowerQuery.includes('github')) {
            return fallbackResponses.contact;
        }
        if (lowerQuery.includes('hobby') || lowerQuery.includes('like') || lowerQuery.includes('passion')) {
            return fallbackResponses.interests;
        }
        
        return fallbackResponses.default;
    }
    
    // Display response with typing effect
    function displayResponse(text) {
        aiResponseArea.innerHTML = '';
        aiResponseArea.classList.add('active');
        
        const paragraph = document.createElement('p');
        paragraph.style.lineHeight = '1.8';
        aiResponseArea.appendChild(paragraph);
        
        let charIndex = 0;
        function typeResponse() {
            if (charIndex < text.length) {
                paragraph.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeResponse, 20);
            }
        }
        typeResponse();
    }
    
        // Handle search
    async function handleSearch() {
        const query = searchInput?.value.trim();
        if (!query || !aiResponseArea) return;
        
        try {
            // Show loading
            aiResponseArea.innerHTML = `
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            aiResponseArea.classList.add('active');
            
            if (searchButton) searchButton.disabled = true;
            if (searchInput) searchInput.disabled = true;
        
            let response;
            
            // Try Gemini API first
            if (GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' || USE_BACKEND) {
                response = await callGeminiAPI(query);
                
                // Update conversation history
                conversationHistory.push(
                    { role: 'user', content: query },
                    { role: 'assistant', content: response }
                );
                
                // Keep only last 10 messages
                if (conversationHistory.length > 10) {
                    conversationHistory = conversationHistory.slice(-10);
                }
            } else {
                // Use fallback if no API key configured
                response = getFallbackResponse(query);
            }
            
            // Display response with typing effect
            displayResponse(response);
            
        } catch (error) {
            console.error('Error in handleSearch:', error);
            // Use fallback on error
            const fallback = getFallbackResponse(query);
            displayResponse(fallback);
        } finally {
            if (searchButton) searchButton.disabled = false;
            if (searchInput) searchInput.disabled = false;
            if (searchInput) {
                searchInput.value = '';
                searchInput.focus();
            }
        }
    }
    


    // Search event listeners
    searchButton?.addEventListener('click', handleSearch);
    searchInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !searchButton.disabled) {
            handleSearch();
        }
    });
}

// Initialize contact section when DOM is loaded
document.addEventListener('DOMContentLoaded', initContactSection); 