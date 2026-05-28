import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import swaggerSpec from '../backend/src/config/swagger.js';

const outputPath = resolve(process.cwd(), process.argv[2] || 'frontend/src/types/api-contracts.d.ts');
const schemaNames = Object.keys(swaggerSpec.components?.schemas || {}).sort();

const content = `// Generated from backend OpenAPI components.
export type ApiSuccess<T> = { success: true; status?: 'success'; message: string; data: T; requestId: string | null };
export type ApiError = { success: false; status?: 'fail' | 'error'; statusCode?: number; code: string; message: string; errors: Array<{ field?: string; message: string }>; requestId: string | null; timestamp?: string };
export type Pagination = { page: number; limit: number; totalCount?: number; totalItems?: number; totalPages: number; hasNextPage?: boolean; hasPrevPage?: boolean };
export type UserContract = { _id: string; id?: string; username: string; email?: string; avatarUrl?: string; bio?: string };
export type PullRequestCommentContract = { _id: string; author: UserContract | string; body: string; type: 'general' | 'review'; createdAt: string; updatedAt?: string };
export type PullRequestContract = { _id: string; id: string; number: number; title: string; description: string; status: 'open' | 'closed' | 'merged'; author: UserContract | string; repository: unknown; sourceBranch: string; targetBranch: string; fromBranch: string; toBranch: string; comments: PullRequestCommentContract[] | number; reviews: Array<{ author: UserContract | string; status: 'approved' | 'changes_requested' | 'commented'; comment?: string }>; diff: Array<{ file: string; chunks: Array<{ type: 'context' | 'added' | 'removed'; line: number; content: string }> }>; createdAt: string; updatedAt?: string };
export type OpenApiComponentName = ${schemaNames.map((name) => `'${name}'`).join(' | ')};
`;

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, content);
console.log(`Frontend API types generated to ${outputPath}`);
