---
name: remotion
description: Remotionでの動画作成ルール。SceneComposition、シーンYAML、クレジット表記。
---

# Remotionルール

## 動画作成フロー

```bash
# 1. シーンYAMLを作成
vim scenes/my-video.yaml

# 2. 音声+リップシンク生成
./scripts/generate-from-scenes.sh scenes/my-video.yaml

# 3. プレビュー
npm run dev

# 4. レンダリング
./scripts/render-video.sh scenes/my-video.yaml
```

## シーンYAML構造

```yaml
title: "動画タイトル"
speaker_id: 3
defaultBackground: gradient

scenes:
  - text: "セリフ"
    emotion: happy
    background: purple
    pause: 0.5
```

## スライド解説形式

`slide`を指定すると画面左側にスライド枠が出る（キャラクターは右側）。
サンプル: `scenes/slide-demo.yaml`

```yaml
scenes:
  - text: "3ステップで作れるのだ"
    slide:
      title: "作り方は3ステップ"
      bullets: ["設定を書く", "音声を生成", "レンダリング"]
      accent: "#0984e3"   # 省略可
      note: "所要時間は数分" # 省略可

  - text: "まず設定を書くのだ"
    highlight: 1      # 1番目の箇条書きを強調（1始まり）

  - text: "スライドを消すのだ"
    slide: null       # 非表示に戻す
```

- `slide`を省略したシーンは**直前のスライドを継続**する（登場アニメは再生されない）
- `background`は引き継がれないため、同じスライド内でもシーンごとに指定する
- 配置は`src/components/SlideFrame.tsx`の`SLIDE_AREA`で調整

### スライドへの画像差し込み

```yaml
    slide:
      title: "画像も差し込める"
      bullets: ["箇条書きの横に並べられる"]
      image: "images/flow.png"
      imageLayout: split   # split=箇条書きの右 / stack=箇条書きの下
      caption: "図: 動画ができるまで"
```

`bullets`を書かなければ画像だけを大きく表示する。画像は箇条書きが出そろってから現れる。

## BGM

トップレベルに`bgm`を書くと動画全体にループで流れる。

```yaml
bgm:
  src: "audio/bgm/calm-loop.mp3"
  volume: 0.10    # デフォルト 0.12
  fadeIn: 1.5     # 秒（デフォルト 1）
  fadeOut: 2.5    # 秒（デフォルト 2）
  loop: true      # デフォルト true
```

- 文字列だけ書くこともできる: `bgm: "audio/bgm/calm-loop.mp3"`
- 音声ファイルは`public/audio/bgm/`に置く
- セリフを邪魔しないよう`volume`は0.1前後を推奨
- `credit`を書くと動画末尾のクレジットに追記される

## メディアパスの解決

`bgm.src` / `slide.image` / `image.src`は`src/utils/media.ts`の
`resolveMediaSrc`で解決される。

| 書き方 | 解決先 |
|--------|--------|
| `audio/bgm/foo.mp3` | `public/audio/bgm/foo.mp3` |
| `https://example.com/foo.mp3` | URLをそのまま参照 |

URLを使う場合の注意:
- レンダリング時に毎回ダウンロードが走るため、ネットワーク断で失敗する
- 配布元が直リンク（ホットリンク）を禁止していないか確認する
- 自前のS3/CDNなど、参照が許可されている場所を使う

## SceneComposition

シーンは`src/components/SceneComposition.tsx`で自動処理される。

```tsx
<SceneComposition
  config={videoConfig}
  scenes={generatedScenes}
/>
```

## ファイル配置

```
scenes/                    # シーン定義YAML
src/generated/             # 生成されたシーンJSON
public/parts/zundamon_en/  # パーツ
public/audio/<video>/      # 音声+JSON
```

## クレジット（自動表示）

動画最後の2秒に自動表示:
- VOICEVOX:ずんだもん
- 立ち絵素材: 坂本アヒル
