// 各スクリプトから import して使う共通処理
//
// Node化前は bash + Python だったが、YAMLとJSONの扱いはNodeで完結するため
// ホストにPython+PyYAMLを要求しないようにしてある。
// PSDからのパーツ抽出など画像処理だけは scripts/*.py に残っている（初期セットアップのみ）。

import { spawn } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as yamlLoad } from "js-yaml";
import { Ajv } from "ajv";

export const PROJECT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

export const ENGINE_URL =
  process.env.VOICEVOX_ENGINE_URL ?? "http://127.0.0.1:50021";

/** コマンドを実行して終了コードを返す（出力はそのまま流す） */
export function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      cwd: PROJECT_DIR,
      ...options,
    });
    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}

/** コマンドを実行して標準出力を受け取る */
export function capture(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: PROJECT_DIR,
      ...options,
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (d) => (stdout += d));
    child.stderr?.on("data", (d) => (stderr += d));
    child.on("error", reject);
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** エンジンが応答するか */
async function engineAlive() {
  try {
    const res = await fetch(`${ENGINE_URL}/version`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * VOICEVOX Engineに接続できることを保証する
 * 起動していなければ docker compose で起動し、応答するまで待つ
 */
export async function ensureVoicevox() {
  if (await engineAlive()) return;

  // リモートのエンジンは起動できないのでそのままエラーにする
  if (!ENGINE_URL.includes("127.0.0.1") && !ENGINE_URL.includes("localhost")) {
    throw new Error(`VOICEVOX Engineに接続できません: ${ENGINE_URL}`);
  }

  const docker = await capture("docker", ["--version"]).catch(() => null);
  if (!docker || docker.code !== 0) {
    throw new Error(
      `VOICEVOX Engineが起動していません (${ENGINE_URL})\n` +
        "  dockerが見つからないため自動起動できません。手動で起動してください"
    );
  }

  console.log("==> VOICEVOX Engineを起動しています...");
  const up = await capture("docker", ["compose", "up", "-d", "voicevox"]);
  if (up.code !== 0) {
    throw new Error("docker compose up -d voicevox に失敗しました");
  }

  // 初回はイメージのpullが走るので長めに待つ
  for (let i = 0; i < 90; i++) {
    if (await engineAlive()) {
      console.log("    起動しました");
      return;
    }
    await sleep(2000);
  }

  throw new Error(
    `VOICEVOX Engineが応答しません (${ENGINE_URL})\n` +
      "  ログを確認してください: docker compose logs voicevox"
  );
}

/** VOICEVOXのHTTP API。JSONを返すものはパースして返す */
export async function engineRequest(pathname, { method = "GET", params, body } = {}) {
  const url = new URL(ENGINE_URL + pathname);
  for (const [k, v] of Object.entries(params ?? {})) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`${method} ${pathname} が失敗しました (${res.status})`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  const type = res.headers.get("content-type") ?? "";
  if (type.includes("audio/")) return Buffer.from(await res.arrayBuffer());
  // DELETEなどは content-type が application/json でもボディが空なので、
  // 先にテキストで受けてから空判定する
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

let validateScene;

/**
 * シーンYAMLを読み、スキーマで検証してから返す
 *
 * スキーマ違反はここで止める。未知のキーはタイポの可能性が高く、
 * 黙って無視すると「動画は出たけど何か違う」になるため。
 */
export function loadScenesYaml(file) {
  const raw = readFileSync(file, "utf8");
  let data;
  try {
    data = yamlLoad(raw);
  } catch (e) {
    throw new Error(`YAMLとして読めません: ${file}\n  ${e.message}`);
  }

  if (!validateScene) {
    const schema = JSON.parse(
      readFileSync(path.join(PROJECT_DIR, "schema/scene.schema.json"), "utf8")
    );
    validateScene = new Ajv({ allErrors: true, strict: false }).compile(schema);
  }

  if (!validateScene(data)) {
    const lines = validateScene.errors.map((e) => {
      const where = e.instancePath || "(トップレベル)";
      const extra =
        e.params?.additionalProperty
          ? `: ${e.params.additionalProperty}`
          : e.params?.allowedValues
            ? ` (使えるのは ${e.params.allowedValues.join(" / ")})`
            : "";
      return `  ${where} ${e.message}${extra}`;
    });
    throw new Error(
      `${file} のスキーマ検証に失敗しました\n${lines.join("\n")}\n` +
        "  項目の一覧は schema/scene.schema.json と .claude/rules/scenes.md を参照"
    );
  }

  return data;
}

/** scenes/*.yaml の一覧 */
export function listSceneFiles() {
  const dir = path.join(PROJECT_DIR, "scenes");
  return readdirSync(dir)
    .filter((f) => f.endsWith(".yaml"))
    .sort()
    .map((f) => path.join("scenes", f));
}

/** 引数無しのときに一覧を出す */
export function printAvailableVideos() {
  console.log("Available videos:");
  for (const f of listSceneFiles()) {
    console.log("  " + path.basename(f, ".yaml"));
  }
}
