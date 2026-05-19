export const getToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storedValue = localStorage.getItem('auth-storage');

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);
    return parsedValue?.state?.token ?? null;
  } catch {
    return null;
  }
};
