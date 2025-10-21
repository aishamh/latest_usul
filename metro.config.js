const { getDefaultConfig } = require('expo/metro-config');

// Use Expo's default Metro configuration without overrides
const config = getDefaultConfig(__dirname);

module.exports = config;
