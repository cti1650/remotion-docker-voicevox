#!/bin/bash
set -euo pipefail

echo "==> ずんだもん立ち絵素材のセットアップ"
echo ""
echo "坂本アヒル氏の立ち絵素材を使用するには、以下の手順で手動ダウンロードが必要です："
echo ""
echo "1. 以下のURLにアクセス:"
echo "   https://seiga.nicovideo.jp/seiga/im10788496"
echo ""
echo "2. 説明欄のダウンロードリンクからPSDファイルをダウンロード"
echo "   パスワード: zunda"
echo ""
echo "3. ダウンロードしたPSDファイルを以下に配置:"
echo "   assets/zundamon.psd"
echo ""
echo "4. パーツを抽出:"
echo "   python3 scripts/extract-psd-parts.py assets/zundamon.psd assets/parts"
echo ""
echo "==> 代替案: PSDToolを使用"
echo ""
echo "ブラウザでPSDファイルを開いてパーツをPNG出力することもできます:"
echo "   https://oov.github.io/psdtool/"
echo ""

# assets/partsディレクトリを作成
mkdir -p assets/parts/zundamon

# PSDファイルが存在するか確認
if [ -f "assets/zundamon.psd" ]; then
    echo "==> PSDファイルを検出しました。パーツを抽出します..."
    python3 scripts/extract-psd-parts.py assets/zundamon.psd assets/parts/zundamon
    echo "==> 抽出完了！"
else
    echo "==> PSDファイルが見つかりません。"
    echo "    assets/zundamon.psd にファイルを配置してください。"
fi
