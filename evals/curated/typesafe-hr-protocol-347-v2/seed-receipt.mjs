import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
if (Date.now() !== Date.parse('2026-09-17T12:00:00.000Z')) throw Error('Use --require ./fixed-date.cjs');
const { createSeed } = await import(pathToFileURL(resolve(process.argv[2], 'server/seed.js')));
console.log(JSON.stringify({ product_date: new Date().toISOString(), seed_sha256: createHash('sha256').update(JSON.stringify(createSeed())).digest('hex') }, null, 2));
