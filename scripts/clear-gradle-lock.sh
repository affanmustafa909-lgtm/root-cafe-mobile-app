#!/bin/bash
set -euo pipefail
pkill -f GradleWrapperMain 2>/dev/null || true
pkill -f 'gradle-9.3.1' 2>/dev/null || true
rm -rf "$HOME/.gradle/wrapper/dists/gradle-9.3.1-bin"
echo "Cleared stuck gradle-9.3.1 dist."
