# CLAUDE.md

Remotion + VOICEVOXでキャラクター動画を作成するプロジェクト。
YAMLでシーンを定義するだけで、音声・リップシンク・動画を自動生成。

## クイックスタート

```bash
npm run video -- scenes/demo.yaml   # 音声生成→レンダリングを一括実行
```

VOICEVOXは止まっていれば自動起動する（`scripts/lib.sh`の`ensure_voicevox`）。

```bash
npm run voice -- scenes/demo.yaml                  # 音声・リップシンクのみ
npm run dev                                        # プレビュー
npm run video -- scenes/demo.yaml --skip-generate  # レンダリングのみ
npm run voicevox:down                              # VOICEVOX停止
```

## ディレクトリ

```
scenes/                    # シーン定義YAML
src/generated/             # 生成されたシーンJSON（自動更新）
src/components/            # Remotionコンポーネント
src/types/scene.ts         # シーン型定義・表情プリセット
public/parts/zundamon_en/  # パーツ画像（英語名）
public/audio/bgm/          # BGM（手で配置・git管理する）
public/audio/voice/        # 生成された音声(.wav)+リップシンク(.json) ※git管理外
scripts/                   # ユーティリティ
```

`public/audio/voice/` は`.gitignore`で丸ごと除外している（再生成できるため）。
clone直後は `npm run voice` を実行しないと音声が鳴らない。

## ワークフロー

1. `scenes/` にYAMLを作成
2. `npm run video -- scenes/<name>.yaml` で `output/<name>.mp4` まで生成

途中で確認したいときは `npm run voice -- scenes/<name>.yaml` → `npm run dev` →
`npm run video -- scenes/<name>.yaml --skip-generate` に分けて実行する。

## シーンYAML構造

```yaml
title: "動画タイトル"
speaker_id: 3
dict:                 # オプション（この動画だけの読み。生成時に自動適用）
  Cosense: コセンス
  複数人: フクスウニン
bgm:                  # オプション（動画全体にループ再生）
  src: "audio/bgm/carefree-kevin-macleod.mp3"
  volume: 0.10

scenes:
  - text: "セリフ"
    emotion: happy      # normal/happy/sad/angry/surprised/thinking/smug/tired
    background: purple  # gradient/purple/blue/green/orange/pink/dark/white
    image:              # オプション
      src: "images/sample.png"
      position: "top-right"
    slide:              # オプション（スライド解説形式）
      title: "タイトル"
      bullets: ["項目1", "項目2"]
      image: "images/flow.png"  # オプション
      imageLayout: split        # split=箇条書きの右 / stack=下
    highlight: 1        # 箇条書きの強調（1始まり）
```

スライドは指定したシーン以降も継続表示される（`slide: null`で消える）。
サンプル: `scenes/slide-demo.yaml`

## 重要な知見

- **Root.tsx**: generate-from-scenes.sh実行時に自動更新
- **python3**: `scripts/lib.sh`の`resolve_python`が使えるものを探す
  （asdf等でshimがバージョン未設定だと素の`python3`は落ちるため）
- **コンポジション**: `SceneVideo`（YAML由来）のみ。手書きの`MyComposition`は廃止済み
- **口のデフォルト**: `closed`（`むふ`から抽出）
- **PSD抽出**: `layer.topil()`使用
- **リップシンク**: JSONの最後に`end`エントリが自動追加
- **辞書**: 生成のたびに`config/voicevox-dict.json`+YAMLの`dict`で総入れ替え。
  日本語の複合語は`priority=10`でないと内蔵辞書に負ける（詳細は`.claude/rules/voicevox.md`）
- **読みの確認**: セリフは字幕にもなるので、カタカナ書きで誤読を回避しない。
  `audio_query`の`kana`で読みを事前確認して辞書で直す
- **JSON更新後**: Remotionサーバー再起動が必要

## クレジット

- VOICEVOX:ずんだもん
- 立ち絵素材: 坂本アヒル
