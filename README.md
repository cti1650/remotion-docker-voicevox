# Remotion + VOICEVOX Docker Environment

DockerでRemotionとVOICEVOXを使った動画作成環境。YAMLでシーンを定義するだけで、音声・リップシンク・動画を自動生成。

## 必要条件

- Docker / Docker Compose
- Node.js 18+ (ローカル開発時)
- Python 3 + PyYAML（音声生成スクリプトが使用）

## クイックスタート

`scenes/` にYAMLを置いたら、動画になるまでは1コマンド。

```bash
npm install                          # 初回のみ
npm run video -- scenes/demo.yaml    # 音声生成 → レンダリング → output/demo.mp4
```

VOICEVOXエンジンは起動していなければ自動で立ち上がる（初回はイメージのpullで数分かかる）。

```bash
npm run video -- scenes/demo.yaml                    # 音声生成 + レンダリング
npm run video -- scenes/demo.yaml --skip-generate    # レンダリングのみ（音声は再利用）
npm run voice -- scenes/demo.yaml                    # 音声・リップシンク生成のみ
npm run dev                                          # Remotion Studioでプレビュー
npm run voicevox:down                                # VOICEVOXを停止
```

`npm run video` を引数なしで実行すると、`scenes/` にあるYAMLの一覧が出る。

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

#### スライドを見せながら解説する

`slide` を指定すると、画面左側にスライド枠が表示される（キャラクターは右側）。

```yaml
scenes:
  - text: "3ステップで作れるのだ"
    slide:
      title: "作り方は3ステップ"
      bullets:
        - "設定ファイルを書く"
        - "音声を生成する"
        - "レンダリングする"

  - text: "まずは設定ファイルを書くのだ"
    highlight: 1      # 1番目の箇条書きを強調

  - text: "スライドはここで消すのだ"
    slide: null
```

`slide` を書かないシーンは直前のスライドを継続表示する。

スライドには画像も差し込める:

```yaml
    slide:
      title: "画像も差し込める"
      bullets: ["箇条書きの横に並べられる"]
      image: "images/flow.png"
      imageLayout: split   # split=箇条書きの右 / stack=箇条書きの下
      caption: "図: 動画ができるまで"
```

`bullets` を書かなければ画像だけを大きく表示する。

#### BGMを流す

トップレベルに `bgm` を書くと、動画全体にループで流れる（フェードイン・アウト付き）。

```yaml
bgm:
  src: "audio/bgm/carefree-kevin-macleod.mp3"  # public/audio/bgm/ に配置
  volume: 0.10                                  # セリフを邪魔しない程度に
  fadeIn: 1.5
  fadeOut: 2.5
  credit: "BGM: Carefree - Kevin MacLeod (incompetech.com) / CC BY 4.0"
```

`src` にはHTTPS URLも書ける（配布元が直リンクを許容している場合のみ）。

音源は再配布の可否で置き場所を分ける。

| 置き場所 | 用途 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | 再配布OK（CC BY・パブリックドメインなど） | する |
| `public/audio/bgm/local/` | **再配布NG**（DOVA-SYNDROME・魔王魂・購入音源など） | しない |

`local/` は `.gitignore` で除外しているので、規約違反の素材を誤ってコミットする心配がない。
同梱音源のライセンスは `public/audio/bgm/CREDITS.md` を参照。

動作するサンプルは `scenes/slide-demo.yaml` を参照。

#### 読み方を直す

セリフは**そのまま字幕として表示される**ので、読みを直すためにカタカナで書いてはいけない。
表記は元のまま書いて、読みは `dict` で指定する。

```yaml
dict:
  Cosense: コセンス
  複数人: フクスウニン     # デフォルトはフクスウジン
  行の頭: ギョウノアタマ   # デフォルトはクダリノアタマ
```

- 英字はそのままだと1文字ずつ読まれる（`Cosense` → シイオオエスイイ…）ので必ず登録する
- **日本語でも複合語は誤読しやすい**ので、気になったら確認して登録する
- 全動画で使う語は `config/voicevox-dict.json` に置く（同じ語はYAML側が勝つ）
- 辞書は生成のたびに自動で入れ替わるため、手動での登録・インポートは不要

読みは生成前に確認できる。

```bash
curl -s -X POST "http://localhost:50021/audio_query?text=$(printf '複数人' | jq -sRr @uri)&speaker=3" | jq -r .kana
# → フクスウ'ジン（辞書登録が必要とわかる）
```

サンプルは `scenes/cosense.yaml` を参照。

### 2. 動画を生成

```bash
npm run video -- scenes/my-video.yaml
# output/my-video.mp4 に出力
```

音声・リップシンクの生成からレンダリングまでを通しで実行する。

### 3. 途中で確認したい場合

```bash
npm run voice -- scenes/my-video.yaml   # 音声とリップシンクだけ生成
npm run dev                             # プレビュー（http://localhost:3000）
npm run video -- scenes/my-video.yaml --skip-generate   # 音声を使い回してレンダリング
```

セリフを変えずにレイアウトだけ調整するときは `--skip-generate` を使うと速い。

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
│   ├── render-video.sh           # 音声生成 + レンダリング（npm run video）
│   ├── generate-from-scenes.sh   # 音声・リップシンク生成（npm run voice）
│   ├── generate-voice-with-lipsync.sh
│   └── lib.sh                    # python検出・VOICEVOX起動の共通処理
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
│   └── audio/
│       ├── bgm/               # BGM（手で置く・git管理する）
│       └── voice/             # 生成された音声+リップシンク（git管理外）
└── output/                    # 出力動画
```

### 生成物のgit管理

音声まわりは、手で用意するものと自動生成されるもので置き場所を分けている。

| 置き場所 | 中身 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | BGM（手で配置） | する |
| `public/audio/voice/` | `generate-from-scenes.sh` の出力（`.wav` + リップシンク`.json`） | **しない** |

`public/audio/voice/` は `.gitignore` で丸ごと除外しているので、動画を増やしても
`.gitignore` を触る必要がない。

| ファイル | git管理 | 理由 |
|----------|---------|------|
| `src/generated/<動画名>.json` | する | `src/Root.tsx` がimportするため、無いとビルドが通らない |
| `public/audio/voice/<動画名>/` | しない | コマンドで再生成できる。リップシンクの中身は `src/generated/` 側の `lipsyncData` と重複する |
| `output/*.mp4` | しない | レンダリング成果物 |

clone直後は音声が無い状態なので、`npm run voice`（または `npm run video`）を
実行してからプレビュー・レンダリングする。

## コマンド一覧

| コマンド | 説明 |
|----------|------|
| `npm run video -- scenes/demo.yaml` | 音声生成からレンダリングまで通しで実行 |
| `npm run video -- scenes/demo.yaml --skip-generate` | 音声を使い回してレンダリングのみ |
| `npm run video` | `scenes/` にあるYAMLの一覧を表示 |
| `npm run voice -- scenes/demo.yaml` | 音声・リップシンクのみ生成 |
| `npm run voice` | `scenes/*.yaml` を全部まとめて音声生成 |
| `npm run dev` | Remotion Studioでプレビュー |
| `npm run voicevox:up` / `npm run voicevox:down` | VOICEVOXの起動・停止 |

```bash
# エンジンに今入っている辞書を確認（デバッグ用）
./scripts/voicevox-dict.sh list
```

`npm run video` / `npm run voice` はVOICEVOXが止まっていれば自動で起動するので、
`voicevox:up` を先に叩く必要はない。

スクリプトは `./scripts/render-video.sh scenes/demo.yaml` のように直接実行してもよい。

## Docker管理

`npm run video` / `npm run voice` がVOICEVOXを自動起動するため、通常は以下の操作は不要。
手動で管理したい場合や、トラブル時に使う。

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
