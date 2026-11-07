#!/bin/bash
set -euo pipefail

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export ANDROID_AVD_HOME="$(cd "$(dirname "$0")/.." && pwd)/.android-avd"
export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"

cd "$(dirname "$0")/.."
APP_DIR="$(pwd)"

mkdir -p "$ANDROID_AVD_HOME"

if ! emulator -list-avds 2>/dev/null | grep -qx "roots_cafe_avd"; then
  echo "Creating AVD roots_cafe_avd..."
  echo no | avdmanager create avd -n roots_cafe_avd -k "system-images;android-34;google_apis;x86_64" -d pixel_6 --force
fi

# Prefer the project AVD; fall back to any existing AVD
AVD="roots_cafe_avd"
if ! emulator -list-avds 2>/dev/null | grep -qx "$AVD"; then
  AVD="$(emulator -list-avds 2>/dev/null | head -1)"
fi
if [ -z "${AVD:-}" ]; then
  echo "No Android Virtual Device found. Create one in Android Studio first."
  exit 1
fi

echo "Using AVD: $AVD"

# If no device is online, start emulator
if ! adb devices | grep -E $'\tdevice$' >/dev/null; then
  echo "Starting emulator..."
  # Clear stale locks for the project AVD / common system AVD
  rm -f "$ANDROID_AVD_HOME/${AVD}.avd"/*.lock "$ANDROID_AVD_HOME/${AVD}.avd/read-snapshot.txt" 2>/dev/null || true
  rm -f "$HOME/.android/avd/${AVD}.avd/multiinstance.lock" "$HOME/.android/avd/${AVD}.avd/read-snapshot.txt" 2>/dev/null || true

  emulator -avd "$AVD" -no-snapshot -gpu auto -no-boot-anim >/tmp/android-emulator.log 2>&1 &
  echo "Waiting for emulator to boot (log: /tmp/android-emulator.log)..."
  adb wait-for-device
  for i in $(seq 1 90); do
    boot="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)"
    if [ "$boot" = "1" ]; then
      echo "Emulator ready."
      break
    fi
    sleep 2
  done
  if [ "${boot:-}" != "1" ]; then
    echo "Emulator did not finish booting in time. Last log lines:"
    tail -40 /tmp/android-emulator.log || true
    exit 1
  fi
fi

adb devices -l

echo "Building & installing Roots Café on Android (first run may take several minutes)..."
cd "$APP_DIR"
npm run android
