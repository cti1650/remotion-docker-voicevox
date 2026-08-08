# Remotion + VOICEVOX Docker Environment

DockerでRemotionとVOICEVOXを使った動画作成環境。
YAMLでシーンを定義するだけで、音声・リップシンク・動画を自動生成する。

![デモ](docs/images/demo.gif)

セリフを書くだけで、読み上げ・口パク・テロップ・表情・背景が揃う
（`scenes/presenter-demo.yaml` の出力。GIFなので音は出ない）。

## 必要条件

- Docker / Docker Compose
- Node.js 18+

動画づくりに必要なのはこの2つだけ。
PSDからパーツを切り出す等の初期セットアップだけPython 3を使う（[docs/assets.md](docs/assets.md)）。

## クイックスタート

`scenes/demo.yaml` に全機能を詰め込んだサンプルがある。

```bash
npm install                          # 初回のみ
npm run video -- scenes/demo.yaml    # 音声生成 → レンダリング → output/demo.mp4
```

VOICEVOXエンジンは起動していなければ自動で立ち上がる（初回はイメージのpullで数分かかる）。

## 使い方

`scenes/` にYAMLを作り、コマンドを1つ叩くだけ。

```yaml
# scenes/my-video.yaml
title: "説明動画"

scenes:
  - text: "こんにちは！ずんだもんなのだ！"
    emotion: happy

  - text: "今日はRemotionについて説明するのだ"
    emotion: normal
    background: purple
```

```bash
npm run video -- scenes/my-video.yaml   # output/my-video.mp4
```

セリフを変えずにレイアウトだけ調整するときは `--skip-generate` を使うと速い。

```bash
npm run voice -- scenes/my-video.yaml                    # 音声とリップシンクだけ生成
npm run dev                                              # プレビュー（localhost:3000）
npm run video -- scenes/my-video.yaml --skip-generate    # 音声を使い回してレンダリング
```

スライド・BGM・効果音・冒頭演出・サムネイル・キャラクターの切り替えなどは
[docs/scene-yaml.md](docs/scene-yaml.md) を参照。

### 書き間違いはその場で分かる

YAMLは `schema/scene.schema.json` で検証される。項目名を打ち間違えると
生成時にエラーで止まるので、動画を書き出してから気付くことがない。

```
scenes/my-video.yaml のスキーマ検証に失敗しました
  /scenes/0/emotion must be equal to one of the allowed values (使えるのは normal / happy / ...)
```

VS Codeに [YAML拡張](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)
を入れると、書いている最中に補完と検証が効く（拡張はこのリポジトリを開くと推奨表示される）。
各YAMLの1行目にあるモデル行がスキーマと結び付けている。

## ドキュメント

| ドキュメント | 内容 |
|-------------|------|
| [docs/scene-yaml.md](docs/scene-yaml.md) | シーンYAMLの書き方（スライド・BGM・効果音・冒頭・サムネイル・キャラクター・読み方） |
| [docs/assets.md](docs/assets.md) | 素材のライセンスと置き場所 |
| [docs/architecture.md](docs/architecture.md) | ディレクトリ構成・バリアントの追加・生成物のgit管理 |
| [docs/docker.md](docs/docker.md) | Dockerとエンジンの管理・トラブルシューティング |

AIエージェント向けの規約は `.claude/` にある（`rules/` と `skills/`）。

## コマンド一覧

| コマンド | 説明 |
|----------|------|
| `npm run video -- scenes/demo.yaml` | 音声生成からレンダリングまで通しで実行 |
| `npm run video -- scenes/demo.yaml --skip-generate` | 音声を使い回してレンダリングのみ |
| `npm run video` | `scenes/` にあるYAMLの一覧を表示 |
| `npm run voice -- scenes/demo.yaml` | 音声・リップシンクのみ生成 |
| `npm run voice` | `scenes/*.yaml` を全部まとめて音声生成 |
| `npm run thumbnail -- scenes/demo.yaml` | サムネイルをPNGで書き出す |
| `npm run dev` | Remotion Studioでプレビュー |
| `npm run voicevox:up` / `npm run voicevox:down` | VOICEVOXの起動・停止 |
| `npm run dict -- list` | VOICEVOXの辞書の中身を確認（デバッグ用） |

`npm run video` / `npm run voice` はVOICEVOXが止まっていれば自動で起動するので、
`voicevox:up` を先に叩く必要はない。

clone直後は音声が無い状態なので、`npm run voice` を実行してからプレビューする。

## サンプル

| ファイル | 内容 |
|----------|------|
| `scenes/demo.yaml` | 全機能入り |
| `scenes/slide-demo.yaml` | スライドの基本 |
| `scenes/variants-demo.yaml` | テロップとスライドの見た目 |
| `scenes/opening-demo.yaml` | 冒頭とサムネイル |
| `scenes/presenter-demo.yaml` | キャラクターの差し替え |
| `scenes/character-switch-demo.yaml` | 動画の途中でキャラクターを切り替える |
| `scenes/ending-demo.yaml` | 冒頭とエンディング |
| `scenes/git.yaml` ほか | 実際の解説動画 |

## ライセンス・クレジット

動画内のクレジットは自動表示される。素材を追加するときは
[docs/assets.md](docs/assets.md) を必ず読むこと。

### VOICEVOX音声

**話者ごとに規約が違う。** クレジット表記は `VOICEVOX:キャラクター名` の形式。

- ずんだもん（話者ID 3）— [利用規約](https://zunko.jp/con_ongen_kiyaku.html)
- 玄野武宏（話者ID 11）

### 立ち絵素材

- **zundamon** — 作者: 坂本アヒル（[ニコニコ静画](https://seiga.nicovideo.jp/seiga/im10788496)）
- **presenter** — [Avataaars](https://avataaars.com/) (Pablo Stanley) / MIT
  （全文は `public/parts/presenter/CREDITS.md`）

> [!IMPORTANT]
> **フォークして商用利用する場合は注意が必要です。**
> ずんだもんの立ち絵と声には、東北ずん子・ずんだもんプロジェクトの規約による制約が
> あります（東北6県以外の企業・法人の商用利用は別途ライセンス契約が必要）。
> また立ち絵の無償再配布については規約に明記が無く、このリポジトリは
> 「OSS・無償・立ち絵が主体ではない」ことから禁止に該当しないと判断して同梱しています。
> 詳細と、制約を避けたい場合の代替（`presenter`キャラクター）は
> [docs/assets.md](docs/assets.md) を参照してください。

### BGM・効果音

- BGM: Carefree - Kevin MacLeod (incompetech.com) / CC BY 4.0
- 効果音: [Kenney](https://kenney.nl/) / CC0

詳細は `public/audio/bgm/CREDITS.md` と `public/audio/se/CREDITS.md`。
