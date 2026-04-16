const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix for class-validator "Cannot set property default of [object Object] which has only a getter"
// Enforces Metro to resolve the CommonJS version of class-validator instead of the ESM one
// that contains incompatible `import * as validator from 'validator'` for Metro Web.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'class-validator') {
    return {
      filePath: require.resolve('class-validator/cjs/index.js', { paths: [__dirname] }),
      type: 'sourceFile',
    };
  }
  // Fall back to default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
