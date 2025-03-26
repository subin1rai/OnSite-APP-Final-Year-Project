const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    "engine.io-client": require.resolve("engine.io-client"),
  },
  sourceExts: ["js", "jsx", "ts", "tsx", "json"], 
};

module.exports = withNativeWind(config, { input: "./global.css" });
