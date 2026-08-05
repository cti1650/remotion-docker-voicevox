#!/bin/bash
set -euo pipefail

# シーンYAMLのthumbnail:からサムネイル画像を書き出す
# 使い方:
#   ./scripts/render-thumbnail.sh scenes/demo.yaml
#   ./scripts/render-thumbnail.sh scenes/demo.yaml output/custom.png

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ $# -lt 1 ]; then
    echo "Usage: $0 <scenes.yaml> [output.png]"
    echo ""
    echo "Available videos:"
    for f in scenes/*.yaml; do
        [ -f "$f" ] && basename "$f" .yaml
    done
    exit 1
fi

YAML_FILE="$1"
if [ ! -f "$YAML_FILE" ]; then
    echo "ERROR: File not found: $YAML_FILE"
    exit 1
fi

cd "$PROJECT_DIR"

VIDEO_ID=$(basename "$YAML_FILE" .yaml)
OUTPUT_FILE="${2:-output/${VIDEO_ID}-thumbnail.png}"
GENERATED_JSON="src/generated/${VIDEO_ID}.json"

if [ ! -f "$GENERATED_JSON" ]; then
    echo "ERROR: 先に音声を生成してください: npm run voice -- $YAML_FILE"
    exit 1
fi

# thumbnail:が書かれていないYAMLはコンポジションが存在しない
if ! grep -q '"thumbnail"' "$GENERATED_JSON"; then
    echo "ERROR: $YAML_FILE に thumbnail: が書かれていません"
    echo "  例:"
    echo "    thumbnail:"
    echo "      title: \"タイトル\""
    echo "      subtitle: \"サブタイトル\""
    exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

echo "==> Rendering thumbnail..."
npx remotion still "${VIDEO_ID}-thumbnail" "$OUTPUT_FILE"

echo ""
echo "==> Done!"
echo "    Output: $OUTPUT_FILE"
