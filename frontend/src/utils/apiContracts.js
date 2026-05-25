export const unwrapApiData = (response) => response.data.data;

export const normalizeApiList = (payload, key) => ({
  items: payload?.data?.[key] ?? [],
  pagination: payload?.data?.pagination ?? null,
  counts: payload?.data?.counts ?? null,
  requestId: payload?.requestId ?? null,
});

export const getApiUserName = (user) => {
  if (!user) return 'unknown';
  if (typeof user === 'string') return user;
  return user.username || user.email || 'unknown';
};

export const getApiUserAvatar = (user) => {
  const username = getApiUserName(user);
  return username.charAt(0).toUpperCase();
};
