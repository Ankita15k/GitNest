import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig.js';
import { getToken } from '../utils/getToken.js';

const userApi = axios.create({ baseURL: `${API_BASE_URL}/users` });

userApi.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const fetchUserProfile = async (username) => {
  const { data } = await userApi.get(`/${username}`);
  return data.data;

};

export const followUser = async (username) => {
  const { data } = await userApi.post(`/${username}/follow`);
  return data;
};

export const unfollowUser = async (username) => {
  const { data } = await userApi.delete(`/${username}/follow`);
  return data;
};
