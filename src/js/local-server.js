// Local preview: npm run dev. Serves the real page and the real chat route, the same code Vercel runs.
const express = require('express');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
require('dotenv').config({ path: path.join(ROOT, '.env') }); // before api/chat.js, whose client reads the key once

const chat = require('../../api/chat.js');

const app = express();
app.use(express.json());
app.all('/api/chat', chat);
// Explicit on purpose: the default only hides a dotfile at the end of a path, so .git/config would be served.
app.use(express.static(ROOT, { dotfiles: 'ignore' }));

if (require.main === module) {
    // Loopback only: this server holds a live API key.
    app.listen(8000, '127.0.0.1', () => console.log('Local server running on http://localhost:8000'));
}

module.exports = app;
