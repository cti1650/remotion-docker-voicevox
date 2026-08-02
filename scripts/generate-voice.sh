#!/bin/bash
set -euo pipefail

TEXT="${1:-こんにちは}"
SPEAKER_ID="${2:-3}"
OUTPUT="${3:-output.wav}"
ENGINE_URL="${VOICEVOX_ENGINE_URL:-http://127.0.0.1:50021}"

echo "==> Generating voice..."
echo "    Text: ${TEXT}"
echo "    Speaker ID: ${SPEAKER_ID}"
echo "    Output: ${OUTPUT}"

# Check if VOICEVOX Engine is running
if ! curl -fs "${ENGINE_URL}/version" >/dev/null 2>&1; then
    echo "ERROR: VOICEVOX Engine is not running at ${ENGINE_URL}"
    echo "Please start VOICEVOX Engine first:"
    echo "  docker compose up voicevox"
    exit 1
fi

# Generate audio query
QUERY=$(curl -s -X POST \
    "${ENGINE_URL}/audio_query?text=$(echo -n "$TEXT" | jq -sRr @uri)&speaker=${SPEAKER_ID}" \
    -H "accept: application/json")

# Synthesize audio
curl -s -X POST \
    "${ENGINE_URL}/synthesis?speaker=${SPEAKER_ID}" \
    -H "accept: audio/wav" \
    -H "Content-Type: application/json" \
    -d "$QUERY" \
    -o "$OUTPUT"

echo "==> Voice generated: ${OUTPUT}"
