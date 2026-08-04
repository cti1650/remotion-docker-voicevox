#!/bin/bash
set -euo pipefail

# シーンYAMLから動画用データを自動生成するスクリプト
# 使い方:
#   ./scripts/generate-from-scenes.sh scenes/demo.yaml   # 特定のYAMLを処理
#   ./scripts/generate-from-scenes.sh                     # scenes/*.yamlをすべて処理

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENGINE_URL="${VOICEVOX_ENGINE_URL:-http://127.0.0.1:50021}"

# Check VOICEVOX Engine
check_voicevox() {
    if ! curl -fs "${ENGINE_URL}/version" >/dev/null 2>&1; then
        echo "ERROR: VOICEVOX Engine is not running at ${ENGINE_URL}"
        echo "Run: docker compose up -d voicevox"
        exit 1
    fi
}

# 単一のYAMLを処理
process_yaml() {
    local yaml_file="$1"
    local basename=$(basename "$yaml_file" .yaml)
    local output_dir="public/audio/${basename}"
    local generated_json="src/generated/${basename}.json"

    echo "==> Processing: $yaml_file"
    mkdir -p "$output_dir"

    # Export variables for Python
    export SCENES_FILE="$yaml_file"
    export OUTPUT_DIR="$output_dir"
    export GENERATED_JSON="$generated_json"
    export SCRIPT_DIR="$SCRIPT_DIR"
    export BASENAME="$basename"

python3 << 'PYTHON_SCRIPT'
import yaml
import subprocess
import json
import os
import sys

scenes_file = os.environ['SCENES_FILE']
output_dir = os.environ['OUTPUT_DIR']
generated_json = os.environ['GENERATED_JSON']
script_dir = os.environ['SCRIPT_DIR']
basename = os.environ['BASENAME']

# Read YAML
with open(scenes_file, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

speaker_id = config.get('speaker_id', 3)
default_pause = config.get('defaultPause', 0.5)
scenes = config.get('scenes', [])

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

generated_scenes = []
current_time = 0.5  # 開始前のマージン

# スライドは明示的に切り替えるまで次のシーンへ引き継ぐ
current_slide = None
slide_index = 0

print(f"  Processing {len(scenes)} scenes...")

for i, scene in enumerate(scenes):
    text = scene['text']
    output_base = f"{output_dir}/scene_{i+1:03d}"

    print(f"    Scene {i+1}: {text[:30]}...")

    # Generate audio + lipsync
    result = subprocess.run(
        [f'{script_dir}/generate-voice-with-lipsync.sh', text, str(speaker_id), output_base],
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"ERROR generating scene {i+1}: {result.stderr}")
        sys.exit(1)

    # Read generated lipsync data
    json_file = f"{output_base}.json"
    with open(json_file, 'r', encoding='utf-8') as f:
        lipsync_data = json.load(f)

    # Build generated scene
    pause = scene.get('pause', default_pause)
    generated_scene = {
        'text': text,
        'emotion': scene.get('emotion', 'normal'),
        'audioFile': f"audio/{basename}/scene_{i+1:03d}.wav",
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

    # Optional fields
    if 'background' in scene:
        generated_scene['background'] = scene['background']
    if 'image' in scene:
        generated_scene['image'] = scene['image']
    if 'highlight' in scene:
        generated_scene['highlight'] = scene['highlight']

    generated_scenes.append(generated_scene)
    current_time += lipsync_data['duration'] + pause

# Build final output
output = {
    'id': basename,
    'config': {
        'title': config.get('title', basename),
        'speaker_id': speaker_id,
        'fps': config.get('fps', 30),
        'width': config.get('width', 1920),
        'height': config.get('height', 1080),
        'defaultBackground': config.get('defaultBackground', 'gradient'),
        'defaultPause': default_pause,
        **({'bgm': config['bgm']} if 'bgm' in config else {}),
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
    check_voicevox

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
    python3 << 'PYTHON_UPDATE'
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
