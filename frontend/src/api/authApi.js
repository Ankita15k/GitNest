import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig.js';
import { getToken } from '../utils/getToken.js';

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Attach JWT token from auth store to every request
 */
authApi.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle standardized error responses
 */
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response
      ? error.response.data?.message || error.response.data?.error || `Request failed with status ${error.response.status}`
      : error?.request
        ? 'No response received from the server. Please check your connection and try again.'
        : error?.message || 'An unexpected error occurred while making the request.';

    const normalizedError = new Error(message);
    normalizedError.cause = error;
    normalizedError.config = error?.config;
    normalizedError.request = error?.request;
    normalizedError.response = error?.response;

    return Promise.reject(normalizedError);
  }
);

/**
 * Register a new user
 * @param {Object} userData - { username, email, password }
 * @returns {Object} API response with user data and token
 */
export const registerUser = async (userData) => {
  const response = await authApi.post('/auth/register', userData);
  return response.data;
};

/**
 * Login user
 * @param {Object} userData - { email, password }
 * @returns {Object} API response with user data and token
 */
export const loginUser = async (userData) => {
  const response = await authApi.post('/auth/login', userData);
  return response.data;
};

/**
 * Get current authenticated user
 * @returns {Object} API response with user data
 */
export const getMe = async () => {
  const response = await authApi.get('/auth/me');
  return response.data;
};

/**
 * Update user profile
 * @param {Object} profileData - Profile fields to update
 * @returns {Object} API response with updated user data
 */
export const updateUserProfile = async (profileData) => {
  const response = await authApi.put('/users/profile', profileData);
  return response.data;
};

export default authApi;

