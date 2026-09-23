import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

export function snapshotFixture(output, sources) {
  const directory = path.join(output, 'fixture-sources');
  fs.mkdirSync(directory, { recursive: true });
  const hashes = {};
  for (const source of [...sources, new URL(import.meta.url)]) {
    const name = path.basename(fileURLToPath(source));
    if (Object.hasOwn(hashes, name)) throw new Error(`Duplicate fixture source name: ${name}`);
    const bytes = fs.readFileSync(source);
    fs.writeFileSync(path.join(directory, name), bytes);
    hashes[name] = createHash('sha256').update(bytes).digest('hex');
  }
  fs.writeFileSync(path.join(output, 'fixture-hashes.json'), JSON.stringify(hashes, null, 2));
}
