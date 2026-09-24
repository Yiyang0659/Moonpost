/* API contract tests use SQLite, not a SQL-pattern mock, so schema constraints and
 * INSERT SELECT/idempotency behavior are exercised by the actual queries. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { DatabaseSync } = require('node:sqlite');
const ts = require('typescript');
const { webcrypto } = require('node:crypto');
global.crypto ||= webcrypto;
const source = fs.readFileSync('functions/api/[[path]].ts', 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const mod = { exports: {} };
new Function('exports', 'module', compiled)(mod.exports, mod);
const { onRequest } = mod.exports;
const sqlite = new DatabaseSync(':memory:');
sqlite.exec(fs.readFileSync('migrations/0001_letters.sql', 'utf8'));
const db = {
  prepare(sql) {
    let params = [];
    return {
      bind(...args) { params = args; return this; },
      async first() { return sqlite.prepare(sql).get(...params) || null; },
      async all() { return { results: sqlite.prepare(sql).all(...params) }; },
      async run() { const r = sqlite.prepare(sql).run(...params); return { meta: { changes: Number(r.changes) } }; },
    };
  },
  async batch(statements) {
    sqlite.exec('BEGIN');
    try { const result = []; for (const s of statements) result.push(await s.run()); sqlite.exec('COMMIT'); return result; }
    catch (e) { sqlite.exec('ROLLBACK'); throw e; }
  },
};
const card = { templateId: 'classic', recipient: '朋友', sender: '月球邮局', title: '中秋快乐', message: '愿同一轮月光，照亮你我。', mark: '月球来信', seal: 'moon', stamp: 'moon', logoKind: 'brand' };
const secret = 'A'.repeat(43);
const requestId = () => crypto.randomUUID();
async function api(path, method = 'GET', body, extraHeaders = {}, env = { LETTERS_DB: db }) {
  const response = await onRequest({ request: new Request(`https://moonpost.pages.dev/api/letters${path}`, { method, headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...extraHeaders }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }), env });
  assert.match(response.headers.get('Cache-Control'), /no-store/);
  return { status: response.status, body: await response.json() };
}
(async () => {
  const unavailable = await api('', 'POST', {}, {}, {}); assert.equal(unavailable.status, 503); assert.equal(unavailable.body.code, 'database_unavailable');
  const malicious = await api('', 'POST', { card, ownerSecret: secret, requestId: requestId() }, { Origin: 'https://attacker.example' }); assert.equal(malicious.status, 403);
  const malformed = await api('', 'POST', { card: { ...card, templateId: 'bad' }, ownerSecret: secret, requestId: requestId() }); assert.equal(malformed.status, 400);
  const overflow = await api('', 'POST', { card: { ...card, message: '一\n'.repeat(8) }, ownerSecret: secret, requestId: requestId() }); assert.equal(overflow.body.code, 'message_overflow');
  const svg = await api('', 'POST', { card: { ...card, logoKind: 'image' }, logo: 'data:image/svg+xml;base64,' + Buffer.from('<svg/>').toString('base64'), ownerSecret: secret, requestId: requestId() }); assert.equal(svg.status, 400);
  const fakeRaster = await api('', 'POST', { card: { ...card, logoKind: 'image' }, logo: 'data:image/png;base64,' + Buffer.from('<svg onload=alert(1)/>').toString('base64'), ownerSecret: secret, requestId: requestId() }); assert.equal(fakeRaster.status, 400);
  const large = await api('', 'POST', { ignored: 'x'.repeat(190 * 1024) }); assert.equal(large.status, 413);
  const payload = { card, ownerSecret: secret, requestId: requestId() };
  const created = await api('', 'POST', payload); assert.equal(created.status, 201); assert.match(created.body.id, /^[A-Za-z0-9_-]{32}$/);
  const duplicate = await api('', 'POST', payload); assert.equal(duplicate.status, 200); assert.equal(duplicate.body.id, created.body.id);
  const conflict = await api('', 'POST', { ...payload, card: { ...card, message: '另一个内容' } }); assert.equal(conflict.status, 409);
  assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM letters').get().n, 1);
  const stored = sqlite.prepare('SELECT owner_hash, card FROM letters').get(); assert.notEqual(stored.owner_hash, secret); assert.equal(stored.owner_hash.length, 64);
  const path = `/${created.body.id}`;
  const publicRead = await api(path); assert.equal(publicRead.status, 200); assert.deepEqual(publicRead.body.card, card); assert.deepEqual(Object.keys(publicRead.body).sort(), ['card', 'createdAt', 'id']);
  assert.equal((await api(path + '/inbox')).status, 403);
  assert.equal((await api(path + '/inbox', 'GET', undefined, { Authorization: 'Bearer ' + 'B'.repeat(43) })).status, 403);
  const reply = { name: '好友', message: '也祝你中秋快乐！', requestId: requestId() };
  const replied = await api(path + '/replies', 'POST', reply); assert.equal(replied.status, 201);
  const replyAgain = await api(path + '/replies', 'POST', reply); assert.equal(replyAgain.body.id, replied.body.id); assert.equal(replyAgain.status, 200);
  assert.equal((await api(path + '/replies', 'POST', { ...reply, message: '变更内容' })).status, 409);
  assert.equal((await api(path + '/replies')).status, 405);
  const inbox = await api(path + '/inbox', 'GET', undefined, { Authorization: 'Bearer ' + secret }); assert.equal(inbox.status, 200); assert.equal(inbox.body.replies.length, 1); assert.equal(inbox.body.replies[0].message, reply.message);
  assert.equal((await api(path)).body.replies, undefined);
  for (let i = 1; i < 30; i++) assert.equal((await api(path + '/replies', 'POST', { name: '', message: '愿你安好', requestId: requestId() })).status, 201);
  assert.equal((await api(path + '/replies', 'POST', { name: '', message: '第31封', requestId: requestId() })).body.code, 'reply_limit');
  assert.equal((await api(path + '/inbox', 'DELETE', undefined, { Authorization: 'Bearer ' + 'B'.repeat(43) })).status, 403);
  assert.equal((await api(path + '/inbox', 'DELETE', undefined, { Authorization: 'Bearer ' + secret })).status, 200);
  assert.equal((await api(path)).status, 404); assert.equal(sqlite.prepare('SELECT COUNT(*) n FROM letter_replies').get().n, 0);
  assert.equal((await api(path + '/replies', 'POST', reply)).status, 404);
  // Ensure rate limiting is actually active, independently of per-letter cap.
  sqlite.exec('DELETE FROM letter_rate_limits');
  for (let i = 0; i < 20; i++) assert.equal((await api('', 'POST', { card, ownerSecret: secret, requestId: requestId() })).status, 201);
  assert.equal((await api('', 'POST', { card, ownerSecret: secret, requestId: requestId() })).status, 429);
  console.log('PASS letters API: SQLite migration, cloud-unavailable, origin/body/content validation, private mailbox authorization, create/reply idempotency, reply cap, revocation, rate limits.');
  sqlite.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
