const fs = require('fs');

// Clean and format the extracted resume data
function cleanResumeData(rawText) {
    // Clean up the text
    let cleaned = rawText
        .replace(/\s+/g, ' ')  // Normalize whitespace
        .replace(/[•◦]/g, '\n• ')  // Fix bullet points
        .replace(/([A-Z][a-z]+)\s*([A-Z][a-z]+)/g, '$1 $2')  // Fix spacing
        .trim();
    
    // Extract key information using regex patterns
    const education = extractEducation(cleaned);
    const experience = extractExperience(cleaned);
    const skills = extractSkills(cleaned);
    const projects = extractProjects(cleaned);
    const achievements = extractAchievements(cleaned);
    
    return {
        education,
        experience,
        skills,
        projects,
        achievements,
        fullText: cleaned
    };
}

function extractEducation(text) {
    const educationMatch = text.match(/Education[^•]*•Netaji Subhas University of Technology[^•]*•Bachelor of Technology[^•]*•Relevant Coursework:[^•]*/);
    if (educationMatch) {
        return educationMatch[0]
            .replace(/Education[^•]*•/, '')
            .replace(/•/g, '\n• ')
            .trim();
    }
    return 'Bachelor of Technology in Mathematics and Computing from Netaji Subhas University of Technology (2025)';
}

function extractExperience(text) {
    const experienceMatches = text.match(/Experience[^•]*•Limeroad[^•]*•College Setu[^•]*/);
    if (experienceMatches) {
        return experienceMatches[0]
            .replace(/Experience[^•]*•/, '')
            .replace(/•/g, '\n• ')
            .trim();
    }
    return 'Software Development Intern at Limeroad (Feb 2025 - Aug 2025) and College Setu (May 2024 - July 2024)';
}

function extractSkills(text) {
    const skillsMatch = text.match(/Skills[^•]*•Languages and Development tools:[^•]*•Frameworks:[^•]*•Developer Tools:[^•]*/);
    if (skillsMatch) {
        return skillsMatch[0]
            .replace(/Skills[^•]*•/, '')
            .replace(/•/g, '\n• ')
            .trim();
    }
    return 'Java, Kotlin, React, React Native, Node.js, TypeScript, SQL, JavaScript, HTML, CSS, Material Design, Android SDK, Git, GitHub, Docker';
}

function extractProjects(text) {
    const projectsMatch = text.match(/Projects[^•]*•FurniAR[^•]*•Optimized Neural Network-Based Routing Protocol[^•]*/);
    if (projectsMatch) {
        return projectsMatch[0]
            .replace(/Projects[^•]*•/, '')
            .replace(/•/g, '\n• ')
            .trim();
    }
    return 'FurniAR (AR furniture app), Neural Network Routing for VANETs, Email Oasis, Poem Generator, Quantum Computing project';
}

function extractAchievements(text) {
    const achievementsMatch = text.match(/Achievements[^•]*•Authored[^•]*•Co-authored[^•]*/);
    if (achievementsMatch) {
        return achievementsMatch[0]
            .replace(/Achievements[^•]*•/, '')
            .replace(/•/g, '\n• ')
            .trim();
    }
    return 'Authored 23-page research paper on Grover\'s algorithm, Co-authored 13-page journal article on VANET routing protocol';
}

// Create formatted resume data for AI integration
function createFormattedResumeData(cleanedData) {
    return `
RESUME DETAILS:

EDUCATION:
${cleanedData.education}

EXPERIENCE:
${cleanedData.experience}

SKILLS:
${cleanedData.skills}

PROJECTS:
${cleanedData.projects}

ACHIEVEMENTS:
${cleanedData.achievements}

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
`;
}

// Main function
function processResumeData() {
    console.log('🧹 Cleaning Resume Data');
    console.log('=======================\n');
    
    try {
        // Read the raw extracted data
        const rawData = fs.readFileSync('resume_content.txt', 'utf8');
        
        // Clean and format the data
        const cleanedData = cleanResumeData(rawData);
        const formattedData = createFormattedResumeData(cleanedData);
        
        // Save the cleaned data
        fs.writeFileSync('cleaned_resume_data.txt', formattedData);
        
        console.log('✅ Successfully cleaned and formatted resume data');
        console.log('💾 Saved to: cleaned_resume_data.txt');
        
        console.log('\n📋 Next Steps:');
        console.log('1. Copy the content from cleaned_resume_data.txt');
        console.log('2. Add it to the portfolioContext in server.js');
        console.log('3. Restart your server to test');
        
        console.log('\n📝 Sample of cleaned data:');
        console.log(formattedData.substring(0, 800) + '...');
        
        return formattedData;
        
    } catch (error) {
        console.error('❌ Error processing resume data:', error);
        return null;
    }
}

// Run the processor
const formattedData = processResumeData();

module.exports = {
    cleanResumeData,
    createFormattedResumeData,
    processResumeData
}; 