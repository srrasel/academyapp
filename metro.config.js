const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Resolve @firebase/auth (and peers) to the React Native build so
// getReactNativePersistence + initializeAuth persist sessions on device.
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];
config.resolver.unstable_enablePackageExports = true;

// Large course JSON can OOM jest-worker IPC when many transformers run in parallel.
config.maxWorkers = 1;

module.exports = config;
