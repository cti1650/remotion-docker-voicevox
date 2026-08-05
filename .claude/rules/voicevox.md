---
name: voicevox
description: VOICEVOX音声生成時のルール。シーンYAML使用、辞書登録、クレジット表記。
---

# VOICEVOXルール

## 必須事項

1. 話者ID: ずんだもんノーマル=3
2. 英語・固有名詞は辞書に登録する（英字は1文字ずつ読まれる）
3. **日本語でも誤読しやすい語は必ず辞書に登録する**
4. セリフはそのまま字幕になるので、読みを直すためにカタカナで書かない

エンジンの起動確認は不要（`scripts/lib.sh`の`ensure_voicevox`が自動で起動する）。

## 辞書

辞書は生成のたびに自動で総入れ替えされる。手動での登録・インポートは不要。

| 層 | 置き場所 | 用途 |
|----|----------|------|
| 共有 | `config/voicevox-dict.json` | 全動画で使う語（Remotion、VOICEVOX等） |
| 個別 | 各シーンYAMLの`dict:` | その動画にしか出てこない語 |

```yaml
dict:
  Cosense: コセンス
  複数人: フクスウニン     # デフォルトはフクスウジン
  行の頭: ギョウノアタマ   # デフォルトはクダリノアタマ
```

- 読みは全角カタカナで書く
- 同じ語があればYAML側が勝つ
- `accent_type`と`priority`を変えたいときはオブジェクトで書く

```yaml
dict:
  Cosense:
    pronunciation: コセンス
    accent_type: 0
    priority: 10
```

### 読みの確認方法（生成前にやる）

誤読は聞かないと気付けないので、`audio_query`の`kana`で事前に確認する。

```bash
curl -s -X POST "http://localhost:50021/audio_query?text=$(printf '複数人' | jq -sRr @uri)&speaker=3" \
  | jq -r .kana
```

日本語の誤読は特に**複合語**で起きやすい（例: 複数人→フクスウジン、行の頭→クダリノアタマ）。
新しいYAMLを作ったら全セリフを一度この方法で確認する。

### priorityの注意

VOICEVOXのデフォルト`priority=5`では、日本語の複合語が内蔵辞書の分割に負けて
**登録した読みが効かない**。そのため`generate-from-scenes.sh`は`priority=10`で登録している。

## 音声生成（推奨）

```bash
# シーンYAMLから一括生成
npm run voice -- scenes/demo.yaml

# 全YAMLを一括処理
npm run voice
```

## 個別音声生成

```bash
./scripts/generate-voice-with-lipsync.sh "テキスト" 3 public/audio/voice/demo/scene_001
```

## 辞書の手動操作（デバッグ用）

通常は不要。エンジンの状態を直接見たいときに使う。

```bash
./scripts/voicevox-dict.sh list      # 今エンジンに入っている語を確認
./scripts/voicevox-dict.sh add Remotion リモーション
```

`add`で足した語は次回の生成時に消える（`config/`とYAMLだけが正のため）。
残したい語は`config/voicevox-dict.json`かYAMLの`dict:`に書く。

## 話者ID

| ID | キャラクター |
|----|--------------|
| 3 | ずんだもん（ノーマル） |
| 1 | 四国めたん |
| 8 | 春日部つむぎ |

## クレジット表記

動画内に`VOICEVOX:ずんだもん`を表示（SceneCompositionで自動表示）
