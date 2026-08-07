#!/bin/bash
set -euo pipefail

# シーンYAMLから動画用データを自動生成するスクリプト
# 使い方:
#   ./scripts/generate-from-scenes.sh scenes/demo.yaml   # 特定のYAMLを処理
#   ./scripts/generate-from-scenes.sh                     # scenes/*.yamlをすべて処理

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# shellcheck source=scripts/lib.sh
source "$SCRIPT_DIR/lib.sh"

# 単一のYAMLを処理
process_yaml() {
    local yaml_file="$1"
    local basename=$(basename "$yaml_file" .yaml)
    # 生成物はpublic/audio/voice/配下にまとめる（ここは丸ごとgit管理外）
    local output_dir="public/audio/voice/${basename}"
    local generated_json="src/generated/${basename}.json"

    echo "==> Processing: $yaml_file"
    mkdir -p "$output_dir"

    # Export variables for Python
    export SCENES_FILE="$yaml_file"
    export OUTPUT_DIR="$output_dir"
    export GENERATED_JSON="$generated_json"
    export SCRIPT_DIR="$SCRIPT_DIR"
    export BASENAME="$basename"
    export ENGINE_URL="${VOICEVOX_ENGINE_URL:-http://127.0.0.1:50021}"
    export SHARED_DICT="config/voicevox-dict.json"

"$PYTHON" << 'PYTHON_SCRIPT'
import yaml
import subprocess
import json
import os
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

scenes_file = os.environ['SCENES_FILE']
output_dir = os.environ['OUTPUT_DIR']
generated_json = os.environ['GENERATED_JSON']
script_dir = os.environ['SCRIPT_DIR']
basename = os.environ['BASENAME']

# Read YAML
with open(scenes_file, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

default_pause = config.get('defaultPause', 0.5)
scenes = config.get('scenes', [])

# キャラクター定義（src/characters/<name>/character.json）
# 見た目はTypeScript側が読むが、話者IDはここでも要るので同じファイルを見る
DEFAULT_CHARACTER = 'zundamon'
character_name = config.get('character', DEFAULT_CHARACTER)
character_file = os.path.join('src', 'characters', character_name, 'character.json')

if not os.path.isfile(character_file):
    available = sorted(
        d for d in os.listdir('src/characters')
        if os.path.isfile(os.path.join('src/characters', d, 'character.json'))
    )
    print(f"ERROR: キャラクター \"{character_name}\" が見つかりません: {character_file}")
    print(f"  登録済み: {' / '.join(available)}")
    print("  静止画から作るには scripts/create-character.py を使ってください")
    sys.exit(1)

with open(character_file, 'r', encoding='utf-8') as f:
    character = json.load(f)

# 話者IDはYAMLで上書きできる（省略時はキャラクターの既定値）
character_voice = character['voice']
speaker_id = config.get('speaker_id', character_voice['defaultSpeakerId'])

# 声の調整もキャラクターの既定値をYAMLの`voice:`で上書きできる
VOICE_PARAM_KEYS = ('speedScale', 'pitchScale', 'intonationScale', 'volumeScale')
voice_params = {
    key: value for key, value in character_voice.items()
    if key in VOICE_PARAM_KEYS and value is not None
}
voice_params.update({
    key: value for key, value in (config.get('voice') or {}).items()
    if key in VOICE_PARAM_KEYS and value is not None
})

print(f"  キャラクター: {character.get('displayName', character_name)} "
      f"(話者ID: {speaker_id})")
if voice_params:
    print(f"  声の調整: {voice_params}")

engine_url = os.environ['ENGINE_URL']
shared_dict_file = os.environ['SHARED_DICT']


def engine_request(path, method='GET', params=None):
    url = engine_url + path
    if params:
        url += '?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, method=method)
    req.add_header('accept', 'application/json')
    with urllib.request.urlopen(req) as res:
        body = res.read()
    return json.loads(body) if body else None


# 辞書は「読みを直すための上書き」なので、内蔵辞書に必ず勝たせる。
# デフォルトのpriority=5だと日本語の複合語（例: 複数人）が
# 内蔵辞書の分割に負けて登録した読みが効かない
DEFAULT_PRIORITY = 10


def build_dict_entries():
    """共有辞書とYAMLの辞書をまとめる（同じ語はYAML側が勝つ）

    VOICEVOXは表記を全角に正規化して保持するため、
    重複判定はNFKC正規化した表記で行う。
    """
    entries = {}

    def put(surface, value):
        key = unicodedata.normalize('NFKC', str(surface))
        if isinstance(value, dict):
            entries[key] = {
                'pronunciation': value['pronunciation'],
                'accent_type': value.get('accent_type', 0),
                'priority': value.get('priority', DEFAULT_PRIORITY),
            }
        else:
            entries[key] = {
                'pronunciation': str(value),
                'accent_type': 0,
                'priority': DEFAULT_PRIORITY,
            }

    if os.path.isfile(shared_dict_file):
        with open(shared_dict_file, 'r', encoding='utf-8') as f:
            for word in json.load(f):
                put(word['surface'], word)

    for surface, value in (config.get('dict') or {}).items():
        put(surface, value)

    return entries


def apply_dict(entries):
    """エンジンのユーザー辞書を毎回作り直す

    エンジンの辞書はグローバルかつコンテナを作り直すと消えるため、
    共有辞書とYAMLの辞書だけを正として総入れ替えする。
    """
    current = engine_request('/user_dict') or {}
    for uuid in current:
        engine_request(f'/user_dict_word/{uuid}', method='DELETE')

    for surface, word in entries.items():
        try:
            engine_request('/user_dict_word', method='POST', params={
                'surface': surface,
                'pronunciation': word['pronunciation'],
                'accent_type': word['accent_type'],
                'priority': word['priority'],
            })
        except urllib.error.HTTPError as e:
            print(f"ERROR: 辞書に登録できません: {surface} → {word['pronunciation']}")
            print(f"  読みは全角カタカナで指定してください ({e.code})")
            sys.exit(1)


dict_entries = build_dict_entries()
apply_dict(dict_entries)
if dict_entries:
    print(f"  辞書: {len(dict_entries)}語を登録 "
          f"(共有 + {len(config.get('dict') or {})}語はこのYAML固有)")

# BGMの置き場所チェック
# 再配布できない素材をコミットしてしまわないよう、生成時に気付けるようにする
bgm = config.get('bgm')
if bgm:
    bgm_src = bgm if isinstance(bgm, str) else bgm.get('src', '')
    if bgm_src.startswith(('http://', 'https://')):
        print(f"  BGM: {bgm_src} (URL参照)")
    else:
        bgm_path = os.path.join('public', bgm_src)
        if not os.path.isfile(bgm_path):
            print(f"ERROR: BGMファイルが見つかりません: {bgm_path}")
            if 'audio/bgm/local/' in bgm_src:
                print("  local/はgit管理外です。配布元からダウンロードして配置してください")
            sys.exit(1)
        if 'audio/bgm/local/' not in bgm_src:
            print(f"  BGM: {bgm_src}")
            print("  ※ここはコミット対象です。再配布が禁止されている素材は")
            print("    public/audio/bgm/local/ に置いてください")


def collect_se_sources():
    """YAML中の効果音の指定を全部集める（重複は除く）"""
    sources = []

    def add(value):
        if not value:
            return
        src = value if isinstance(value, str) else value.get('src', '')
        if src and src not in sources:
            sources.append(src)

    add(config.get('defaultSe'))
    add((config.get('opening') or {}).get('se'))
    for scene in scenes:
        add(scene.get('se'))
        add((scene.get('slide') or {}).get('se'))
    return sources


# 効果音もBGMと同じく、再配布できない素材をコミットしないようチェックする
se_sources = collect_se_sources()
if se_sources:
    committed = [s for s in se_sources
                 if not s.startswith(('http://', 'https://')) and 'audio/se/local/' not in s]
    for se_src in se_sources:
        if se_src.startswith(('http://', 'https://')):
            continue
        se_path = os.path.join('public', se_src)
        if not os.path.isfile(se_path):
            print(f"ERROR: 効果音ファイルが見つかりません: {se_path}")
            if 'audio/se/local/' in se_src:
                print("  local/はgit管理外です。配布元からダウンロードして配置してください")
            sys.exit(1)
    print(f"  効果音: {len(se_sources)}種類")
    if committed:
        print("  ※ここはコミット対象です。再配布が禁止されている素材は")
        print("    public/audio/se/local/ に置いてください")


def generate_voice(text, output_base):
    """1つのセリフから音声とリップシンクを作る"""
    result = subprocess.run(
        [f'{script_dir}/generate-voice-with-lipsync.sh', text, str(speaker_id),
         output_base, json.dumps(voice_params)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"ERROR generating {output_base}: {result.stderr}")
        sys.exit(1)
    with open(f"{output_base}.json", 'r', encoding='utf-8') as f:
        return json.load(f)


# オープニング（本編の前のタイトル演出）
# textがあれば音声を生成して尺を音声に合わせる。無ければdurationで固定
generated_opening = None
opening = config.get('opening')
if opening:
    generated_opening = dict(opening)
    if opening.get('text'):
        print("  オープニングの音声を生成...")
        base = f"{output_dir}/opening"
        lipsync = generate_voice(opening['text'], base)
        generated_opening['audioFile'] = f"audio/voice/{basename}/opening.wav"
        generated_opening['lipsyncData'] = lipsync
        generated_opening['duration'] = round(
            lipsync['duration'] + opening.get('pause', 0.6), 3)
    else:
        generated_opening['duration'] = round(opening.get('duration', 3), 3)
    print(f"  オープニング: {generated_opening['duration']}s")

generated_scenes = []
# 開始前のマージン。オープニングがあればその後ろから本編を始める
current_time = (generated_opening['duration'] if generated_opening else 0) + 0.5

# スライドは明示的に切り替えるまで次のシーンへ引き継ぐ
current_slide = None
slide_index = 0

print(f"  Processing {len(scenes)} scenes...")

for i, scene in enumerate(scenes):
    text = scene['text']
    output_base = f"{output_dir}/scene_{i+1:03d}"

    print(f"    Scene {i+1}: {text[:30]}...")

    lipsync_data = generate_voice(text, output_base)

    # Build generated scene
    pause = scene.get('pause', default_pause)
    generated_scene = {
        'text': text,
        'emotion': scene.get('emotion', 'normal'),
        'audioFile': f"audio/voice/{basename}/scene_{i+1:03d}.wav",
        'lipsyncData': lipsync_data,
        'startTime': round(current_time, 3),
        'pause': pause,
    }

    # スライドの切り替え（未指定なら直前のスライドを継続、nullで非表示に戻す）
    if 'slide' in scene:
        if scene['slide'] is None:
            current_slide = None
        else:
            current_slide = scene['slide']
            slide_index += 1

    if current_slide:
        generated_scene['slide'] = current_slide
        generated_scene['slideIndex'] = slide_index

    # シーンのcharacterは「出すか出さないか」の真偽値。
    # トップレベルのcharacter（キャラクターID）と紛らわしいので、
    # 文字列を書かれたら黙って無視せずここで止める
    if 'character' in scene and not isinstance(scene['character'], bool):
        print(f"ERROR: scene {i+1} の character は true/false で書いてください "
              f"(指定値: {scene['character']!r})")
        print("  キャラクターを変えるのはYAMLのトップレベルだけです。"
              "動画の途中では切り替えられません")
        sys.exit(1)

    # Optional fields
    for key in ('background', 'image', 'highlight', 'subtitle', 'se', 'character'):
        if key in scene:
            generated_scene[key] = scene[key]

    generated_scenes.append(generated_scene)
    current_time += lipsync_data['duration'] + pause

# Build final output
output = {
    'id': basename,
    'config': {
        'title': config.get('title', basename),
        # 既定値が将来変わっても古いJSONの見た目が変わらないよう、常に書き出す
        'character': character_name,
        'speaker_id': speaker_id,
        **({'voice': voice_params} if voice_params else {}),
        'fps': config.get('fps', 30),
        'width': config.get('width', 1920),
        'height': config.get('height', 1080),
        'defaultBackground': config.get('defaultBackground', 'gradient'),
        'defaultPause': default_pause,
        # テロップ・スライドの見た目（未指定ならコンポーネント側のデフォルト）
        **{k: config[k] for k in ('defaultSubtitle', 'defaultSlideVariant', 'defaultSe') if k in config},
        **({'bgm': config['bgm']} if 'bgm' in config else {}),
        **({'opening': generated_opening} if generated_opening else {}),
        **({'thumbnail': config['thumbnail']} if 'thumbnail' in config else {}),
    },
    'scenes': generated_scenes,
    'totalDuration': round(current_time + 0.5, 3),
}

# Write generated JSON
os.makedirs(os.path.dirname(generated_json), exist_ok=True)
with open(generated_json, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"  Generated: {generated_json}")
print(f"  Duration: {output['totalDuration']}s")
PYTHON_SCRIPT
}

# メイン処理
main() {
    cd "$PROJECT_DIR"
    resolve_python yaml || exit 1
    ensure_voicevox || exit 1

    if [ $# -gt 0 ]; then
        # 引数で指定されたファイルを処理
        for yaml_file in "$@"; do
            if [ -f "$yaml_file" ]; then
                process_yaml "$yaml_file"
            else
                echo "ERROR: File not found: $yaml_file"
                exit 1
            fi
        done
    else
        # scenes/*.yamlをすべて処理
        local count=0
        for yaml_file in scenes/*.yaml; do
            if [ -f "$yaml_file" ]; then
                process_yaml "$yaml_file"
                ((count++))
            fi
        done

        if [ $count -eq 0 ]; then
            echo "No YAML files found in scenes/"
            exit 1
        fi

        echo ""
        echo "==> Processed $count video(s)"
    fi

    # Root.tsxを更新
    echo ""
    echo "==> Updating Root.tsx imports..."
    "$PYTHON" << 'PYTHON_UPDATE'
import os
import re
from pathlib import Path

generated_dir = Path('src/generated')
root_file = Path('src/Root.tsx')

# 生成されたJSONファイルを取得
json_files = sorted([f.stem for f in generated_dir.glob('*.json')])

if not json_files:
    print("  No generated videos found")
    exit(0)

# インポート文を生成
imports = []
array_items = []
for name in json_files:
    var_name = name.replace('-', '_').replace('.', '_') + "Data"
    imports.append(f'import * as {var_name} from "./generated/{name}.json";')
    array_items.append(f"  {var_name} as unknown as GeneratedVideoData,")

import_block = "\n".join(imports)
array_block = ",\n".join([f"  {name.replace('-', '_').replace('.', '_')}Data as unknown as GeneratedVideoData" for name in json_files])

# Root.tsxを読み込み
with open(root_file, 'r', encoding='utf-8') as f:
    content = f.read()

# インポート部分を更新
import_pattern = r'// 生成された動画データを直接インポート.*?(?=\n\n// インポートした動画データを配列化)'
new_import = f'''// 生成された動画データを直接インポート
// generate-from-scenes.sh実行時に自動更新
{import_block}'''

content = re.sub(import_pattern, new_import, content, flags=re.DOTALL)

# 配列部分を更新
array_pattern = r'const generatedVideos: GeneratedVideoData\[\] = \[.*?\]\.filter'
new_array = f'''const generatedVideos: GeneratedVideoData[] = [
{array_block},
].filter'''

content = re.sub(array_pattern, new_array, content, flags=re.DOTALL)

# 書き戻し
with open(root_file, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"  Updated with {len(json_files)} video(s): {', '.join(json_files)}")
PYTHON_UPDATE

    echo ""
    echo "==> Done! Run 'npm run dev' to preview"
    echo ""
    echo "To render:"
    echo "  ./scripts/render-video.sh scenes/<name>.yaml"
}

main "$@"
