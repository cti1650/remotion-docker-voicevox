# BGM素材のクレジット

BGMは再配布の可否で置き場所を分ける。

| 置き場所 | 用途 | git管理 |
|----------|------|---------|
| `public/audio/bgm/` | 再配布が許可されている素材（CC BY、パブリックドメインなど） | する |
| `public/audio/bgm/local/` | 再配布が禁止されている素材（DOVA-SYNDROME・魔王魂・購入音源など） | **しない** |

このディレクトリに置く音源は、**再配布が許可されているものだけ**をコミットし、
下記にライセンスを追記する。

## carefree-kevin-macleod.mp3

- 曲名: Carefree
- 作者: Kevin MacLeod (https://incompetech.com/)
- ライセンス: [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/)
- 入手元: https://archive.org/details/KevinMacLeod_2019-04_Discography

CC BY 4.0は表示義務があるため、動画内に以下のクレジットを表示する
（`scenes/*.yaml`の`bgm.credit`に書けば末尾に自動表示される）。

```
BGM: Carefree - Kevin MacLeod (incompetech.com) / CC BY 4.0
```

## 音源を追加するとき

配布元の規約を確認して置き場所を決める。

- **再配布OK** → このディレクトリに置き、上記の形式でライセンスを追記する
- **再配布NG** → `local/`に置く（git管理外。詳細は`local/README.md`）

判断に迷う場合は`local/`に置いておけば、少なくとも規約違反にはならない。
