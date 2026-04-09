export default ({ config }) => {
  return {
    ...config,
    extra: {
      APP_ENV: process.env.NODE_ENV,
    },
  };
};
