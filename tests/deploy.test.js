// Run: npm run test:deploy. About a minute. Needs the Vercel CLI and network, but no login and no key.
// Builds what a fresh clone holds with Vercel's own builder, then runs the built function away from this repo.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { execFile, execSync } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { TEST_KEY, text, sendJson, startFakeAnthropic } = require('./helpers');

const run = promisify(execFile);
const ROOT = path.join(__dirname, '..');

// Uncommitted files a commit would carry. Copying them is harmless once they are committed.
const CHANGED = ['api/chat.js', 'index.html', 'package.json', 'package-lock.json', 'src/js/local-server.js'];

let temp;
let output;
let functionDir;

before(async () => {
    temp = fs.mkdtempSync(path.join(os.tmpdir(), 'portfolio-deploy-'));
    const clone = path.join(temp, 'clone');
    fs.mkdirSync(clone);
    execSync(`git archive HEAD | tar -x -C "${clone}"`, { cwd: ROOT });
    for (const file of CHANGED) fs.copyFileSync(path.join(ROOT, file), path.join(clone, file));

    fs.mkdirSync(path.join(clone, '.vercel'));
    fs.writeFileSync(path.join(clone, '.vercel/project.json'), JSON.stringify({ projectId: 'prj_test', orgId: 'team_test', settings: {} }));

    await run('vercel', ['build', '--yes'], { cwd: clone, maxBuffer: 64 * 1024 * 1024 });
    output = path.join(clone, '.vercel/output');
    functionDir = path.join(output, 'functions/api/chat.js.func');
}, { timeout: 300000 });

after(() => {
    if (temp) fs.rmSync(temp, { recursive: true, force: true });
});

test('the builder bundles the SDK into the function', () => {
    const config = JSON.parse(fs.readFileSync(path.join(functionDir, '.vc-config.json'), 'utf8'));
    assert.match(config.runtime, /^nodejs/);
    assert.ok(fs.existsSync(path.join(functionDir, 'node_modules/@anthropic-ai/sdk/client.js')), 'SDK missing from the bundle');
});

test('the built function loads on its own and answers', async () => {
    const isolated = path.join(temp, 'isolated');
    fs.cpSync(functionDir, isolated, { recursive: true, dereference: true });
    const { handler } = JSON.parse(fs.readFileSync(path.join(isolated, '.vc-config.json'), 'utf8'));

    const fake = await startFakeAnthropic();
    fake.respond = (res) => sendJson(res, 200, text('Built function answered'));

    const script = `
        const handler = require(${JSON.stringify(path.join(isolated, handler))});
        const res = {
            status(code) { this.code = code; return this; },
            json(body) { console.log(JSON.stringify({ code: this.code, body })); return this; },
        };
        handler({ method: 'POST', headers: {}, body: { query: 'hi' } }, res);
    `;
    const { stdout } = await run(process.execPath, ['-e', script], {
        cwd: isolated,
        env: { PATH: process.env.PATH, HOME: temp, ANTHROPIC_API_KEY: TEST_KEY, ANTHROPIC_BASE_URL: fake.url },
    });
    await fake.close();

    assert.deepEqual(JSON.parse(stdout), { code: 200, body: { response: 'Built function answered' } });
    assert.equal(fake.requests[0].body.model, 'claude-haiku-5-5');
});

test('routes send /api/chat to the function and pages to the new index.html', () => {
    const { routes } = JSON.parse(fs.readFileSync(path.join(output, 'config.json'), 'utf8'));
    const chat = routes.find((route) => route.src?.includes('/api/chat'));
    assert.equal(chat?.dest, '/api/chat.js');

    const html = fs.readFileSync(path.join(output, 'static/index.html'), 'utf8');
    assert.match(html, /maxlength="500"/);
});

test('no private file ships', () => {
    const files = fs.readdirSync(output, { recursive: true }).map(String);
    assert.deepEqual(files.filter((file) => /(^|\/)\.env$|\.plan\.md$|(^|\/)tests\//.test(file)), []);
});
