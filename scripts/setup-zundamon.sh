#!/bin/bash
set -euo pipefail

echo "============================================"
echo "  ずんだもん立ち絵素材セットアップ"
echo "============================================"
echo ""

ASSETS_DIR="assets"
PARTS_DIR="public/parts/zundamon"

# PSDファイルを探す
PSD_FILE=""
for f in "$ASSETS_DIR"/*.psd "$ASSETS_DIR"/**/*.psd; do
    if [ -f "$f" ]; then
        PSD_FILE="$f"
        break
    fi
done

if [ -z "$PSD_FILE" ]; then
    echo "PSDファイルが見つかりません。"
    echo ""
    echo "以下の手順でダウンロードしてください:"
    echo ""
    echo "1. ブラウザで以下を開く:"
    echo "   https://ux.getuploader.com/s_ahiru/download/59"
    echo ""
    echo "2. パスワード: zunda"
    echo ""
    echo "3. ZIPをダウンロードして展開"
    echo ""
    echo "4. PSDファイルを assets/ に配置"
    echo "   例: assets/ずんだもん立ち絵素材2.3.psd"
    echo ""
    echo "5. 再度このスクリプトを実行"
    exit 1
fi

echo "PSDファイルを検出: $PSD_FILE"
echo ""

# 出力ディレクトリを作成
mkdir -p "$PARTS_DIR"

echo "パーツを抽出中..."
python3 scripts/extract-psd-parts.py "$PSD_FILE" "$PARTS_DIR"

echo ""
echo "============================================"
echo "  セットアップ完了！"
echo "============================================"
echo ""
echo "パーツ出力先: $PARTS_DIR"
echo ""
echo "構造を確認: cat $PARTS_DIR/structure.json"
