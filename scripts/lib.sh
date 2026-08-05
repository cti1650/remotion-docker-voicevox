#!/bin/bash
# 各スクリプトから source して使う共通処理

# 使えるpython3を探して $PYTHON に設定する
#
# asdf等のバージョン管理下では`python3`がshimになっていて、
# バージョン未設定だと "No version is set for command python3" で落ちる。
# 実際に動くものを順に試して、動いたものを使う。
#
# 引数: 必須モジュール名（省略可）。例: resolve_python yaml
resolve_python() {
    local required_module="${1:-}"
    local candidate

    # 親スクリプトが解決済みならそれを使う
    if [ -n "${PYTHON:-}" ] && _python_works "$PYTHON" "$required_module"; then
        return 0
    fi

    for candidate in python3 /usr/bin/python3 /opt/homebrew/bin/python3 python; do
        command -v "$candidate" >/dev/null 2>&1 || continue
        if _python_works "$candidate" "$required_module"; then
            PYTHON="$candidate"
            export PYTHON
            return 0
        fi
    done

    echo "ERROR: 使用できるpython3が見つかりません" >&2
    if [ "$required_module" = "yaml" ]; then
        echo "  PyYAMLが必要です: pip3 install pyyaml" >&2
    elif [ -n "$required_module" ]; then
        echo "  ${required_module}モジュールが必要です" >&2
    fi
    return 1
}

_python_works() {
    local py="$1"
    local module="${2:-}"
    if [ -n "$module" ]; then
        "$py" -c "import ${module}" >/dev/null 2>&1
    else
        "$py" -c "" >/dev/null 2>&1
    fi
}

# VOICEVOX Engineに接続できることを保証する
# 起動していなければ docker compose で起動し、応答するまで待つ
ensure_voicevox() {
    local engine_url="${VOICEVOX_ENGINE_URL:-http://127.0.0.1:50021}"
    local i

    if curl -fs "${engine_url}/version" >/dev/null 2>&1; then
        return 0
    fi

    # リモートのエンジンは起動できないのでそのままエラーにする
    if [[ "$engine_url" != *127.0.0.1* && "$engine_url" != *localhost* ]]; then
        echo "ERROR: VOICEVOX Engineに接続できません: ${engine_url}" >&2
        return 1
    fi

    if ! command -v docker >/dev/null 2>&1; then
        echo "ERROR: VOICEVOX Engineが起動していません (${engine_url})" >&2
        echo "  dockerが見つからないため自動起動できません。手動で起動してください" >&2
        return 1
    fi

    echo "==> VOICEVOX Engineを起動しています..."
    if ! docker compose up -d voicevox >/dev/null 2>&1; then
        echo "ERROR: docker compose up -d voicevox に失敗しました" >&2
        return 1
    fi

    # 初回はイメージのpullが走るので長めに待つ
    for i in $(seq 1 90); do
        if curl -fs "${engine_url}/version" >/dev/null 2>&1; then
            echo "    起動しました"
            return 0
        fi
        sleep 2
    done

    echo "ERROR: VOICEVOX Engineが応答しません (${engine_url})" >&2
    echo "  ログを確認してください: docker compose logs voicevox" >&2
    return 1
}
