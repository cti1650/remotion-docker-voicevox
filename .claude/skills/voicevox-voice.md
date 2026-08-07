---
name: voicevox-voice
description: |
  VOICEVOXで音声+リップシンクデータを生成するスキル。
  トリガー: 「音声を生成して」「VOICEVOXで喋らせて」
  出力: .wav音声ファイル + .jsonリップシンクデータ
---

# VOICEVOX音声生成

## 前提条件

VOICEVOXは`npm run voice` / `npm run video`が自動起動するため、事前操作は不要。
個別に確認・操作する場合:

```bash
curl -s http://localhost:50021/version  # 起動確認
npm run voicevox:up                     # 手動起動
```

## シーンYAMLから一括生成（推奨）

```bash
npm run voice -- scenes/demo.yaml
```

## 個別音声生成

```bash
./scripts/generate-voice-with-lipsync.sh "テキスト" <speaker_id> <output_base> [voice_params]

# 例
./scripts/generate-voice-with-lipsync.sh "こんにちは！" 3 public/audio/voice/demo/scene_001
# 出力: scene_001.wav, scene_001.json

# 声を調整する場合（省略可。JSON文字列で渡す）
./scripts/generate-voice-with-lipsync.sh "テスト" 3 /tmp/p010 '{"pitchScale":0.10}'
```

話者ID: ずんだもん=3（ノーマル）、1（あまあま）、7（ツンツン）

`voice_params`で`speedScale`（0.5〜2.0）/`pitchScale`（-0.15〜0.15）/
`intonationScale`（0〜2.0）/`volumeScale`（0〜2.0）を調整できる。
`speedScale`を変えるとリップシンクの尺も自動で追従する。
詳細は`.claude/rules/character.md`を参照。

## 辞書

生成時に自動適用されるので、手動登録は不要。読みを直したい語は書く場所を選ぶだけ。

```yaml
# scenes/my-video.yaml — この動画だけで使う語
dict:
  Cosense: コセンス
  複数人: フクスウニン     # 日本語でも誤読するものは必ず登録する
```

全動画で使う語は `config/voicevox-dict.json` に置く。
詳細と誤読の確認方法は `.claude/rules/voicevox.md` を参照。

## リップシンクJSON構造

```json
{
  "text": "こんにちは",
  "duration": 2.867,
  "lipsync": [
    { "time": 0, "duration": 0.091, "phoneme": "k", "mouth": "n" },
    { "time": 2.367, "duration": 0.5, "phoneme": "end", "mouth": "closed" }
  ]
}
```

最後に`end`エントリ（0.5秒、closed）が自動追加される。

## 口形状マッピング

母音（大文字は無声化）:

| 音素 | mouth |
|------|-------|
| a, A | a |
| i, I | i |
| u, U | u |
| e, E | e |
| o, O | o |
| N | n |
| cl（促音）, pau, end | closed |

子音は**後ろに続く母音と同じ形**にする。ただし唇を閉じる両唇音
（`m` / `my` / `p` / `py` / `b` / `by`）だけは `closed` にする。

子音に専用の形を割り当てると、子音は1フレーム程度しかないことが多いため
母音の合間で毎回口が閉じてチラついて見える。実際の発音でも子音を出す間に
口はすでに母音の形へ動いているので、揃えたほうが自然になる。

JSONに入るのは母音キー（`a`/`i`/`u`/`e`/`o`/`n`/`closed`）だけで、
実際のパーツ名への変換はキャラクター定義の`mouthMap`が行う。
