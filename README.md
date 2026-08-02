# Remotion + VOICEVOX Docker Environment

DockerでRemotionとVOICEVOXを使った動画作成環境。

## 必要条件

- Docker
- Docker Compose

## セットアップ

```bash
# リポジトリをクローン後
docker compose build

# Remotionプロジェクトを初期化（初回のみ）
docker compose run --rm remotion npm create video@latest -- --yes --blank --no-tailwind .
```

## 使い方

### 開発サーバー起動

```bash
docker compose up
```

ブラウザで http://localhost:3000 を開く。

### 動画レンダリング

```bash
docker compose --profile render up render
```

`output/video.mp4` に出力される。

### VOICEVOXで音声生成

```bash
# コンテナ内でスクリプトを実行
docker compose exec remotion ./scripts/generate-voice.sh "こんにちは" 3 assets/audio/hello.wav
```

Speaker IDの一覧は http://localhost:50021/speakers で確認できる。

### キャラクターポートレートのダウンロード

```bash
docker compose exec remotion ./scripts/download-portrait.sh "ずんだもん"
```

### ずんだもん立ち絵パーツのセットアップ

キャラクターをアニメーションさせるには、立ち絵素材が必要です。

1. [ニコニコ静画](https://seiga.nicovideo.jp/seiga/im10788496)からPSDファイルをダウンロード（パスワード: zunda）
2. `assets/zundamon.psd` に配置
3. パーツを抽出:

```bash
docker compose exec remotion python3 scripts/extract-psd-parts.py assets/zundamon.psd assets/parts/zundamon
```

または、[PSDTool](https://oov.github.io/psdtool/)を使ってブラウザでパーツを個別にPNG出力することもできます。

## ディレクトリ構成

```
.
├── Dockerfile
├── docker-compose.yml
├── scripts/
│   ├── setup.sh                # セットアップスクリプト
│   ├── download-portrait.sh    # ポートレートダウンロード
│   ├── generate-voice.sh       # 音声生成
│   ├── extract-psd-parts.py    # PSDパーツ抽出
│   └── download-zundamon-parts.sh
├── src/
│   ├── components/
│   │   └── ZundamonCharacter.tsx  # キャラクターコンポーネント
│   ├── hooks/
│   │   └── useLipSync.ts          # 口パク同期フック
│   ├── Composition.tsx            # メイン動画構成
│   ├── Root.tsx
│   └── index.ts
├── public/parts/             # キャラクターパーツ（PNG）
├── assets/                   # アセット（PSD・音声）
└── output/                   # 出力ディレクトリ
```

## VOICEVOX API

VOICEVOXエンジンは http://localhost:50021 で動作。

主なエンドポイント:
- `GET /speakers` - 話者一覧
- `POST /audio_query` - 音声クエリ生成
- `POST /synthesis` - 音声合成

## ライセンス・利用規約

### Remotion

- 個人または3人以下のチームは無料（商用含む）
- 4人以上の営利組織は[有料ライセンス](https://www.remotion.dev/docs/license)が必要

### VOICEVOX音声（ずんだもん）

- 個人利用・収益化OK
- **クレジット表記必須**: `VOICEVOX:ずんだもん`
- 禁止: 公序良俗違反、政治・宗教活動、情報商材、フェイク情報
- [利用規約](https://zunko.jp/con_ongen_kiyaku.html)

### 立ち絵素材（坂本アヒル氏）

- 個人利用・改変OK
- クレジット表記は任意（推奨）
- 禁止: 公序良俗違反、キャラクターイメージを著しく損なう使用
- [ニコニコ静画](https://seiga.nicovideo.jp/seiga/im10788496)

### クレジット表記例

動画の概要欄またはエンディングに以下を記載:

```
VOICEVOX:ずんだもん
立ち絵素材: 坂本アヒル
```
