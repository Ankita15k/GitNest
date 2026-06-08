const DEFAULT_API_BASE_URL = 'http://localhost:5000';

const rawUrl = import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL;
export const API_BASE_URL = rawUrl
  .replace(/\/+$/, '')
  .replace(/\/api\/v1$/, '')
  .replace(/\/api$/, '');
