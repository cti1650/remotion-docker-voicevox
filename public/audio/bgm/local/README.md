# 再配布できないBGMの置き場

**このディレクトリの中身はgit管理から除外されている**（このREADMEを除く）。

DOVA-SYNDROME・魔王魂・購入した音源など、**再配布が禁止されている素材はここに置く**。
`.gitignore`で除外しているので、`git add -A`しても誤ってコミットされない。

## 使い方

1. 配布元からダウンロードしてこのディレクトリに置く
2. シーンYAMLから`local/`込みのパスで参照する

```yaml
bgm:
  src: "audio/bgm/local/shuffle-shuffle.mp3"
  volume: 0.10
  credit: "BGM: shuffle shuffle / KK (DOVA-SYNDROME)"
```

`credit`を書くと動画末尾のクレジットに表示される。
利用規約でクレジット表記が必要な素材は必ず書くこと。

## 注意

ここに置いたファイルはリポジトリに含まれないため、
**別の環境でcloneしただけではレンダリングできない**。
チームで共有する場合は、配布元URLをYAMLのコメントに残しておくとよい。

## 再配布が許可されている素材は？

親ディレクトリ（`public/audio/bgm/`）に置いてコミットする。
ライセンスは`public/audio/bgm/CREDITS.md`に追記すること。
