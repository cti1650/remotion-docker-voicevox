---
name: video-pipeline
description: |
  シーンYAML（scenes/*.yaml）から動画（output/*.mp4）を出力するまでの流れを管理するスキル。
  トリガー: 「動画を作って」「動画を書き出して」「レンダリングして」「全部作り直して」
  「音声だけ作って」「サムネイルを出して」
  読みの確認 → 音声生成 → 静止画で確認 → レンダリングの順を守る。
  YAMLの書き方は .claude/rules/scenes.md、素材は .claude/rules/assets.md（厳守）。
---

# 動画を出力するまでの流れ

`scenes/<name>.yaml` → `output/<name>.mp4` までの手順。
**順番を守ること。** 特に「読みの確認」と「静止画での確認」を飛ばさない。

## 全体の流れ

```
1. シーンYAMLを書く          → .claude/rules/scenes.md に従う
2. 読みを確認する             ← 生成前。飛ばさない
3. 音声とリップシンクを生成    → npm run voice
4. 静止画で見た目を確認        ← レンダリング前。ここで崩れを潰す
5. 動画を書き出す             → npm run video -- ... --skip-generate
6. サムネイルを書き出す        → npm run thumbnail
```

各ステップの成果物:

| ステップ | 出力 | git管理 |
|---------|------|---------|
| 3 | `public/audio/voice/<name>/*.wav` `*.json` | **しない**（再生成できる） |
| 3 | `src/generated/<name>.json` | **する**（Root.tsxがimportする） |
| 3 | `src/Root.tsx` | する（自動更新される） |
| 5 | `output/<name>.mp4` | しない |
| 6 | `output/<name>-thumbnail.png` | しない |

## 1. シーンYAMLを書く

フォーマットは `.claude/rules/scenes.md`。素材を足すなら `.claude/rules/assets.md`（厳守）。

## 2. 読みを確認する（飛ばさない）

**セリフはそのまま字幕になる。** 読みを直すためにカタカナで書かず、`dict` で直す。
英字だけでなく**日本語の複合語**が誤読しやすい（例: 行単位→クダリタンイ、微調整→ホロチョウセイ）。

```bash
# 1文だけ確認
curl -s -X POST "http://localhost:50021/audio_query?text=$(printf '行単位' | jq -sRr @uri)&speaker=3" | jq -r .kana
```

新規YAMLは**全セリフ**を確認する。まとめて見るには、そのYAMLの`dict`を
一時登録してから全文を流す（詳細は `.claude/rules/voicevox.md`）。

誤読を見つけたら、**辞書で直すか、文を書き換えるか**を選ぶ。
「録って」→ロクッテ のように語自体が紛らわしい場合は、
「録音して」のように**書き換えたほうが自然**なことが多い。

VOICEVOXが止まっていれば自動起動する（`scripts/lib.sh`の`ensure_voicevox`）。

## 3. 音声とリップシンクを生成する

```bash
npm run voice -- scenes/<name>.yaml   # 1本だけ
npm run voice                          # scenes/*.yaml を全部
```

やっていること:
- 辞書を総入れ替え（共有 + そのYAMLの`dict`）
- BGM・効果音のファイル実在と置き場所をチェック
- セリフごとに音声＋リップシンクを生成
- `src/generated/<name>.json` を出力
- `src/Root.tsx` を自動更新

出力の確認ポイント:

```
キャラクター: ずんだもん (話者ID: 3)     ← 意図した話者か
辞書: 6語を登録 (共有 + 4語はこのYAML固有)
Duration: 189.044s                      ← 尺は妥当か
```

## 4. 静止画で見た目を確認する（レンダリング前）

**レンダリングは高コスト**（2分の動画で約3分）。崩れは静止画で先に潰す。

```bash
# 代表フレームを1枚
npx remotion still src/index.ts <name> /tmp/check.png --frame=100
```

スライドごとの代表フレームを拾うと効率がいい。

```bash
python3 -c "
import json
d=json.load(open('src/generated/<name>.json')); fps=d['config']['fps']
seen=set()
for s in d['scenes']:
    i=s.get('slideIndex')
    if i and i not in seen:
        seen.add(i); print(round((s['startTime']+s['lipsyncData']['duration']*0.6)*fps))
"
```

よくある崩れ:

| 症状 | 原因 | 対処 |
|------|------|------|
| 冒頭タイトルがキャラに重なる | `opening.variant: center` でタイトルが長い | `band` か `minimal` にする |
| サムネイルの下半分が空く | `thumbnail.variant: split` に`image`が無い | `bold`にするか画像を足す |
| テロップがスライドに被る | スライドとテロップの組み合わせ | `subtitle`を変えるか`slide.variant`を変える |

プレビューで通しで見る場合:

```bash
npm run dev     # http://localhost:3000
```

**`src/generated/*.json` を更新したらRemotionサーバーの再起動が必要。**

## 5. 動画を書き出す

```bash
# 音声が生成済みなら --skip-generate で使い回す（速い）
npm run video -- scenes/<name>.yaml --skip-generate

# 音声生成からレンダリングまで一括
npm run video -- scenes/<name>.yaml
```

**複数本・長い動画はバックグラウンドで回す。** 目安は動画1分あたり1.5分前後。

```bash
for y in scenes/*.yaml; do
  npm run video -- "$y" --skip-generate
done
```

## 6. サムネイルを書き出す

`thumbnail:` を書いたYAMLだけ。

```bash
npm run thumbnail -- scenes/<name>.yaml   # output/<name>-thumbnail.png
```

## 作り直しの判断

**何を変えたかで、どこからやり直すかが決まる。**

| 変えたもの | 音声の再生成 | レンダリング |
|-----------|------------|------------|
| セリフ（`text`） | **必要** | 必要 |
| `speaker_id` / `voice`（話速・ピッチ） | **必要** | 必要 |
| `dict` | **必要** | 必要 |
| キャラクター（`character`） | **必要**（話者が変わる） | 必要 |
| 背景・テロップ・スライド・画像・効果音 | 不要 | 必要 |
| `character.json`の`placement`/`emotions`/`lipSyncOffset` | 不要 | 必要 |
| 描画側のコード（`src/`） | 不要 | 必要 |

音声が不要なら `--skip-generate` を使う。

**リップシンクの計算方法を変えた場合は全本作り直す**（`generate-voice-with-lipsync.sh`）。

## 困ったとき

| 症状 | 対処 |
|------|------|
| `キャラクター "xxx" が見つかりません` | `src/characters/<name>/character.json` と `registry.ts` の登録を確認 |
| `BGMファイルが見つかりません` | パスは`public/`からの相対。`local/`はgit管理外なので別環境では手動配置 |
| `辞書に登録できません` | 読みは**全角カタカナ**で書く |
| プレビューに反映されない | `src/generated/*.json` 更新後はRemotionサーバーを再起動 |
| 口パクがずれる | `.claude/rules/character.md` の「口パクのタイミング」を参照 |
| python3で落ちる | `scripts/lib.sh`の`resolve_python`が使えるものを探す |

## 変更が既存動画に影響しないか確かめる

描画側のコードを触ったときは、**変える意図がない動画**をレンダリングして比べる。

```bash
npx remotion still src/index.ts demo /tmp/before.png --frame=100
# 変更後
npx remotion still src/index.ts demo /tmp/after.png --frame=100
cmp /tmp/before.png /tmp/after.png && echo "一致（影響なし）"
```

見た目が変わらないはずの変更なら、**バイト単位で一致するべき**。
