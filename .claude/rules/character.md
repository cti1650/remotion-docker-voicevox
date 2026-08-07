# キャラクタールール

立ち絵・表情・声・クレジットは**キャラクター定義1つにまとまっている**。
`SceneComposition.tsx`や各バリアントにキャラ固有の記述を書かないこと。

## 構成

```
src/characters/
├── types.ts               # CharacterDefinition の型
├── registry.ts            # 名前 → 定義のレジストリ
├── CharacterRenderer.tsx  # layersを順に重ねるだけの汎用描画
├── context.tsx            # 配下に配るコンテキスト（サムネイル用）
└── <name>/character.json  # キャラ1体分の定義（これが唯一の正）
```

`character.json`はTypeScript（描画）とPython（音声生成）の**両方から読む**ため、
ロジックを持たない素のJSONで書く。TSに移すと`generate-from-scenes.sh`から読めなくなる。

## 切り替え方

```yaml
character: zundamon   # 省略時 zundamon
speaker_id: 3         # 省略時は character.json の voice.defaultSpeakerId
```

話者IDの優先順位は **YAML > キャラクター定義 > (なし)**。
同じキャラのスタイル違い（あまあま等）を使いたいときはYAMLで上書きする。

## character.json の中身

| キー | 役割 |
|------|------|
| `art.basePath` | `public/`からのパーツ置き場 |
| `art.ext` | パーツの拡張子（既定`png`）。`svg`にすると拡大しても劣化しない |
| `art.width` / `height` | 立ち絵の原寸。キャラごとに違ってよい |
| `art.layers` | 重ね順。先に書いたものが奥 |
| `placement` | 本編での置き場所（式は`types.ts`のコメント参照） |
| `defaultSlots` | スロットの既定パーツ |
| `defaultFlags` | `layers`の`when`が参照するフラグ |
| `emotions` | 表情名 → 上書きするスロット。空なら表情なし |
| `blink` | 瞬き。目のスロットが無ければ省略 |
| `mouthSlot` / `mouthMap` | リップシンクの母音キーとパーツ名の対応 |
| `voice.defaultSpeakerId` | 既定の話者ID |
| `voice.pitchScale` ほか | 声の調整（下記） |
| `credits` | 動画末尾の表記。**声と立ち絵の両方**を書く |

`layers`の書き方は2通り。

```jsonc
{ "file": "body.png" }                    // 固定の1枚
{ "dir": "head_front/eye", "slot": "eye" } // スロットの値をファイル名にする
{ "file": "tail.png", "when": "showTail" } // フラグがtrueのときだけ描く
```

スロットに値が無いレイヤーは描画されない。
そのため「目を持たないキャラ」は`eye`のレイヤーごと書かなければよい。

## 声の調整

同じ話者IDでもキャラごとに声色を変えられる。YAMLの`voice:`が常に勝つ。

```json
"voice": {
  "defaultSpeakerId": 3,
  "pitchScale": 0.1
}
```

```yaml
voice:              # この動画だけ上書きする
  pitchScale: 0.05
  speedScale: 1.1
```

| キー | 範囲 | 既定 | 備考 |
|------|------|------|------|
| `speedScale` | 0.5〜2.0 | 1.0 | リップシンクの尺も自動で追従する |
| `pitchScale` | -0.15〜0.15 | 0 | 尺は変わらない |
| `intonationScale` | 0〜2.0 | 1.0 | 0に近いほど棒読み |
| `volumeScale` | 0〜2.0 | 1.0 | |

範囲外の値は生成時にエラーで止まる（VOICEVOXのGUIと同じ範囲にしてある）。

聴き比べは`generate-voice-with-lipsync.sh`を直接叩くのが速い。

```bash
./scripts/generate-voice-with-lipsync.sh "テスト" 3 /tmp/p010 '{"pitchScale":0.10}'
```

**注意**: `speedScale`を変えると音声の尺が変わるので、
その動画は必ず`npm run voice`で作り直す（既存のリップシンクJSONと合わなくなる）。

## 同梱しているキャラクター

| ID | 素材 | ライセンス | パーツ |
|----|------|-----------|--------|
| `zundamon` | 坂本アヒルの立ち絵（PSD由来） | 素材元の規約に従う | PNG |
| `presenter` | [Avataaars](https://avataaars.com/) (Pablo Stanley) | MIT | SVG |

`presenter`は口・目・眉が独立した層なので、リップシンク・瞬き・表情がすべて動く。

## 追加手順

素材によって3通りある。いずれも最後は`registry.ts`に登録するだけ。

| 素材 | 方法 |
|------|------|
| 静止画1枚 | `character-from-image`スキル（`scripts/create-character.py`） |
| Avataaars | `python3 scripts/fetch-avataaars-parts.py --name <name>` |
| PSD | `psd-extract`スキルで抽出してから手でJSONを書く |

手で作る場合:

1. `public/parts/<name>/` にパーツを置く
2. `src/characters/<name>/character.json` を書く
3. `src/characters/registry.ts` の`CHARACTERS`に足す

`CharacterRenderer.tsx`・`SceneComposition.tsx`・サムネイルの各バリアントは触らない。

再配布できる素材だけを`public/parts/`にコミットし、
`public/parts/<name>/CREDITS.md`にライセンスを書く（BGM・効果音と同じ運用）。

## クレジットは定義に書く

`credits`は動画末尾に自動表示される。
声と立ち絵で提供元が違うので**両方**書く。ここを書き忘れると
キャラを差し替えたときに前のキャラのクレジットが出たまま公開されてしまう。

```json
"credits": ["VOICEVOX:ずんだもん", "立ち絵素材: 坂本アヒル"]
```

## 変更したら確認する

キャラ周りは既存動画に影響しやすいので、レンダリングして比べる。

```bash
npx remotion still src/index.ts demo /tmp/after.png --frame=100
# 変更前と cmp で比較する（見た目が変わらないはずの変更なら完全一致するべき）
```
