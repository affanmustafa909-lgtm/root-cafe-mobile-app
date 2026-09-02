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
    // Always prefer phone + emulator ABIs for installable APKs.
    const fallback =
      'armeabi-v7a,arm64-v8a,x86_64';
    if (config.modResults.contents.includes('abiFilters')) {
      config.modResults.contents = config.modResults.contents.replace(
        /abiFilters\(\*\(\(findProperty\("reactNativeArchitectures"\) \?: "[^"]*"\)\.toString\(\)\.split\(","\)\)\)/,
        `abiFilters(*((findProperty("reactNativeArchitectures") ?: "${fallback}").toString().split(",")))`,
      );
      return config;
    }
    config.modResults.contents = config.modResults.contents.replace(
      /buildConfigField "String", "REACT_NATIVE_RELEASE_LEVEL".*/,
      (match) =>
        `${match}\n\n        ndk {\n            abiFilters(*((findProperty("reactNativeArchitectures") ?: "${fallback}").toString().split(",")))\n        }`,
    );
    return config;
  });
}

/**
 * Native build helpers.
 * Default ABIs include real phones (armeabi-v7a + arm64-v8a).
 * Set FAST_NATIVE_BUILD=1 for host-only emulator builds.
 */
function withFasterNativeBuilds(config) {
  config = withAbiFilters(config);
  return withGradleProperties(config, (config) => {
    const isEas =
      process.env.EAS_BUILD === 'true' || process.env.EAS_BUILD === '1';
    const fastLocal =
      process.env.FAST_NATIVE_BUILD === '1' ||
      process.env.FAST_NATIVE_BUILD === 'true';
    const localAbi = process.arch === 'arm64' ? 'arm64-v8a' : 'x86_64';
    const phoneAbis = 'armeabi-v7a,arm64-v8a,x86_64';

    setProperty(
      config.modResults,
      'reactNativeArchitectures',
      fastLocal && !isEas ? localAbi : phoneAbis,
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
