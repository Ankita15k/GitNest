import { createApiClient } from './createApiClient.js';

const userApi = createApiClient('/users');

export const fetchUserProfile = async (username) => {
  const { data } = await userApi.get(`/${username}`);
  
  // Safely extract the profile data no matter how the backend nests it!
  const profileData = data?.data?.user || data?.user || data?.data || data;
  
  if (!profileData) {
    throw new Error('Profile data could not be extracted from the response.');
  }
  
  return profileData;
};

export const followUser = async (username) => {
  const { data } = await userApi.post(`/${username}/follow`);
  return data?.data || data;
};

export const unfollowUser = async (username) => {
  const { data } = await userApi.delete(`/${username}/follow`);
  return data?.data || data;
};

export default userApi;