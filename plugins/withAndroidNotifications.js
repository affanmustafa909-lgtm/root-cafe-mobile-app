const {
  withAndroidManifest,
  AndroidConfig,
} = require('expo/config-plugins');

/**
 * Ensure notification permissions exist on the release APK (Android 13+).
 */
function withAndroidNotifications(config) {
  return withAndroidManifest(config, (config) => {
    config.modResults = AndroidConfig.Permissions.ensurePermissions(
      config.modResults,
      [
        'android.permission.POST_NOTIFICATIONS',
        'android.permission.RECEIVE_BOOT_COMPLETED',
        'android.permission.VIBRATE',
        'android.permission.WAKE_LOCK',
      ],
    );
    return config;
  });
}

module.exports = withAndroidNotifications;
