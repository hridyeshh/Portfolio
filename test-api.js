// Simple test for the API function
const handler = require('./api/chat.js').default;

// Mock request
const req = {
    method: 'POST',
    body: {
        query: 'Tell me about your experience at Limeroad',
        conversationHistory: []
    }
};

// Mock response
const res = {
    status: (code) => {
        console.log(`Status: ${code}`);
        return res;
    },
    json: (data) => {
        console.log('Response:', JSON.stringify(data, null, 2));
    },
    setHeader: (name, value) => {
        console.log(`Header: ${name} = ${value}`);
    }
};

console.log('Testing API function...');
handler(req, res); 