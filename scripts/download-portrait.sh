#!/bin/bash
set -euo pipefail

VOICE_NAME="${1:-ずんだもん}"
ENGINE_URL="${VOICEVOX_ENGINE_URL:-http://127.0.0.1:50021}"

echo "==> Downloading portrait for: ${VOICE_NAME}"

# Check if VOICEVOX Engine is running
if ! curl -fs "${ENGINE_URL}/version" >/dev/null 2>&1; then
    echo "ERROR: VOICEVOX Engine is not running at ${ENGINE_URL}"
    echo "Please start VOICEVOX Engine first:"
    echo "  docker compose up voicevox"
    exit 1
fi

# Check if jq is available
if ! command -v jq >/dev/null 2>&1; then
    echo "ERROR: jq is not installed"
    exit 1
fi

mkdir -p assets/portraits

# Get speaker UUID
UUID=$(
    curl -s "${ENGINE_URL}/speakers" |
    jq -r --arg name "$VOICE_NAME" \
        '.[] | select(.name==$name) | .speaker_uuid' |
    head -n1
)

if [ -z "$UUID" ] || [ "$UUID" = "null" ]; then
    echo "ERROR: Speaker '${VOICE_NAME}' not found"
    echo
    echo "Available speakers:"
    curl -s "${ENGINE_URL}/speakers" | jq -r '.[].name'
    exit 1
fi

# Download portrait
curl -s \
    "${ENGINE_URL}/speaker_info?speaker_uuid=${UUID}" |
    jq -r '.portrait' |
    base64 -d \
    > "assets/portraits/${VOICE_NAME}.png"

echo "==> Portrait downloaded: assets/portraits/${VOICE_NAME}.png"
