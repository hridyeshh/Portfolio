const fs = require('fs');
const path = require('path');

// PDF text extraction helper
class PDFProcessor {
    constructor() {
        this.resumeText = '';
    }

    // Method 1: Using pdf-parse (requires npm install pdf-parse)
    async extractTextFromPDF(pdfPath) {
        try {
            // Check if pdf-parse is available
            const pdfParse = require('pdf-parse');
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);
            return data.text;
        } catch (error) {
            console.log('pdf-parse not available, trying alternative methods...');
            return this.extractTextAlternative(pdfPath);
        }
    }

    // Method 2: Manual text extraction (fallback)
    extractTextAlternative(pdfPath) {
        console.log('📄 PDF Processing Options:');
        console.log('==========================\n');
        
        console.log('Option 1: Install pdf-parse');
        console.log('npm install pdf-parse');
        console.log('Then run: node pdf_processor.js\n');
        
        console.log('Option 2: Manual extraction');
        console.log('1. Open your PDF in a text editor or online converter');
        console.log('2. Copy the text content');
        console.log('3. Save as resume.txt\n');
        
        console.log('Option 3: Use online PDF to text converter');
        console.log('- Go to https://www.pdftotext.com/');
        console.log('- Upload your resume PDF');
        console.log('- Copy the extracted text\n');
        
        return null;
    }

    // Process and format resume text
    processResumeText(text) {
        if (!text) return '';
        
        // Clean up the text
        let cleanedText = text
            .replace(/\n+/g, '\n')  // Remove extra newlines
            .replace(/\s+/g, ' ')   // Normalize whitespace
            .trim();
        
        // Extract key sections (basic parsing)
        const sections = {
            education: this.extractSection(cleanedText, ['education', 'academic', 'degree', 'university']),
            experience: this.extractSection(cleanedText, ['experience', 'work', 'employment', 'internship']),
            skills: this.extractSection(cleanedText, ['skills', 'technologies', 'programming', 'languages']),
            projects: this.extractSection(cleanedText, ['projects', 'portfolio', 'achievements']),
            certifications: this.extractSection(cleanedText, ['certifications', 'certificates', 'awards'])
        };
        
        return this.formatForAI(sections, cleanedText);
    }

    extractSection(text, keywords) {
        const lines = text.split('\n');
        let section = '';
        let inSection = false;
        
        for (let line of lines) {
            const lowerLine = line.toLowerCase();
            const hasKeyword = keywords.some(keyword => lowerLine.includes(keyword));
            
            if (hasKeyword) {
                inSection = true;
                section += line + '\n';
            } else if (inSection && line.trim() && !line.match(/^[A-Z\s]+$/)) {
                // Continue section until we hit another major heading
                section += line + '\n';
            } else if (inSection && line.match(/^[A-Z\s]+$/)) {
                // Stop at next major heading
                break;
            }
        }
        
        return section.trim();
    }

    formatForAI(sections, fullText) {
        return `
RESUME CONTENT:

EDUCATION:
${sections.education || 'Not found in resume'}

EXPERIENCE:
${sections.experience || 'Not found in resume'}

SKILLS:
${sections.skills || 'Not found in resume'}

PROJECTS:
${sections.projects || 'Not found in resume'}

CERTIFICATIONS:
${sections.certifications || 'Not found in resume'}

FULL RESUME TEXT:
${fullText.substring(0, 2000)}${fullText.length > 2000 ? '...' : ''}
`;
    }

    // Generate server.js update
    generateServerUpdate(resumeContent) {
        return `
// Add this to your server.js portfolioContext
${resumeContent}

// Then update the context in server.js:
const portfolioContext = \`${resumeContent}\`;
`;
    }

    // Main processing function
    async processResume(pdfPath) {
        console.log('📄 Resume PDF Processor');
        console.log('=======================\n');
        
        if (!fs.existsSync(pdfPath)) {
            console.log(`❌ PDF file not found: ${pdfPath}`);
            console.log('📝 Please ensure your resume PDF is in the current directory');
            return;
        }
        
        console.log(`✅ Found PDF: ${pdfPath}`);
        
        // Try to extract text
        const text = await this.extractTextFromPDF(pdfPath);
        
        if (text) {
            console.log('✅ Successfully extracted text from PDF');
            const processedContent = this.processResumeText(text);
            
            // Save to file
            fs.writeFileSync('resume_content.txt', processedContent);
            console.log('💾 Saved processed content to resume_content.txt');
            
            console.log('\n📋 Next Steps:');
            console.log('1. Copy the content from resume_content.txt');
            console.log('2. Add it to the portfolioContext in server.js');
            console.log('3. Restart your server');
            
            console.log('\n📝 Sample content:');
            console.log(processedContent.substring(0, 500) + '...');
            
        } else {
            console.log('❌ Could not extract text automatically');
            console.log('📝 Please use one of the manual options above');
        }
    }
}

// Run the processor
const processor = new PDFProcessor();
processor.processResume('hridyesh_resume.pdf');

module.exports = PDFProcessor; 