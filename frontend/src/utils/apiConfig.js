const DEFAULT_API_BASE_URL = 'http://localhost:5000/api/v1';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
