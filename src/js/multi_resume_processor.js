const fs = require('fs');
const path = require('path');
const PDFProcessor = require('./pdf_processor.js');

class MultiResumeProcessor {
    constructor() {
        this.resumeDir = './Resume';
        this.processedResumes = {};
        this.companyContexts = {};
    }

    // Process all resumes in the Resume directory
    async processAllResumes() {
        console.log('📄 Multi-Resume Processor');
        console.log('=========================\n');
        
        try {
            const files = fs.readdirSync(this.resumeDir);
            const pdfFiles = files.filter(file => file.endsWith('.pdf'));
            
            console.log(`Found ${pdfFiles.length} resume PDFs:`);
            pdfFiles.forEach(file => console.log(`- ${file}`));
            console.log('');
            
            for (const file of pdfFiles) {
                const filePath = path.join(this.resumeDir, file);
                const companyName = this.extractCompanyName(file);
                
                console.log(`Processing: ${file} (${companyName})`);
                
                try {
                    const processor = new PDFProcessor();
                    const text = await processor.extractTextFromPDF(filePath);
                    
                    if (text) {
                        const cleanedData = this.cleanResumeData(text);
                        const formattedData = this.formatForCompany(cleanedData, companyName);
                        
                        this.processedResumes[companyName] = {
                            filename: file,
                            rawText: text,
                            cleanedData: cleanedData,
                            formattedData: formattedData
                        };
                        
                        console.log(`✅ Successfully processed ${companyName}`);
                    } else {
                        console.log(`❌ Failed to extract text from ${file}`);
                    }
                } catch (error) {
                    console.log(`❌ Error processing ${file}: ${error.message}`);
                }
            }
            
            // Generate combined context
            this.generateCombinedContext();
            
            // Save all processed data
            this.saveProcessedData();
            
            console.log('\n🎯 Next Steps:');
            console.log('1. Review the generated contexts in processed_resumes.json');
            console.log('2. Update server.js with the combined context');
            console.log('3. Test with company-specific questions');
            
        } catch (error) {
            console.error('❌ Error processing resumes:', error);
        }
    }

    // Extract company name from filename
    extractCompanyName(filename) {
        const name = filename.replace('hridyesh_resume_', '').replace('.pdf', '');
        return name === 'resume' ? 'General' : name.charAt(0).toUpperCase() + name.slice(1);
    }

    // Clean resume data (reusing logic from clean_resume_data.js)
    cleanResumeData(text) {
        let cleaned = text
            .replace(/\s+/g, ' ')
            .replace(/[•◦]/g, '\n• ')
            .replace(/([A-Z][a-z]+)\s*([A-Z][a-z]+)/g, '$1 $2')
            .trim();
        
        return {
            education: this.extractEducation(cleaned),
            experience: this.extractExperience(cleaned),
            skills: this.extractSkills(cleaned),
            projects: this.extractProjects(cleaned),
            achievements: this.extractAchievements(cleaned),
            fullText: cleaned
        };
    }

    // Extract functions (reused from clean_resume_data.js)
    extractEducation(text) {
        const educationMatch = text.match(/Education[^•]*•Netaji Subhas University of Technology[^•]*•Bachelor of Technology[^•]*•Relevant Coursework:[^•]*/);
        if (educationMatch) {
            return educationMatch[0]
                .replace(/Education[^•]*•/, '')
                .replace(/•/g, '\n• ')
                .trim();
        }
        return 'Bachelor of Technology in Mathematics and Computing from Netaji Subhas University of Technology (2025)';
    }

    extractExperience(text) {
        const experienceMatches = text.match(/Experience[^•]*•Limeroad[^•]*•College Setu[^•]*/);
        if (experienceMatches) {
            return experienceMatches[0]
                .replace(/Experience[^•]*•/, '')
                .replace(/•/g, '\n• ')
                .trim();
        }
        return 'Software Development Intern at Limeroad (Feb 2025 - Aug 2025) and College Setu (May 2024 - July 2024)';
    }

    extractSkills(text) {
        const skillsMatch = text.match(/Skills[^•]*•Languages and Development tools:[^•]*•Frameworks:[^•]*•Developer Tools:[^•]*/);
        if (skillsMatch) {
            return skillsMatch[0]
                .replace(/Skills[^•]*•/, '')
                .replace(/•/g, '\n• ')
                .trim();
        }
        return 'Java, Kotlin, React, React Native, Node.js, TypeScript, SQL, JavaScript, HTML, CSS, Material Design, Android SDK, Git, GitHub, Docker';
    }

    extractProjects(text) {
        const projectsMatch = text.match(/Projects[^•]*•FurniAR[^•]*•Optimized Neural Network-Based Routing Protocol[^•]*/);
        if (projectsMatch) {
            return projectsMatch[0]
                .replace(/Projects[^•]*•/, '')
                .replace(/•/g, '\n• ')
                .trim();
        }
        return 'FurniAR (AR furniture app), Neural Network Routing for VANETs, Email Oasis, Poem Generator, Quantum Computing project';
    }

    extractAchievements(text) {
        const achievementsMatch = text.match(/Achievements[^•]*•Authored[^•]*•Co-authored[^•]*/);
        if (achievementsMatch) {
            return achievementsMatch[0]
                .replace(/Achievements[^•]*•/, '')
                .replace(/•/g, '\n• ')
                .trim();
        }
        return 'Authored 23-page research paper on Grover\'s algorithm, Co-authored 13-page journal article on VANET routing protocol';
    }

    // Format data for specific company
    formatForCompany(cleanedData, companyName) {
        return `
${companyName.toUpperCase()} RESUME CONTENT:

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

    // Generate combined context for all companies
    generateCombinedContext() {
        let combinedContext = `
MULTI-COMPANY RESUME CONTENT:

You have access to multiple company-specific resume versions. When asked about specific companies, use the relevant resume content.

AVAILABLE COMPANY RESUMES:
`;

        Object.keys(this.processedResumes).forEach(company => {
            combinedContext += `- ${company}\n`;
        });

        combinedContext += `

GENERAL RESUME CONTENT:
`;

        // Use the first resume as the general template
        const firstCompany = Object.keys(this.processedResumes)[0];
        if (firstCompany) {
            combinedContext += this.processedResumes[firstCompany].formattedData;
        }

        combinedContext += `

COMPANY-SPECIFIC CONTEXTS:
`;

        Object.keys(this.processedResumes).forEach(company => {
            combinedContext += `
${company.toUpperCase()} RESUME:
${this.processedResumes[company].formattedData}
`;
        });

        this.combinedContext = combinedContext;
    }

    // Save processed data to files
    saveProcessedData() {
        // Save individual company data
        fs.writeFileSync('processed_resumes.json', JSON.stringify(this.processedResumes, null, 2));
        
        // Save combined context
        fs.writeFileSync('combined_resume_context.txt', this.combinedContext);
        
        // Save company-specific contexts
        Object.keys(this.processedResumes).forEach(company => {
            const filename = `${company.toLowerCase()}_resume_context.txt`;
            fs.writeFileSync(filename, this.processedResumes[company].formattedData);
        });
        
        console.log('\n💾 Saved files:');
        console.log('- processed_resumes.json (all processed data)');
        console.log('- combined_resume_context.txt (combined context)');
        Object.keys(this.processedResumes).forEach(company => {
            console.log(`- ${company.toLowerCase()}_resume_context.txt`);
        });
    }

    // Generate server update instructions
    generateServerUpdate() {
        return `
// Add this to your server.js portfolioContext
${this.combinedContext}

// Then update the context in server.js:
const portfolioContext = \`${this.combinedContext}\`;

// You can also add company-specific logic:
function getCompanySpecificContext(company) {
    const companyLower = company.toLowerCase();
    if (this.processedResumes[companyLower]) {
        return this.processedResumes[companyLower].formattedData;
    }
    return this.combinedContext;
}
`;
    }
}

// Run the multi-resume processor
const processor = new MultiResumeProcessor();
processor.processAllResumes();

module.exports = MultiResumeProcessor; 