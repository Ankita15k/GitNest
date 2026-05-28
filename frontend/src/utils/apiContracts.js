export const unwrapApiData = (response) => response.data.data;

export const getApiUserName = (user) => {
  if (!user) return 'unknown';
  if (typeof user === 'string') return user;
  return user.username || user.email || 'unknown';
};

export const getApiUserAvatar = (user) => getApiUserName(user).charAt(0).toUpperCase();
