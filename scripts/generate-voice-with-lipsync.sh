#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/lib.sh
source "$SCRIPT_DIR/lib.sh"

TEXT="${1:-こんにちは}"
SPEAKER_ID="${2:-3}"
OUTPUT_BASE="${3:-output}"
# 声の調整をJSONで受け取る（例: '{"pitchScale":0.08,"speedScale":1.05}'）
VOICE_PARAMS="${4:-}"
[ -z "$VOICE_PARAMS" ] && VOICE_PARAMS='{}'
ENGINE_URL="${VOICEVOX_ENGINE_URL:-http://127.0.0.1:50021}"

# 親スクリプトから呼ばれた場合は$PYTHONを引き継ぐ
resolve_python || exit 1

# 出力ファイル
WAV_FILE="${OUTPUT_BASE}.wav"
JSON_FILE="${OUTPUT_BASE}.json"

echo "==> Generating voice with lip sync data..."
echo "    Text: ${TEXT}"
echo "    Speaker ID: ${SPEAKER_ID}"
echo "    Output: ${WAV_FILE}, ${JSON_FILE}"

# Check if VOICEVOX Engine is running
if ! curl -fs "${ENGINE_URL}/version" >/dev/null 2>&1; then
    echo "ERROR: VOICEVOX Engine is not running at ${ENGINE_URL}"
    exit 1
fi

# Generate audio query (contains timing data)
QUERY=$(curl -s -X POST \
    "${ENGINE_URL}/audio_query?text=$(echo -n "$TEXT" | "$PYTHON" -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.stdin.read()))')&speaker=${SPEAKER_ID}" \
    -H "accept: application/json")

# 声の調整をクエリに反映する
# リップシンクも音声も同じクエリから作るので、ここで一度上書きすれば両方に効く
if [ "$VOICE_PARAMS" != '{}' ]; then
    QUERY=$(echo "$QUERY" | VOICE_PARAMS="$VOICE_PARAMS" "$PYTHON" -c '
import json
import os
import sys

query = json.load(sys.stdin)
params = json.loads(os.environ["VOICE_PARAMS"])

# VOICEVOXのaudio_queryが受け付ける調整項目だけを通す
LIMITS = {
    "speedScale": (0.5, 2.0),
    "pitchScale": (-0.15, 0.15),
    "intonationScale": (0.0, 2.0),
    "volumeScale": (0.0, 2.0),
}

for key, (low, high) in LIMITS.items():
    if params.get(key) is None:
        continue
    value = float(params[key])
    if not low <= value <= high:
        print(f"ERROR: {key}={value} は範囲外です ({low}〜{high})", file=sys.stderr)
        sys.exit(1)
    query[key] = value

print(json.dumps(query, ensure_ascii=False))
')
    echo "    Voice: ${VOICE_PARAMS}"
fi

# Extract lip sync data from query
echo "$QUERY" | "$PYTHON" -c "
import json
import sys

data = json.load(sys.stdin)
lipsync = []
current_time = 0

# accent_phrasesの長さは話速をかける前の値なので、ここで割って実時間に直す
# （speedScaleが既定の1.0なら何も変わらない）
speed = float(data.get('speedScale', 1.0)) or 1.0

# モーラの母音→母音キーの正規化（パーツ名への変換はキャラクター定義のmouthMapが行う）
# 大文字は無声化した母音。VOICEVOXはここに子音を入れてこないので、
# 'ん'は大文字のNだけ。な行の子音は小文字のnで別枠（下の子音の扱いを参照）
vowel_to_mouth = {
    'a': 'a',
    'A': 'a',
    'i': 'i',
    'I': 'i',
    'u': 'u',
    'U': 'u',
    'e': 'e',
    'E': 'e',
    'o': 'o',
    'O': 'o',
    'N': 'n',       # ん
    'cl': 'closed', # 促音
    'pau': 'closed', # ポーズ
}

# 唇を閉じてから発音する音（両唇音）。ここだけは子音の区間で口を閉じる
BILABIAL = {'m', 'my', 'p', 'py', 'b', 'by'}

for phrase in data.get('accent_phrases', []):
    for mora in phrase.get('moras', []):
        consonant = mora.get('consonant')
        consonant_len = (mora.get('consonant_length', 0) or 0) / speed
        vowel = mora.get('vowel', '')
        vowel_len = (mora.get('vowel_length', 0) or 0) / speed
        vowel_mouth = vowel_to_mouth.get(vowel, 'closed')

        # 子音部分
        # 両唇音以外は後ろに続く母音と同じ形にする。
        # 実際の発音でも口は母音に向かって動いているし、子音は1フレーム程度しか
        # ないことが多いため、専用の形にするとチラついて見える
        if consonant and consonant_len > 0:
            lipsync.append({
                'time': round(current_time, 3),
                'duration': round(consonant_len, 3),
                'phoneme': consonant,
                'mouth': 'closed' if consonant in BILABIAL else vowel_mouth
            })
            current_time += consonant_len

        # 母音部分
        if vowel and vowel_len > 0:
            mouth = vowel_to_mouth.get(vowel, 'closed')
            lipsync.append({
                'time': round(current_time, 3),
                'duration': round(vowel_len, 3),
                'phoneme': vowel,
                'mouth': mouth
            })
            current_time += vowel_len

    # フレーズ間のポーズ
    pause = phrase.get('pause_mora')
    if pause:
        pause_len = (pause.get('vowel_length', 0) or 0) / speed
        if pause_len > 0:
            lipsync.append({
                'time': round(current_time, 3),
                'duration': round(pause_len, 3),
                'phoneme': 'pau',
                'mouth': 'closed'
            })
            current_time += pause_len

# 最後に口を閉じるエントリを追加（0.1秒）
lipsync.append({
    'time': round(current_time, 3),
    'duration': 0.5,
    'phoneme': 'end',
    'mouth': 'closed'
})
current_time += 0.5

output = {
    'text': '${TEXT}',
    'speaker_id': ${SPEAKER_ID},
    'duration': round(current_time, 3),
    'lipsync': lipsync
}

print(json.dumps(output, ensure_ascii=False, indent=2))
" > "$JSON_FILE"

# Synthesize audio
curl -s -X POST \
    "${ENGINE_URL}/synthesis?speaker=${SPEAKER_ID}" \
    -H "accept: audio/wav" \
    -H "Content-Type: application/json" \
    -d "$QUERY" \
    -o "$WAV_FILE"

echo "==> Generated:"
echo "    Audio: ${WAV_FILE}"
echo "    Lip sync: ${JSON_FILE}"

# Show summary
"$PYTHON" -c "
import json
with open('${JSON_FILE}') as f:
    data = json.load(f)
print(f\"    Duration: {data['duration']}s\")
print(f\"    Phonemes: {len(data['lipsync'])}\")
"
