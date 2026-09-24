// Cloudflare Pages Functions: the recipient URL is a read/reply capability;
// inbox access always needs the separate owner secret in an Authorization header.
interface Statement {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes?: number } }>;
}
interface Database { prepare(query: string): Statement; batch(statements: Statement[]): Promise<unknown[]> }
interface Env { LETTERS_DB?: Database }
interface Context { request: Request; env: Env }
type Card = { templateId: string; recipient: string; sender: string; title: string; message: string; mark: string; seal: string; stamp: string; logoKind: string };
type LetterRow = { id: string; card: string; logo: string | null; owner_hash: string; content_hash: string; created_at: string };
type ReplyRow = { id: string; name: string; message: string; created_at: string };
const MAX_BODY = 180 * 1024;
const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store, private', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', 'Referrer-Policy': 'no-referrer' };
class HttpError extends Error { constructor(public status: number, public code: string, message: string) { super(message); } }
const fail = (status: number, code: string, message: string): never => { throw new HttpError(status, code, message); };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const hash = async (value: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, '0')).join('');
const token = () => btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const uuid = (value: unknown): string => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : fail(400, 'invalid_request_id', '请刷新页面后重新寄信。');
const ownerSecret = (value: unknown): string => typeof value === 'string' && /^[A-Za-z0-9_-]{43,128}$/.test(value) ? value : fail(400, 'invalid_owner_key', '收件箱凭证无效，请从原寄信页面重试。');
function field(value: unknown, max: number, required = false, multiline = false): string {
  if (typeof value !== 'string' || Array.from(value).length > max || (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value)) return fail(400, 'invalid_content', '信件内容格式不正确，或字数超过限制。');
  const result = value.trim();
  if (required && !result) return fail(400, 'empty_content', '请先写下想说的话。');
  return result;
}
function choice(value: unknown, values: string[]): string {
  return typeof value === 'string' && values.includes(value) ? value : fail(400, 'invalid_style', '请选择有效的明信片样式。');
}
function fitsMessage(message: string, template: string): boolean {
  const shape: Record<string, [number, number]> = { classic: [16, 5], phases: [29, 3], osmanthus: [11, 9], ticket: [30, 2] };
  const [chars, maxRows] = shape[template];
  let rows = 0;
  for (const row of message.replace(/\r/g, '').split('\n')) {
    let current: string[] = [];
    for (const char of Array.from(row)) {
      if (current.length >= chars) {
        current = /[，。！？、；：）】]/.test(char) && current.length > 1 ? [current[current.length - 1]] : [];
        rows++;
      }
      current.push(char);
    }
    rows++;
  }
  return rows <= maxRows;
}
function cardValue(input: unknown): Card {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return fail(400, 'invalid_card', '明信片数据不完整。');
  const d = input as Record<string, unknown>;
  const templateId = choice(d.templateId, ['classic', 'phases', 'osmanthus', 'ticket']);
  const limits: Record<string, number> = { classic: 80, phases: 87, osmanthus: 99, ticket: 60 };
  const message = field(d.message, limits[templateId], true, true);
  if (!fitsMessage(message, templateId)) return fail(400, 'message_overflow', '文字超出信纸范围，请缩短内容或减少换行。');
  return { templateId, recipient: field(d.recipient, 14), sender: field(d.sender, 14), title: field(d.title, 14), message, mark: field(d.mark, 6), seal: choice(d.seal, ['moon', 'rabbit', 'festival']), stamp: choice(d.stamp, ['moon', 'rabbit', 'flower', 'rocket']), logoKind: choice(d.logoKind, ['brand', 'type', 'image', 'none']) };
}
function logoValue(value: unknown, card: Card): string | null {
  if (card.logoKind !== 'image') return null;
  if (typeof value !== 'string' || value.length > 160 * 1024) return fail(400, 'invalid_logo', '请重新上传较小的 PNG、JPEG 或 WebP 图片。');
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match || match[2].length % 4 !== 0) return fail(400, 'invalid_logo', '图片格式无效。');
  let bytes: string;
  try { bytes = atob(match[2]); } catch { return fail(400, 'invalid_logo', '图片格式无效。'); }
  const isPng = bytes.startsWith('\x89PNG\r\n\x1a\n');
  const isJpeg = bytes.startsWith('\xff\xd8\xff');
  const isWebp = bytes.startsWith('RIFF') && bytes.slice(8, 12) === 'WEBP';
  if (bytes.length < 16 || !(match[1] === 'png' && isPng || match[1] === 'jpeg' && isJpeg || match[1] === 'webp' && isWebp)) return fail(400, 'invalid_logo', '图片格式与内容不匹配。');
  return value;
}
async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('Content-Type') || '')) return fail(415, 'json_required', '请使用网站中的寄信或回信按钮。');
  if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY) return fail(413, 'body_too_large', '信件数据过大，请缩小上传图片。');
  const reader = request.body?.getReader();
  if (!reader) return fail(400, 'invalid_json', '信件数据为空。');
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); return fail(413, 'body_too_large', '信件数据过大，请缩小上传图片。'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const result = JSON.parse(new TextDecoder().decode(bytes));
    if (!result || typeof result !== 'object' || Array.isArray(result)) throw new Error();
    return result;
  } catch { return fail(400, 'invalid_json', '信件数据格式不正确。'); }
}
function checkOrigin(request: Request) {
  const origin = request.headers.get('Origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') fail(403, 'wrong_origin', '请回到月球来信网站进行操作。');
}
async function limit(db: Database, request: Request, action: string, max: number, period = 3600000) {
  // Only a short-lived digest of Cloudflare's trusted connection IP is retained.
  const bucket = Math.floor(Date.now() / period);
  const key = await hash(`${action}:${bucket}:${request.headers.get('CF-Connecting-IP') || 'local'}`);
  const row = await db.prepare('INSERT INTO letter_rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count').bind(key, Date.now() + period * 2).first<{ count: number }>();
  if (row && row.count > max) fail(429, 'rate_limited', '寄信太频繁了，请稍后再试。');
  await db.prepare('DELETE FROM letter_rate_limits WHERE expires_at < ?').bind(Date.now()).run();
}
function publicLetter(row: LetterRow) { return { id: row.id, card: JSON.parse(row.card) as Card, ...(row.logo ? { logo: row.logo } : {}), createdAt: row.created_at }; }
async function getLetter(db: Database, id: string): Promise<LetterRow> {
  const row = await db.prepare('SELECT id, card, logo, owner_hash, content_hash, created_at FROM letters WHERE id = ?').bind(id).first<LetterRow>();
  return row || fail(404, 'not_found', '这封信不存在，或已被寄件人收回。');
}
async function authorize(request: Request, row: LetterRow) {
  const bearer = /^Bearer ([A-Za-z0-9_-]{43,128})$/.exec(request.headers.get('Authorization') || '');
  if (!bearer || await hash(bearer[1]) !== row.owner_hash) fail(403, 'private_inbox', '这是寄件人的私密收件箱，请使用完整的收件箱链接。');
}
export async function onRequest(context: Context): Promise<Response> {
  try {
    const { request, env } = context;
    const path = new URL(request.url).pathname;
    const createRoute = path === '/api/letters';
    const match = /^\/api\/letters\/([A-Za-z0-9_-]{32})(?:\/(replies|inbox))?$/.exec(path);
    if (!createRoute && !match) return json({ error: '接口不存在。', code: 'not_found' }, 404);
    if (!env.LETTERS_DB) return json({ error: '云端邮局尚未配置完成，请稍后再试。你的本地明信片仍然保留。', code: 'database_unavailable' }, 503);
    const db = env.LETTERS_DB;
    if (request.method !== 'GET') checkOrigin(request);
    if (createRoute) {
      if (request.method !== 'POST') return json({ error: '不支持此操作。', code: 'method_not_allowed' }, 405);
      const body = await readBody(request);
      const card = cardValue(body.card); const logo = logoValue(body.logo, card);
      const ownerHash = await hash(ownerSecret(body.ownerSecret)); const requestId = uuid(body.requestId);
      const contentHash = await hash(JSON.stringify({ card, logo }));
      const existing = await db.prepare('SELECT id, created_at, content_hash FROM letters WHERE owner_hash = ? AND request_id = ?').bind(ownerHash, requestId).first<LetterRow>();
      if (existing) {
        if (existing.content_hash !== contentHash) fail(409, 'request_conflict', '这次寄信已保存，请重新发起新的寄信。');
        return json({ id: existing.id, createdAt: existing.created_at });
      }
      await limit(db, request, 'create-hour', 20); await limit(db, request, 'create-day', 120, 86400000);
      const id = token(); const createdAt = new Date().toISOString();
      await db.prepare('INSERT INTO letters (id, owner_hash, request_id, content_hash, card, logo, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(owner_hash, request_id) DO NOTHING').bind(id, ownerHash, requestId, contentHash, JSON.stringify(card), logo, createdAt).run();
      const saved = await db.prepare('SELECT id, created_at, content_hash FROM letters WHERE owner_hash = ? AND request_id = ?').bind(ownerHash, requestId).first<LetterRow>();
      if (!saved || saved.content_hash !== contentHash) return fail(409, 'request_conflict', '寄信请求已发生变化，请重新寄信。');
      return json({ id: saved.id, createdAt: saved.created_at }, saved.id === id ? 201 : 200);
    }
    const [, id, operation] = match!;
    const row = await getLetter(db, id);
    if (!operation && request.method === 'GET') return json(publicLetter(row));
    if (operation === 'inbox') {
      await authorize(request, row);
      if (request.method === 'GET') {
        const result = await db.prepare('SELECT id, name, message, created_at FROM letter_replies WHERE letter_id = ? ORDER BY created_at ASC, id ASC').bind(id).all<ReplyRow>();
        return json({ letter: publicLetter(row), replies: result.results.map(reply => ({ id: reply.id, name: reply.name, message: reply.message, createdAt: reply.created_at })) });
      }
      if (request.method === 'DELETE') {
        await db.batch([db.prepare('DELETE FROM letter_replies WHERE letter_id = ?').bind(id), db.prepare('DELETE FROM letters WHERE id = ? AND owner_hash = ?').bind(id, row.owner_hash)]);
        return json({ deleted: true });
      }
    }
    if (operation === 'replies' && request.method === 'POST') {
      const body = await readBody(request);
      const name = field(body.name, 20) || '赏月人'; const message = field(body.message, 500, true, true); const requestId = uuid(body.requestId);
      const existing = await db.prepare('SELECT id, name, message, created_at FROM letter_replies WHERE letter_id = ? AND request_id = ?').bind(id, requestId).first<ReplyRow>();
      if (existing) {
        if (existing.name !== name || existing.message !== message) fail(409, 'request_conflict', '这封回信已经送达，请勿修改后重复提交。');
        return json({ id: existing.id, createdAt: existing.created_at });
      }
      await limit(db, request, 'reply-hour', 40); await limit(db, request, 'reply-day', 150, 86400000);
      const replyId = token(); const createdAt = new Date().toISOString();
      // A single INSERT SELECT enforces the per-letter cap even with concurrent sends.
      await db.prepare('INSERT INTO letter_replies (id, letter_id, request_id, name, message, created_at) SELECT ?, ?, ?, ?, ?, ? WHERE EXISTS (SELECT 1 FROM letters WHERE id = ?) AND (SELECT COUNT(*) FROM letter_replies WHERE letter_id = ?) < 30 ON CONFLICT(letter_id, request_id) DO NOTHING').bind(replyId, id, requestId, name, message, createdAt, id, id).run();
      const saved = await db.prepare('SELECT id, name, message, created_at FROM letter_replies WHERE letter_id = ? AND request_id = ?').bind(id, requestId).first<ReplyRow>();
      if (!saved) return fail(409, 'reply_limit', '这封信的回信箱已满，或信件已被收回。');
      if (saved.name !== name || saved.message !== message) fail(409, 'request_conflict', '回信请求已发生变化，请重新提交。');
      return json({ id: saved.id, createdAt: saved.created_at }, saved.id === replyId ? 201 : 200);
    }
    return json({ error: '不支持此操作。', code: 'method_not_allowed' }, 405);
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message, code: error.code }, error.status);
    // Do not log request bodies, recipient URLs, authorization tokens or SQL contents.
    console.error('Moonpost letters: storage operation failed');
    return json({ error: '月球邮局暂时无法连接，请稍后重试。', code: 'storage_error' }, 503);
  }
}
