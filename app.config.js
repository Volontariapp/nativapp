const fs = require('fs');
const path = require('path');

let apiGatewayUrl = process.env.API_GATEWAY_URL;
let cfId = process.env.CF_ACCESS_CLIENT_ID;
let cfSecret = process.env.CF_ACCESS_CLIENT_SECRET;
// Identifiants RUM Datadog : publics (embarques dans l'appli), differents de la cle d'API.
let ddApplicationId = process.env.DD_RUM_APPLICATION_ID;
let ddClientToken = process.env.DD_RUM_CLIENT_TOKEN;

if (process.env.APP_ENV === 'production') {
  try {
    const envPath = path.resolve(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      if (line.startsWith('API_GATEWAY_URL='))
        apiGatewayUrl = line.substring(line.indexOf('=') + 1).trim();
      if (line.startsWith('CF_ACCESS_CLIENT_ID='))
        cfId = line.substring(line.indexOf('=') + 1).trim();
      if (line.startsWith('CF_ACCESS_CLIENT_SECRET='))
        cfSecret = line.substring(line.indexOf('=') + 1).trim();
      if (line.startsWith('DD_RUM_APPLICATION_ID='))
        ddApplicationId = line.substring(line.indexOf('=') + 1).trim();
      if (line.startsWith('DD_RUM_CLIENT_TOKEN='))
        ddClientToken = line.substring(line.indexOf('=') + 1).trim();
    });
  } catch (e) {
    console.warn('[app.config.js] Failed to read .env file', e);
  }
}

process.env.EXPO_PUBLIC_APP_ENV = process.env.APP_ENV || process.env.NODE_ENV || 'development';
process.env.EXPO_PUBLIC_API_GATEWAY_URL = apiGatewayUrl;

module.exports = ({ config }) => {
  return {
    ...config,
    ios: {
      ...(config.ios || {}),
      bundleIdentifier: 'com.volontariapp.mobile',
      appleTeamId: 'QTLG22TJ29',
    },
    extra: {
      APP_ENV: process.env.APP_ENV || process.env.NODE_ENV || 'development',
      API_GATEWAY_URL: apiGatewayUrl,
      CF_ACCESS_CLIENT_ID: cfId,
      CF_ACCESS_CLIENT_SECRET: cfSecret,
      DD_RUM_APPLICATION_ID: ddApplicationId,
      DD_RUM_CLIENT_TOKEN: ddClientToken,
    },
    plugins: [
      ...(config.plugins || []),
      '@react-native-community/datetimepicker',
      // Envoie les symboles et source maps a Datadog a chaque build : sans la cle d'API (secret EAS
      // DATADOG_API_KEY), le plugin n'est pas ajoute, le build reste identique a avant.
      ...(process.env.DATADOG_API_KEY ? ['expo-datadog'] : []),
    ],
  };
};
