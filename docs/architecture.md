# 構成と仕組み

ディレクトリの構成、見た目のバリアントの追加方法、生成物のgit管理について。

## ディレクトリ構成

```
.
├── scenes/                    # シーン定義YAML
│   └── demo.yaml
├── schema/
│   └── scene.schema.json      # シーンYAMLのJSON Schema（生成時に検証・補完も効く）
├── scripts/
│   ├── render.mjs             # レンダリング（npm run video / npm run thumbnail）
│   ├── generate.mjs           # 音声・リップシンク生成（npm run voice）
│   ├── voice.mjs              # 1セリフぶんの音声とリップシンク
│   ├── dict.mjs               # 辞書の確認・操作（npm run dict）
│   ├── lib.mjs                # YAML読み込み・スキーマ検証・VOICEVOX起動
│   └── *.py                   # パーツ抽出などの画像処理（初期セットアップのみ）
├── src/
│   ├── characters/             # キャラクター定義（立ち絵・表情・声・クレジット）
│   │   ├── CharacterRenderer.tsx  # layersを重ねるだけの汎用描画
│   │   ├── registry.ts            # 名前 → 定義のレジストリ
│   │   ├── zundamon/character.json
│   │   └── presenter/character.json
│   ├── components/
│   │   ├── SceneComposition.tsx   # 全体の組み立て
│   │   ├── Background.tsx
│   │   ├── HighlightImage.tsx
│   │   ├── subtitle/          # テロップの見た目バリアント
│   │   ├── slide/             # スライドの見た目バリアント
│   │   ├── opening/           # 冒頭のタイトル演出バリアント
│   │   └── thumbnail/         # サムネイルのバリアント
│   ├── generated/             # 生成されたシーンJSON
│   └── types/scene.ts
├── public/
│   ├── parts/zundamon_en/     # ずんだもんのパーツ（PNG）
│   ├── parts/presenter/       # Avataaars由来のパーツ（SVG。CREDITS.md参照）
│   └── audio/
│       ├── bgm/               # BGM（手で置く・git管理する）
│       ├── se/                # 効果音（同上。CC0素材を同梱）
│       └── voice/             # 生成された音声+リップシンク（git管理外）
└── output/                    # 出力動画
```

### パーツ構成

テロップとスライドは「共通パーツ → バリアント → レジストリ」の3層に分けている。
見た目を増やすときは既存のバリアントを触らずに済む。

4つのグループ（`subtitle` / `slide` / `opening` / `thumbnail`）がすべて同じ形をしている。

```
src/components/subtitle/
├── layout.ts          # 配置とフェードイン（全バリアント共通）
├── types.ts           # SubtitleVariantProps
├── BoxedSubtitle.tsx  # 各バリアント
├── BarSubtitle.tsx
├── OutlineSubtitle.tsx
├── CardSubtitle.tsx
└── index.tsx          # SUBTITLE_VARIANTS + SubtitleRenderer

src/components/slide/
├── layout.ts          # SLIDE_AREA・アクセント色・アニメの遅延
├── types.ts           # SlideVariantProps
├── parts/             # バリアントから組み合わせるパーツ
│   ├── SlideShell.tsx   # 外枠と登場アニメーション
│   ├── SlideHeader.tsx  # タイトル行
│   ├── SlideBody.tsx    # 箇条書きと画像の並べ方
│   ├── SlideFooter.tsx  # 補足とページ番号
│   ├── Bullet.tsx       # 箇条書き1行（明暗2トーン）
│   └── SlideImage.tsx
├── CardSlide.tsx      # 各バリアント（partsを組み合わせるだけ）
├── FullBleedSlide.tsx
├── TitleSlide.tsx
└── index.tsx          # SLIDE_VARIANTS + SlideRenderer

src/components/opening/    # Center / Band / Minimal
src/components/thumbnail/  # Bold / Split / Simple
```

`src/components/opening/parts/TitleStack.tsx`（バッジ+タイトル+サブタイトル）は
オープニングとサムネイルで共用している。

新しい見た目を足す手順は3つだけ。`SceneComposition.tsx` は触らなくてよい。

1. バリアントのコンポーネントを追加（`SlideVariantComponent` などを実装）
2. `index.tsx` のレジストリに登録
3. `src/types/scene.ts` の `SlideVariant` / `SubtitleVariant` / `OpeningVariant` /
   `ThumbnailVariant` に名前を追加

バリアントには絶対フレームではなく `localFrame`（表示開始からの経過フレーム）が渡るので、
配置やアニメーションのタイミングを気にせず中身だけ書けばよい。

### 生成物のgit管理

音声まわりは、手で用意するものと自動生成されるもので置き場所を分けている。

| 置き場所 | 中身 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | BGM（手で配置） | する |
| `public/audio/voice/` | `generate.mjs` の出力（`.wav` + リップシンク`.json`） | **しない** |

`public/audio/voice/` は `.gitignore` で丸ごと除外しているので、動画を増やしても
`.gitignore` を触る必要がない。

| ファイル | git管理 | 理由 |
|----------|---------|------|
| `src/generated/<動画名>.json` | する | `src/Root.tsx` がimportするため、無いとビルドが通らない |
| `public/audio/voice/<動画名>/` | しない | コマンドで再生成できる。リップシンクの中身は `src/generated/` 側の `lipsyncData` と重複する |
| `output/*.mp4` | しない | レンダリング成果物 |

clone直後は音声が無い状態なので、`npm run voice`（または `npm run video`）を
実行してからプレビュー・レンダリングする。
