/**
 * キャラクターのレジストリ
 *
 * 追加するときは
 *   1. src/characters/<name>/character.json を作る
 *      （scripts/create-character.py が静止画1枚から生成する）
 *   2. このファイルにimportして CHARACTERS に足す
 * の2ステップだけ。描画側（CharacterRenderer）は触らない。
 */

import * as zundamonJson from "./zundamon/character.json";
import * as presenterJson from "./presenter/character.json";
import type { CharacterDefinition } from "./types";

/** YAMLでcharacterを書かなかったときに使うキャラクター */
export const DEFAULT_CHARACTER = "zundamon";

export const CHARACTERS: Record<string, CharacterDefinition> = {
  zundamon: zundamonJson as unknown as CharacterDefinition,
  presenter: presenterJson as unknown as CharacterDefinition,
};

export function getCharacter(name?: string): CharacterDefinition {
  const key = name ?? DEFAULT_CHARACTER;
  const character = CHARACTERS[key];

  if (!character) {
    throw new Error(
      `キャラクター "${key}" が見つかりません。` +
        `登録済み: ${Object.keys(CHARACTERS).join(" / ")}`
    );
  }

  return character;
}

/** 母音キー（a/i/u/e/o/n/closed）をそのキャラの口パーツ名に変換する */
export function resolveMouth(
  character: CharacterDefinition,
  vowel: string
): string {
  return (
    character.mouthMap[vowel] ??
    character.mouthMap.closed ??
    character.defaultSlots[character.mouthSlot]
  );
}
