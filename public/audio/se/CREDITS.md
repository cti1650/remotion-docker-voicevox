# 効果音素材のクレジット

効果音もBGMと同じく、再配布の可否で置き場所を分ける。

| 置き場所 | 用途 | git管理 |
|----------|------|---------|
| `public/audio/se/` | 再配布が許可されている素材（CC0・CC BYなど） | する |
| `public/audio/se/local/` | 再配布が禁止されている素材（効果音ラボ・魔王魂・購入音源など） | **しない** |

日本語のフリー効果音サイトは「商用利用OK」でも**素材ファイルそのものの再配布は禁止**
していることが多い。その場合は `local/` に置く（`.gitignore`で除外済み）。

## 同梱している効果音

すべて Kenney の Interface Sounds (1.0) から採用し、用途がわかる名前に変えたもの。

- 作者: Kenney (https://kenney.nl/)
- 配布元: https://kenney.nl/assets/interface-sounds
- ライセンス: [Creative Commons Zero (CC0 1.0)](https://creativecommons.org/publicdomain/zero/1.0/)
- 規約: 個人・教育・商用のいずれでも利用可。**クレジット表記は任意**（必須ではない）

| ファイル | 元のファイル名 | 想定用途 |
|----------|----------------|----------|
| `pop.ogg` | `click_001.ogg` | テロップの表示 |
| `select.ogg` | `select_002.ogg` | 箇条書きの強調 |
| `slide-in.ogg` | `maximize_006.ogg` | スライドの登場 |
| `chime.ogg` | `question_001.ogg` | 注目させたいところ |
| `confirm.ogg` | `confirmation_001.ogg` | 決定・まとめ |
| `transition.ogg` | `switch_002.ogg` | 章の切り替え |

CC0はパブリックドメイン相当のため表示義務はないが、
作者への敬意としてこのファイルに記載を残している。

## 効果音を追加するとき

配布元の規約を確認して置き場所を決める。判断に迷ったら `local/` に置けば規約違反にはならない。

再配布が許可されている代表的な入手先:

- [Kenney](https://kenney.nl/assets?q=audio) — CC0
- [freesound.org](https://freesound.org/) — CC0のものだけを選ぶ（CC BYは表示義務あり）
- [OpenGameArt](https://opengameart.org/) — ライセンスは素材ごとに異なるので個別に確認する

`local/` に置く場合は、そのファイルを使ったYAMLに `credit` を書いて
動画末尾のクレジットに表示する。
