import { mkdir, writeFile } from 'node:fs/promises';

const [actor, method, path, capture, body] = process.argv.slice(2);
if (!actor || !method || !path || !capture) throw new Error('usage: actor method path capture [body]');
await mkdir('notes-walk', { recursive: true });
const response = await fetch(`http://127.0.0.1:54824${path}`, {
  method,
  headers: { 'X-Actor': actor, ...(body ? { 'Content-Type': 'application/json' } : {}) },
  body: body || undefined
});
const text = await response.text();
const captureValue = JSON.stringify({ request: { method, url: `http://127.0.0.1:54824${path}`, actor, body: body ? JSON.parse(body) : undefined }, status: response.status, body: JSON.parse(text) }, null, 2);
await writeFile(`notes-walk/${capture}`, `${captureValue}\n`);
process.stdout.write(captureValue);
