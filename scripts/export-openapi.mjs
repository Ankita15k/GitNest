import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import swaggerSpec from '../backend/src/config/swagger.js';

const outputPath = resolve(process.cwd(), process.argv[2] || 'backend/src/docs/openapi.snapshot.json');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(swaggerSpec, null, 2)}\n`);
console.log(`OpenAPI contract exported to ${outputPath}`);
