const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const extraBlockList = [
  // Only the app's own output folder — not node_modules/*/dist
  new RegExp(`${__dirname.replace(/[/\\]/g, '[/\\\\]')}[/\\\\]dist[/\\\\]`),
  /[\\/]android[\\/]app[\\/]build[\\/]/,
  /[\\/]android[\\/]\.gradle[\\/]/,
  /[\\/]android[\\/]\.kotlin[\\/]/,
];

const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  ...extraBlockList,
];

module.exports = config;
