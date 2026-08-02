#!/bin/bash
set -euo pipefail

# 指定したYAMLから動画を生成・レンダリングするスクリプト
# 使い方:
#   ./scripts/render-video.sh scenes/demo.yaml           # 音声生成 + レンダリング
#   ./scripts/render-video.sh scenes/demo.yaml --skip-generate  # レンダリングのみ

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ $# -lt 1 ]; then
    echo "Usage: $0 <scenes.yaml> [--skip-generate] [remotion options...]"
    echo ""
    echo "Examples:"
    echo "  $0 scenes/demo.yaml                    # 音声生成 + レンダリング"
    echo "  $0 scenes/demo.yaml --skip-generate    # レンダリングのみ"
    echo ""
    echo "Available videos:"
    for f in scenes/*.yaml; do
        if [ -f "$f" ]; then
            basename "$f" .yaml
        fi
    done
    exit 1
fi

YAML_FILE="$1"
shift

SKIP_GENERATE=false
REMOTION_ARGS=()

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        --skip-generate)
            SKIP_GENERATE=true
            shift
            ;;
        *)
            REMOTION_ARGS+=("$1")
            shift
            ;;
    esac
done

if [ ! -f "$YAML_FILE" ]; then
    echo "ERROR: File not found: $YAML_FILE"
    exit 1
fi

VIDEO_ID=$(basename "$YAML_FILE" .yaml)
OUTPUT_FILE="output/${VIDEO_ID}.mp4"

cd "$PROJECT_DIR"

# Step 1: Generate audio + lipsync (if not skipped)
if [ "$SKIP_GENERATE" = false ]; then
    echo "==> Step 1: Generating audio and lipsync data..."
    "$SCRIPT_DIR/generate-from-scenes.sh" "$YAML_FILE"
else
    echo "==> Step 1: Skipped (--skip-generate)"
fi

# Step 2: Render video
echo ""
echo "==> Step 2: Rendering video..."
mkdir -p output

if [ ${#REMOTION_ARGS[@]} -eq 0 ]; then
    npx remotion render "$VIDEO_ID" "$OUTPUT_FILE"
else
    npx remotion render "$VIDEO_ID" "$OUTPUT_FILE" "${REMOTION_ARGS[@]}"
fi

echo ""
echo "==> Done!"
echo "    Output: $OUTPUT_FILE"
