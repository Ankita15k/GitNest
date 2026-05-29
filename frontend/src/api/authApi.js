import { createApiClient } from "./createApiClient.js";

const authApi = createApiClient("/auth");

export const registerUser = async (userData) => {
  const response = await authApi.post("/register", userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await authApi.post("/login", userData);
  return response.data;
};

export const getMe = async () => {
  const response = await authApi.get("/me");
  return response.data.data;
};

export const updateUserProfile = async (profileData) => {
  const response = await authApi.put("/profile", profileData);
  return response.data.data;
};

export default authApi;
