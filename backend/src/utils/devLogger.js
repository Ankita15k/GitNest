/**
 * Development-only logger. No output in production.
 */
export const devLog = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};
