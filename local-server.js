const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static('.'));

// Simple API endpoint for testing
app.post('/api/chat', async (req, res) => {
    try {
        const { query } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }
        
        // Simple response for testing
        const response = `I'm Hridyesh Kumar, a software developer with experience at Limeroad (Feb-Aug 2025) working on Android development with Kotlin and TypeScript, and at College Setu (May-July 2024) developing data collection portals with Flask and SQL. I'm passionate about creating elegant solutions and believe great code tells a story.`;
        
        res.json({ response });
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`🚀 Local server running on http://localhost:${PORT}`);
    console.log(`📁 Serving static files from current directory`);
    console.log(`🔗 Test API at http://localhost:${PORT}/api/chat`);
    console.log(`🧪 Test page at http://localhost:${PORT}/test_api.html`);
}); 