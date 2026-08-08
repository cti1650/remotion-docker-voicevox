# 素材のライセンスと置き場所

BGM・効果音・立ち絵・画像を追加するときの決まり。
**AI向けの詳細な判断基準は `.claude/rules/assets.md` にある。**

## いちばん大事なこと

**公開リポジトリへのコミットは「再配布」にあたる。**
日本語のフリー素材サイトは「商用利用OK」でも、素材ファイルそのものの
再配布は禁止していることが多い。この場合はコミットできない。

## 置き場所

再配布の可否で分ける。

| 置き場所 | 用途 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | 再配布OK（CC0・CC BY・パブリックドメインなど） | する |
| `public/audio/bgm/local/` | **再配布NG**（DOVA-SYNDROME・魔王魂・購入音源など） | しない |
| `public/audio/se/` | 再配布OK | する |
| `public/audio/se/local/` | **再配布NG**（効果音ラボ・魔王魂など） | しない |
| `public/images/` | 再配布OK | する |
| `public/parts/<name>/` | 再配布OK（立ち絵パーツ） | する |

`local/` は `.gitignore` で除外してあるので、`git add -A` しても混入しない。
**迷ったら `local/` に置けば規約違反にはならない。**

`local/` の素材を使う場合、別環境では手動でダウンロードして配置する必要がある。

## 使う前に確認すること

配布元の規約ページを開いて、次の5つを確認する。

1. **商用利用が可能か** — 満たさないなら使わない
2. **再配布が可能か** — 満たさないなら `local/` へ
3. **改変が可能か** — 切り出し・リサイズ・音量調整をするなら必要
4. **クレジット表記の条件を満たせるか** — 満たせないなら使わない
5. **用途の制限に抵触しないか** — 素材集としての配布禁止、AI学習禁止など

まとめ記事ではなく、**必ず配布元の規約を読む**。

## 同梱している素材

| 素材 | ソース | ライセンス |
|------|--------|-----------|
| 効果音6種 | [Kenney](https://kenney.nl/) | CC0（表記不要） |
| BGM | [Incompetech](https://incompetech.com/) (Kevin MacLeod) | CC BY 4.0（**表記必須**） |
| presenterの立ち絵 | [Avataaars](https://avataaars.com/) (Pablo Stanley) | MIT |

各ディレクトリの `CREDITS.md` に詳細がある。

## 探すときの候補

**この一覧は候補であって制限ではない。** 上の5条件を満たせば他のソースも使ってよい。

| 種類 | 候補 |
|------|------|
| 効果音 | [Kenney](https://kenney.nl/)（CC0）、[OtoLogic](https://otologic.jp/)（CC BY）、[Freesound](https://freesound.org/)（ファイル毎） |
| BGM | [Incompetech](https://incompetech.com/)（CC BY）、[OtoLogic](https://otologic.jp/)（CC BY） |
| 写真 | [Unsplash](https://unsplash.com/license)、[Pexels](https://www.pexels.com/license/) |
| イラスト | [unDraw](https://undraw.co/license)、[Open Peeps](https://www.openpeeps.com/)（CC0） |
| 立ち絵 | [Avataaars](https://avataaars.com/)（MIT）、[Open Peeps](https://www.openpeeps.com/)（CC0） |

Freesound と Wikimedia Commons は**ファイルごとにライセンスが違う**ので、
1つずつ確認する。

## クレジットの書き方

動画末尾に自動表示される。CC BY などは表記が**義務**なので省略しない。

```yaml
# BGM（シーンYAML）
bgm:
  src: "audio/bgm/carefree-kevin-macleod.mp3"
  credit: "BGM: Carefree - Kevin MacLeod (incompetech.com) / CC BY 4.0"
```

```json
// 声・立ち絵（src/characters/<name>/character.json）
"credits": ["VOICEVOX:ずんだもん", "立ち絵素材: 坂本アヒル"]
```

キャラクターのクレジットは、**動画に出てきた全キャラクターぶんが自動で並ぶ**。

## VOICEVOXの声

**話者ごとに規約が違う。** 話者IDで決め打ちせず、必ず確認する。
エンジンが公式の規約文を同梱している。

```bash
# 話者を特定する
curl -s http://localhost:50021/speakers | jq -r '.[] | . as $s | .styles[] | "\(.id) \($s.name)/\(.name) \($s.speaker_uuid)"'

# その話者の規約を読む
curl -s "http://localhost:50021/speaker_info?speaker_uuid=<UUID>" | jq -r .policy
```

確認するのは次の3点。

- クレジットの**正確な表記**（`VOICEVOX:キャラクター名` の形式）
- 商用利用の可否
- **法人が関わる場合の追加条件**（話者によっては事前確認が必要）

## 気をつける点

- パブリックドメインの**楽曲**と、その**録音**は別。楽曲がPDでも演奏・録音には
  別途権利があることが多い
- 生成AIの出力は、学習元の権利が不明なまま素材として使わない
- URLで直接参照する場合、配布元が直リンク（ホットリンク）を禁止していないか確認する
