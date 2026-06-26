import fs from 'fs';
import path from 'path';

const DLQ_DIR = path.join(process.cwd(), 'logs', 'audit-dlq');

function ensureDlqDir() {
  if (!fs.existsSync(DLQ_DIR)) {
    fs.mkdirSync(DLQ_DIR, { recursive: true });
  }
}

export async function appendToDeadLetterQueue(eventType, data) {
  try {
    ensureDlqDir();
    const dateStr = new Date().toISOString().split('T')[0];
    const filePath = path.join(DLQ_DIR, `${dateStr}.ndjson`);
    const entry = JSON.stringify({ eventType, data, timestamp: new Date().toISOString() }) + '\n';
    await fs.promises.appendFile(filePath, entry);
  } catch (err) {
    // Silently fail — dead-letter queue should never throw
  }
}
