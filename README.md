# Remotion + VOICEVOX Docker Environment

DockerでRemotionとVOICEVOXを使った動画作成環境。YAMLでシーンを定義するだけで、音声・リップシンク・動画を自動生成。

## 必要条件

- Docker / Docker Compose
- Node.js 18+ (ローカル開発時)

## クイックスタート

```bash
# 1. VOICEVOXエンジン起動
docker compose up -d voicevox

# 2. 依存関係インストール（初回のみ）
npm install

# 3. シーンYAMLから音声・リップシンク生成
./scripts/generate-from-scenes.sh scenes/demo.yaml

# 4. プレビュー
npm run dev

# 5. 動画レンダリング
./scripts/render-video.sh scenes/demo.yaml
```

## ワークフロー

### 1. シーンYAMLを作成

`scenes/` ディレクトリにYAMLファイルを作成:

```yaml
# scenes/my-video.yaml
title: "説明動画"
speaker_id: 3          # ずんだもんノーマル

scenes:
  - text: "こんにちは！ずんだもんなのだ！"
    emotion: happy

  - text: "今日はRemotionについて説明するのだ"
    emotion: normal
    background: purple

  - text: "とっても簡単なのだ！"
    emotion: surprised
```

### 2. 音声とリップシンク生成

```bash
./scripts/generate-from-scenes.sh scenes/my-video.yaml
```

### 3. プレビュー

```bash
npm run dev
# ブラウザで http://localhost:3000 を開く
```

### 4. 動画出力

```bash
./scripts/render-video.sh scenes/my-video.yaml
# output/my-video.mp4 に出力
```

## シーン設定オプション

| プロパティ | 説明 | 例 |
|-----------|------|-----|
| `text` | セリフ（必須） | `"こんにちは！"` |
| `emotion` | 表情 | `normal`, `happy`, `sad`, `angry`, `surprised`, `thinking`, `smug`, `tired` |
| `background` | 背景 | `gradient`, `purple`, `blue`, `green`, `orange`, `pink`, `dark`, `white` |
| `image` | 強調画像 | `{ src: "images/sample.png", position: "top-right" }` |
| `pause` | セリフ後の間（秒） | `0.5` |

## ディレクトリ構成

```
.
├── scenes/                    # シーン定義YAML
│   └── demo.yaml
├── scripts/
│   ├── generate-from-scenes.sh   # 音声・リップシンク生成
│   ├── render-video.sh           # 動画レンダリング
│   └── generate-voice-with-lipsync.sh
├── src/
│   ├── components/
│   │   ├── ZundamonCharacter.tsx
│   │   ├── SceneComposition.tsx
│   │   ├── Background.tsx
│   │   └── HighlightImage.tsx
│   ├── generated/             # 生成されたシーンJSON
│   └── types/scene.ts
├── public/
│   ├── parts/zundamon_en/     # キャラクターパーツ
│   └── audio/                 # 生成された音声
└── output/                    # 出力動画
```

## コマンド一覧

```bash
# 開発サーバー
npm run dev

# 全シーンの音声生成
./scripts/generate-from-scenes.sh

# 特定のシーンの音声生成
./scripts/generate-from-scenes.sh scenes/demo.yaml

# 動画レンダリング
./scripts/render-video.sh scenes/demo.yaml

# 音声生成をスキップしてレンダリングのみ
./scripts/render-video.sh scenes/demo.yaml --skip-generate

# VOICEVOX辞書登録（発音修正）
./scripts/voicevox-dict.sh add Remotion リモーション
```

## Docker管理

### 初期設定

```bash
# イメージのダウンロード（初回のみ、数GBあるので時間がかかる）
docker compose pull

# または起動時に自動でダウンロード
docker compose up -d voicevox
```

### 起動

```bash
# VOICEVOXエンジンを起動（バックグラウンド）
docker compose up -d voicevox

# 起動確認
curl http://localhost:50021/version
```

### 停止

```bash
# コンテナを停止（データは保持）
docker compose stop

# または完全に削除（コンテナのみ、ボリュームは保持）
docker compose down
```

### データクリア

```bash
# コンテナとボリューム（辞書データ等）を完全削除
docker compose down -v

# イメージも含めて完全削除（再ダウンロードが必要になる）
docker compose down -v --rmi all

# 未使用のDockerリソースを一括クリーンアップ
docker system prune -a
```

### トラブルシューティング

```bash
# ログ確認
docker compose logs voicevox

# コンテナの状態確認
docker compose ps

# コンテナを再起動
docker compose restart voicevox
```

## VOICEVOX設定

VOICEVOXエンジンは http://localhost:50021 で動作。

```bash
# 話者一覧確認
curl http://localhost:50021/speakers | jq
```

主な話者ID:
- 3: ずんだもん（ノーマル）
- 1: 四国めたん
- 8: 春日部つむぎ

## ライセンス・クレジット

### VOICEVOX音声

- **クレジット表記必須**: `VOICEVOX:ずんだもん`
- [利用規約](https://zunko.jp/con_ongen_kiyaku.html)

### 立ち絵素材

- 作者: 坂本アヒル
- [ニコニコ静画](https://seiga.nicovideo.jp/seiga/im10788496)

動画内に以下を表示（自動表示済み）:
```
VOICEVOX:ずんだもん
立ち絵素材: 坂本アヒル
```
