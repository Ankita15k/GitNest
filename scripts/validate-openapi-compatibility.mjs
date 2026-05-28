import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import swaggerSpec from '../backend/src/config/swagger.js';

const snapshotPath = resolve(process.cwd(), process.argv[2] || 'backend/src/docs/openapi.snapshot.json');

const fail = (message) => {
  console.error(message);
  process.exitCode = 1;
};

if (!existsSync(snapshotPath)) {
  fail(`OpenAPI snapshot missing at ${snapshotPath}. Run npm run contracts:snapshot from backend.`);
} else {
  const snapshot = JSON.parse(await readFile(snapshotPath, 'utf8'));
  for (const [path, methods] of Object.entries(snapshot.paths || {})) {
    if (!swaggerSpec.paths?.[path]) {
      fail(`Breaking API change: removed path ${path}`);
      continue;
    }
    for (const method of Object.keys(methods)) {
      if (!swaggerSpec.paths[path][method]) fail(`Breaking API change: removed operation ${method.toUpperCase()} ${path}`);
    }
  }
  for (const schemaName of Object.keys(snapshot.components?.schemas || {})) {
    if (!swaggerSpec.components?.schemas?.[schemaName]) fail(`Breaking API change: removed component schema ${schemaName}`);
  }
  if (!process.exitCode) console.log('OpenAPI compatibility validation passed.');
}
