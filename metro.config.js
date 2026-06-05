const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Custom resolver configuration
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix for class-validator "Cannot set property default of [object Object] which has only a getter"
  // Enforces Metro to resolve the CommonJS version of class-validator instead of the ESM one
  // that contains incompatible `import * as validator from 'validator'` for Metro Web.
  if (moduleName === 'class-validator') {
    return {
      filePath: require.resolve('class-validator/cjs/index.js', { paths: [__dirname] }),
      type: 'sourceFile',
    };
  }

  // Fix for react-native-calendars "Unable to resolve ./timeline/Timeline"
  // Forces Metro to use the .js entry point which resolves correctly and avoids
  // internal library resolution issues between TS and JS files.
  if (moduleName === 'react-native-calendars') {
    return {
      filePath: require.resolve('react-native-calendars/src/index.js', { paths: [__dirname] }),
      type: 'sourceFile',
    };
  }

  // Fall back to default resolver
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
