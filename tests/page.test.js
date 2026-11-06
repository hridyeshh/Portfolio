// Run: npm test. Drives the real page in system Chrome against the real route and a fake API. No key, no spend.
const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright-core');
const { text, sendJson, apiError, startFakeAnthropic, useFake, nextIp } = require('./helpers');

let fake;
let server;
let origin;
let browser;

before(async () => {
    fake = await startFakeAnthropic();
    useFake(fake);
    const app = require('../src/js/local-server.js');
    await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
    origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ channel: 'chrome', headless: true });
});

after(async () => {
    await browser.close();
    server.closeAllConnections();
    server.close();
    await fake.close();
});

beforeEach(() => {
    fake.requests.length = 0;
    fake.respond = (res) => sendJson(res, 200, text('ok'));
});

// A fresh visitor with their own rate-limit bucket. CDNs are blocked, so every test also proves the chat works without them.
async function visit(t, ip = nextIp()) {
    const context = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': ip } });
    t.after(() => context.close());
    await context.route((url) => url.origin !== origin, (route) => route.abort());

    const page = await context.newPage();
    const sent = [];
    page.on('request', (request) => {
        if (request.url().endsWith('/api/chat')) sent.push(request.postDataJSON());
    });
    await page.goto(origin, { waitUntil: 'domcontentloaded' });
    return { page, sent };
}

async function submit(page, question) {
    await page.fill('#ai-input', question);
    await page.press('#ai-input', 'Enter');
}

async function ask(page, question) {
    const [response] = await Promise.all([page.waitForResponse('**/api/chat'), submit(page, question)]);
    return response;
}

const shows = (page, expected) => page.waitForFunction(
    (value) => document.getElementById('ai-response').textContent.includes(value),
    expected,
);

test('every suggested question reaches the model and its answer shows', async (t) => {
    const { page, sent } = await visit(t);
    const chips = await page.locator('[data-q]').all();
    assert.equal(chips.length, 4);

    for (const [index, chip] of chips.entries()) {
        const label = (await chip.textContent()).trim();
        const reply = `Reply ${index}`;
        fake.respond = (res) => sendJson(res, 200, text(reply));
        const [response] = await Promise.all([page.waitForResponse('**/api/chat'), chip.click()]);
        assert.equal(response.status(), 200, label);
        assert.equal(sent[index].query, label);
        await shows(page, reply);
    }
});

test('a long conversation stays valid: history holds at 6 and never trips the validator', async (t) => {
    const { page, sent } = await visit(t);
    fake.respond = (res, attempt) => sendJson(res, 200, text(`Reply ${attempt}`));

    for (let i = 1; i <= 7; i += 1) {
        const response = await ask(page, `Question ${i}`);
        assert.equal(response.status(), 200, `question ${i}`);
        await shows(page, `Reply ${i}`);
    }

    assert.deepEqual(sent.map((body) => body.conversationHistory.length), [0, 2, 4, 6, 6, 6, 6]);
    for (const { conversationHistory } of sent.slice(1)) {
        assert.equal(conversationHistory[0].role, 'user');
    }
    assert.deepEqual(sent[6].conversationHistory.slice(-2), [
        { role: 'user', content: 'Question 6' },
        { role: 'assistant', content: 'Reply 6' },
    ]);
});

test('a reply over the limit is trimmed before it goes back, so the next question still works', async (t) => {
    const { page, sent } = await visit(t);
    fake.respond = (res) => sendJson(res, 200, text('x'.repeat(1500)));
    assert.equal((await ask(page, 'Tell me everything')).status(), 200);

    fake.respond = (res) => sendJson(res, 200, text('ok'));
    assert.equal((await ask(page, 'Next question')).status(), 200);
    assert.equal(sent[1].conversationHistory[1].content.length, 1000);
});

test('a failed turn shows the fallback and stays out of history', async (t) => {
    t.mock.method(console, 'error', () => {});
    const { page, sent } = await visit(t);
    fake.respond = (res) => apiError(res, 500);
    assert.equal((await ask(page, 'First')).status(), 500);
    await shows(page, 'gmail.com');

    fake.respond = (res) => sendJson(res, 200, text('ok'));
    assert.equal((await ask(page, 'Second')).status(), 200);
    assert.deepEqual(sent[1].conversationHistory, []);
});

test('hitting the rate limit shows the slow-down message', async (t) => {
    const ip = nextIp();
    for (let i = 0; i < 10; i += 1) {
        await fetch(`${origin}/api/chat`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
            body: '{"query":"hi"}',
        });
    }
    const { page } = await visit(t, ip);
    assert.equal((await ask(page, 'One more')).status(), 429);
    await shows(page, 'lot of questions');
});

const brokenTransports = [
    ['a dropped connection', (route) => route.abort()],
    ['a non-JSON gateway error', (route) => route.fulfill({ status: 504, contentType: 'text/html', body: '<html>Gateway Timeout</html>' })],
];

for (const [name, handle] of brokenTransports) {
    test(`${name} shows the network message, then the chat recovers`, async (t) => {
        const { page, sent } = await visit(t);
        await page.route('**/api/chat', handle);
        await submit(page, 'First');
        await shows(page, 'Network error');
        await page.unroute('**/api/chat');

        assert.equal((await ask(page, 'Second')).status(), 200);
        assert.deepEqual(sent[1].conversationHistory, []);
    });
}

test('markup in a reply is shown as text, never rendered', async (t) => {
    const { page } = await visit(t);
    const markup = '<img src=x onerror="window.__xss=1">';
    fake.respond = (res) => sendJson(res, 200, text(markup));
    await ask(page, 'hi');
    await shows(page, markup);

    const rendered = await page.evaluate(() => ({
        images: document.querySelectorAll('#ai-response img').length,
        ran: window.__xss === 1,
    }));
    assert.deepEqual(rendered, { images: 0, ran: false });
});

test('the input stops at 500 characters, so a paste cannot trip the validator', async (t) => {
    const { page, sent } = await visit(t);
    await page.focus('#ai-input');
    await page.keyboard.insertText('x'.repeat(600));
    assert.equal((await page.inputValue('#ai-input')).length, 500);

    const [response] = await Promise.all([page.waitForResponse('**/api/chat'), page.press('#ai-input', 'Enter')]);
    assert.equal(response.status(), 200);
    assert.equal(sent[0].query.length, 500);
});

test('empty and blank input send nothing', async (t) => {
    const { page, sent } = await visit(t);
    await page.press('#ai-input', 'Enter');
    await submit(page, '   ');
    await page.waitForTimeout(300);
    assert.equal(sent.length, 0);
});

test('double-clicking a suggestion leaves history valid', async (t) => {
    const { page, sent } = await visit(t);
    await page.click('[data-q="project"]', { clickCount: 2 });
    await page.waitForFunction(() => document.getElementById('ai-response').textContent === 'ok');
    assert.equal(sent.length, 2);

    assert.equal((await ask(page, 'Next question')).status(), 200);
    assert.equal(sent[2].conversationHistory[0].role, 'user');
});
