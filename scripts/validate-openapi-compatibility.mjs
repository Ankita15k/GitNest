import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
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
  const currentPaths = swaggerSpec.paths || {};
  const snapshotPaths = snapshot.paths || {};

  for (const [path, methods] of Object.entries(snapshotPaths)) {
    if (!currentPaths[path]) {
      fail(`Breaking API change: removed path ${path}`);
      continue;
    }

    for (const method of Object.keys(methods)) {
      if (!currentPaths[path][method]) {
        fail(`Breaking API change: removed operation ${method.toUpperCase()} ${path}`);
      }
    }
  }

  const snapshotSchemas = snapshot.components?.schemas || {};
  const currentSchemas = swaggerSpec.components?.schemas || {};

  for (const schemaName of Object.keys(snapshotSchemas)) {
    if (!currentSchemas[schemaName]) {
      fail(`Breaking API change: removed component schema ${schemaName}`);
    }
  }

  if (!process.exitCode) {
    console.log('OpenAPI compatibility validation passed.');
  }
}
