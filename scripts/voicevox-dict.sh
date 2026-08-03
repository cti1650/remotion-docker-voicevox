#!/bin/bash
set -euo pipefail

ENGINE_URL="${VOICEVOX_ENGINE_URL:-http://127.0.0.1:50021}"
DICT_FILE="${1:-config/voicevox-dict.json}"

usage() {
    echo "Usage: voicevox-dict.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  list                    - Show all dictionary entries"
    echo "  add <word> <reading>    - Add a word (reading in katakana)"
    echo "  delete <word>           - Delete a word"
    echo "  export [file]           - Export dictionary to JSON file"
    echo "  import [file]           - Import dictionary from JSON file"
    echo ""
    echo "Examples:"
    echo "  voicevox-dict.sh add Remotion リモーション"
    echo "  voicevox-dict.sh export config/voicevox-dict.json"
}

list_dict() {
    curl -s "${ENGINE_URL}/user_dict" | python3 -c "
import json,sys
d = json.load(sys.stdin)
if not d:
    print('(empty)')
else:
    for k,v in d.items():
        print(f\"{v['surface']} → {v['pronunciation']}\")
"
}

add_word() {
    local word="$1"
    local reading="$2"
    local encoded_reading=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$reading'))")

    result=$(curl -s -X POST "${ENGINE_URL}/user_dict_word?surface=${word}&pronunciation=${encoded_reading}&accent_type=0" \
        -H "accept: application/json")

    if [[ "$result" == *"uuid"* ]] || [[ "$result" == \"*\" ]]; then
        echo "Added: ${word} → ${reading}"
    else
        echo "Error: $result"
        exit 1
    fi
}

delete_word() {
    local word="$1"

    # Find UUID for the word
    uuid=$(curl -s "${ENGINE_URL}/user_dict" | python3 -c "
import json,sys
d = json.load(sys.stdin)
for k,v in d.items():
    if v['surface'] == '$word':
        print(k)
        break
")

    if [ -z "$uuid" ]; then
        echo "Word not found: $word"
        exit 1
    fi

    curl -s -X DELETE "${ENGINE_URL}/user_dict_word/${uuid}"
    echo "Deleted: $word"
}

export_dict() {
    local file="${1:-config/voicevox-dict.json}"
    mkdir -p "$(dirname "$file")"

    curl -s "${ENGINE_URL}/user_dict" | python3 -c "
import json,sys
d = json.load(sys.stdin)
words = [{'surface': v['surface'], 'pronunciation': v['pronunciation'], 'accent_type': v.get('accent_type', 0)} for v in d.values()]
print(json.dumps(words, ensure_ascii=False, indent=2))
" > "$file"

    echo "Exported to: $file"
}

import_dict() {
    local file="${1:-config/voicevox-dict.json}"

    if [ ! -f "$file" ]; then
        echo "File not found: $file"
        exit 1
    fi

    python3 -c "
import json
import urllib.request
import urllib.parse

with open('$file') as f:
    words = json.load(f)

for w in words:
    surface = urllib.parse.quote(w['surface'])
    pronunciation = urllib.parse.quote(w['pronunciation'])
    accent_type = w.get('accent_type', 0)

    url = f'${ENGINE_URL}/user_dict_word?surface={surface}&pronunciation={pronunciation}&accent_type={accent_type}'
    req = urllib.request.Request(url, method='POST')
    req.add_header('accept', 'application/json')

    try:
        urllib.request.urlopen(req)
        print(f'Imported: {w[\"surface\"]} → {w[\"pronunciation\"]}')
    except Exception as e:
        print(f'Error importing {w[\"surface\"]}: {e}')
"
}

# Main
case "${1:-list}" in
    list)
        list_dict
        ;;
    add)
        if [ $# -lt 3 ]; then
            echo "Usage: voicevox-dict.sh add <word> <reading>"
            exit 1
        fi
        add_word "$2" "$3"
        ;;
    delete)
        if [ $# -lt 2 ]; then
            echo "Usage: voicevox-dict.sh delete <word>"
            exit 1
        fi
        delete_word "$2"
        ;;
    export)
        export_dict "${2:-config/voicevox-dict.json}"
        ;;
    import)
        import_dict "${2:-config/voicevox-dict.json}"
        ;;
    -h|--help|help)
        usage
        ;;
    *)
        echo "Unknown command: $1"
        usage
        exit 1
        ;;
esac
