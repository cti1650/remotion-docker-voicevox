# Dockerとエンジンの管理

`npm run video` / `npm run voice` がVOICEVOXを自動起動するため、通常は以下の操作は不要。
手動で管理したい場合や、トラブル時に使う。

## 初期設定

```bash
# イメージのダウンロード（初回のみ、数GBあるので時間がかかる）
docker compose pull

# または起動時に自動でダウンロード
docker compose up -d voicevox
```

## 起動

```bash
# VOICEVOXエンジンを起動（バックグラウンド）
docker compose up -d voicevox

# 起動確認
curl http://localhost:50021/version
```

## 停止

```bash
# コンテナを停止（データは保持）
docker compose stop

# または完全に削除（コンテナのみ、ボリュームは保持）
docker compose down
```

## データクリア

```bash
# コンテナとボリューム（辞書データ等）を完全削除
docker compose down -v

# イメージも含めて完全削除（再ダウンロードが必要になる）
docker compose down -v --rmi all

# 未使用のDockerリソースを一括クリーンアップ
docker system prune -a
```

## トラブルシューティング

```bash
# ログ確認
docker compose logs voicevox

# コンテナの状態確認
docker compose ps

# コンテナを再起動
docker compose restart voicevox
```

## エンジンの設定

VOICEVOXエンジンは http://localhost:50021 で動作。

```bash
# 話者一覧確認
curl http://localhost:50021/speakers | jq
```

主な話者ID:
- 3: ずんだもん（ノーマル）
- 1: 四国めたん
- 8: 春日部つむぎ
