export const devLog = (...args) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};

export default devLog;
