#!/usr/bin/env node
// VOICEVOXのユーザー辞書を直接見る・触る（デバッグ用）
//
//   node scripts/dict.mjs list                     # 今エンジンに入っている語
//   node scripts/dict.mjs add Remotion リモーション  # 一時的に足す
//   node scripts/dict.mjs clear                    # 全部消す
//
// 通常この操作は不要。辞書は生成のたびに
// config/voicevox-dict.json + シーンYAMLの dict: で総入れ替えされる。
// ここで足した語は次回の生成時に消えるので、残したい語は上の2箇所に書く。

import { ensureVoicevox, engineRequest } from "./lib.mjs";

const [command, ...args] = process.argv.slice(2);

await ensureVoicevox();

switch (command) {
  case "list": {
    const dict = (await engineRequest("/user_dict")) ?? {};
    const words = Object.values(dict);
    if (!words.length) {
      console.log("辞書は空です");
      break;
    }
    console.log(`${words.length}語:`);
    for (const w of words.sort((a, b) => a.surface.localeCompare(b.surface, "ja"))) {
      console.log(
        `  ${w.surface}  →  ${w.pronunciation}  (accent=${w.accent_type}, priority=${w.priority})`
      );
    }
    break;
  }

  case "add": {
    const [surface, pronunciation, accentType = "0", priority = "10"] = args;
    if (!surface || !pronunciation) {
      console.error("Usage: node scripts/dict.mjs add <表記> <読み(全角カタカナ)> [accent_type] [priority]");
      process.exit(1);
    }
    try {
      await engineRequest("/user_dict_word", {
        method: "POST",
        params: { surface, pronunciation, accent_type: Number(accentType), priority: Number(priority) },
      });
      console.log(`登録しました: ${surface} → ${pronunciation}`);
      console.log("※次回の生成時に消えます。残すなら config/voicevox-dict.json かYAMLの dict: へ");
    } catch (e) {
      console.error(`ERROR: 登録できません (${e.status ?? ""})`);
      console.error("  読みは全角カタカナで指定してください");
      process.exit(1);
    }
    break;
  }

  case "clear": {
    const dict = (await engineRequest("/user_dict")) ?? {};
    const uuids = Object.keys(dict);
    for (const uuid of uuids) {
      await engineRequest(`/user_dict_word/${uuid}`, { method: "DELETE" });
    }
    console.log(`${uuids.length}語を削除しました`);
    break;
  }

  default:
    console.log("Usage: node scripts/dict.mjs <list|add|clear>");
    console.log("");
    console.log("  list                      今エンジンに入っている語を表示");
    console.log("  add <表記> <読み>          一時的に足す（次回の生成で消える）");
    console.log("  clear                     全部消す");
    process.exit(command ? 1 : 0);
}
