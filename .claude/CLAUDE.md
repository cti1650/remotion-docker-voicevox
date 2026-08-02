# CLAUDE.md

Remotion + VOICEVOXでキャラクター動画を作成するプロジェクト。

## クイックスタート

```bash
docker compose up -d voicevox  # VOICEVOX起動
npm run dev                     # 開発サーバー
docker compose --profile render up render  # レンダリング
```

## ディレクトリ

```
src/                    # Remotionソース
public/parts/zundamon_en/  # パーツ画像（英語名）
public/audio/           # 音声(.wav) + リップシンク(.json)
scripts/                # ユーティリティ
config/                 # VOICEVOX辞書
```

## よく使うコマンド

```bash
# 音声+リップシンク生成
./scripts/generate-voice-with-lipsync.sh "テキスト" 3 public/audio/line1

# 辞書登録
./scripts/voicevox-dict.sh add Remotion リモーション
```

## 重要な知見

- **口のデフォルト**: `closed`（`むふ`から抽出、`ほう`ではない）
- **PSD抽出**: `layer.topil()`使用（`composite()`は空画像になる）
- **リップシンク**: JSONの最後に`end`エントリ（closed）が自動追加
- **JSON更新後**: Remotionサーバー再起動が必要

## クレジット

- VOICEVOX:ずんだもん
- 立ち絵素材: 坂本アヒル
