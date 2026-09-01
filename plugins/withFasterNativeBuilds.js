const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

function setProperty(gradleProperties, key, value) {
  const index = gradleProperties.findIndex(
    (item) => item.type === 'property' && item.key === key,
  );
  if (index >= 0) {
    gradleProperties[index].value = value;
  } else {
    gradleProperties.push({ type: 'property', key, value });
  }
}

function withAbiFilters(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.contents.includes('abiFilters')) {
      return config;
    }
    config.modResults.contents = config.modResults.contents.replace(
      /buildConfigField "String", "REACT_NATIVE_RELEASE_LEVEL".*/,
      (match) =>
        `${match}\n\n        ndk {\n            abiFilters(*((findProperty("reactNativeArchitectures") ?: "x86_64").toString().split(",")))\n        }`,
    );
    return config;
  });
}

/** Speeds local native builds: host ABI only, Gradle cache, more JVM RAM. */
function withFasterNativeBuilds(config) {
  config = withAbiFilters(config);
  return withGradleProperties(config, (config) => {
    const isEas =
      process.env.EAS_BUILD === 'true' || process.env.EAS_BUILD === '1';
    const localAbi = process.arch === 'arm64' ? 'arm64-v8a' : 'x86_64';

    setProperty(
      config.modResults,
      'reactNativeArchitectures',
      isEas ? 'arm64-v8a' : localAbi,
    );
    setProperty(config.modResults, 'org.gradle.caching', 'true');
    setProperty(config.modResults, 'org.gradle.parallel', 'true');
    setProperty(
      config.modResults,
      'org.gradle.jvmargs',
      '-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8',
    );
    return config;
  });
}

module.exports = withFasterNativeBuilds;
