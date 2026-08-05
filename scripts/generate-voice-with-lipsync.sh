#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/lib.sh
source "$SCRIPT_DIR/lib.sh"

TEXT="${1:-こんにちは}"
SPEAKER_ID="${2:-3}"
OUTPUT_BASE="${3:-output}"
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

# Extract lip sync data from query
echo "$QUERY" | "$PYTHON" -c "
import json
import sys

data = json.load(sys.stdin)
lipsync = []
current_time = 0

# 音素→母音キーの正規化（パーツ名への変換はsrc/hooks/useLipSync.ts側で行う）
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
    'N': 'n',      # ん
    'n': 'n',
    'cl': 'closed', # 促音
    'pau': 'closed', # ポーズ
}

for phrase in data.get('accent_phrases', []):
    for mora in phrase.get('moras', []):
        consonant = mora.get('consonant')
        consonant_len = mora.get('consonant_length', 0) or 0
        vowel = mora.get('vowel', '')
        vowel_len = mora.get('vowel_length', 0) or 0

        # 子音部分（口は閉じ気味または前の形を維持）
        if consonant and consonant_len > 0:
            lipsync.append({
                'time': round(current_time, 3),
                'duration': round(consonant_len, 3),
                'phoneme': consonant,
                'mouth': 'closed' if consonant in ['m', 'p', 'b'] else 'n'
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
        pause_len = pause.get('vowel_length', 0) or 0
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
