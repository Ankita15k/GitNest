import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig.js';
import { getToken } from '../utils/getToken.js';
import { normalizeApiError } from '../utils/normalizeApiError.js';
import { devLog } from '../utils/devLogger.js';

/**
 * Creates an axios client with auth headers and normalized error responses.
 */
export const createApiClient = (path ='') => {
  const client = axios.create({
    baseURL:`${API_BASE_URL}/api/v1${path}`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client.interceptors.request.use(
    (config) => {
      const token = getToken();

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(normalizeApiError(error))
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const normalized = normalizeApiError(error);

      if (import.meta.env.DEV && normalized.requestId) {
        devLog('[api-error]', normalized.requestId, normalized.code, normalized.message);
      }

      return Promise.reject(normalized);
    }
  );

  return client;
};

export default createApiClient;
