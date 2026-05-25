export default ({ config }) => {
  return {
    ...config,
    extra: {
      APP_ENV: process.env.NODE_ENV,
      API_GATEWAY_URL: process.env.API_GATEWAY_URL,
    },
  };
};
