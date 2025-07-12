// Test file for Vercel function
const handler = require('./api/chat.js').default;

// Mock request and response
const mockReq = {
    method: 'POST',
    body: {
        query: 'Tell me about your experience at Limeroad',
        conversationHistory: []
    },
    headers: {
        'content-type': 'application/json'
    }
};

const mockRes = {
    status: (code) => {
        console.log(`Status: ${code}`);
        return mockRes;
    },
    json: (data) => {
        console.log('Response:', JSON.stringify(data, null, 2));
    },
    setHeader: (name, value) => {
        console.log(`Header: ${name} = ${value}`);
    }
};

// Test the function
console.log('Testing Vercel function...');
handler(mockReq, mockRes); 