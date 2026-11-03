module.exports = function (api) {
  // api.env() enregistre NODE_ENV dans la cle de cache, donc pas de api.cache(true) ici
  const isProduction = api.env('production');
  return {
    presets: ['babel-preset-expo'],
    // Retire console.log/info/debug des bundles de production, garde warn et error
    plugins: isProduction ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : [],
    overrides: [
      {
        exclude: /node_modules/,
        plugins: [
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        ],
      },
    ],
  };
};
