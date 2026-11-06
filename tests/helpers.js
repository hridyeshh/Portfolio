// Shared by the chat tests. A fake Anthropic API, so the real SDK and route run with no key, no network and no spend.
const http = require('http');

const TEST_KEY = 'sk-ant-test-not-a-real-key';

function message(content, stop_reason = 'end_turn') {
    return {
        id: 'msg_test',
        type: 'message',
        role: 'assistant',
        model: 'claude-haiku-5-5',
        content,
        stop_reason,
        stop_sequence: null,
        usage: { input_tokens: 1, output_tokens: 1 },
    };
}

const text = (value) => message([{ type: 'text', text: value }]);

function sendJson(res, status, body, headers = {}) {
    res.writeHead(status, { 'content-type': 'application/json', ...headers });
    res.end(JSON.stringify(body));
}

// An API error. retry-after-ms keeps the SDK's one retry from slowing the suite.
function apiError(res, status) {
    sendJson(res, status, { type: 'error', error: { type: 'api_error', message: `upstream says ${status}` } }, { 'retry-after-ms': '1' });
}

async function startFakeAnthropic() {
    const fake = {
        requests: [],
        respond: (res) => sendJson(res, 200, text('ok')),
    };
    const server = http.createServer((req, res) => {
        let raw = '';
        req.on('data', (chunk) => { raw += chunk; });
        req.on('end', () => {
            fake.requests.push({ path: req.url, headers: req.headers, body: JSON.parse(raw) });
            fake.respond(res, fake.requests.length);
        });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    fake.url = `http://127.0.0.1:${server.address().port}`;
    fake.close = () => new Promise((resolve) => { server.closeAllConnections(); server.close(resolve); });
    return fake;
}

// Points the SDK at the fake. Call before api/chat.js is first required: its client reads these once.
function useFake(fake) {
    process.env.ANTHROPIC_BASE_URL = fake.url;
    process.env.ANTHROPIC_API_KEY = TEST_KEY;
}

let ipCounter = 0;

// Every caller gets its own rate-limit bucket unless it reuses an IP on purpose.
function nextIp() {
    ipCounter += 1;
    return `10.0.${Math.floor(ipCounter / 256)}.${ipCounter % 256}`;
}

module.exports = { TEST_KEY, message, text, sendJson, apiError, startFakeAnthropic, useFake, nextIp };
