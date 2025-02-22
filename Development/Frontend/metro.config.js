const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for engine.io-client module resolution
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    "engine.io-client": require.resolve("engine.io-client"),
  },
  sourceExts: ["js", "jsx", "ts", "tsx", "json"], // Ensure TS & JS files are resolved
};

module.exports = withNativeWind(config, { input: "./global.css" });
