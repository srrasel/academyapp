const appJson = require('./app.json');

// Load local .env for EAS / expo config (EXPO_PUBLIC_* vars)
try {
  require('dotenv').config();
} catch {
  // dotenv optional
}

const facebookAppId = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '';
const facebookClientToken = process.env.EXPO_PUBLIC_FACEBOOK_CLIENT_TOKEN || '';
const baseSchemes = Array.isArray(appJson.expo.scheme)
  ? [...appJson.expo.scheme]
  : [appJson.expo.scheme].filter(Boolean);

const fbScheme = facebookAppId ? `fb${facebookAppId}` : '';
if (fbScheme && !baseSchemes.includes(fbScheme)) {
  baseSchemes.push(fbScheme);
}

const plugins = [...(appJson.expo.plugins || [])];

plugins.push('@react-native-google-signin/google-signin');

if (facebookAppId) {
  const fbPlugin = [
    'react-native-fbsdk-next',
    {
      appID: facebookAppId,
      displayName: 'Bridge Academy',
      scheme: fbScheme,
      isAutoInitEnabled: true,
      autoLogAppEventsEnabled: false,
      advertiserIDCollectionEnabled: false,
      ...(facebookClientToken ? { clientToken: facebookClientToken } : {}),
    },
  ];
  plugins.push(fbPlugin);
}

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  owner: 'srrasel',
  scheme: baseSchemes,
  plugins,
  extra: {
    ...(appJson.expo.extra ?? {}),
    eas: {
      projectId: 'fb91cb57-7cda-4ed3-a733-898131307818',
    },
    facebookAppId: facebookAppId || undefined,
  },
  android: {
    ...appJson.expo.android,
    versionCode: 15,
    googleServicesFile: './google-services.json',
    softwareKeyboardLayoutMode: 'resize',
  },
};
