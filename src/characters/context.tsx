import React from "react";
import { getCharacter } from "./registry";
import type { CharacterDefinition } from "./types";

/**
 * 表示中のキャラクターを配下に配るコンテキスト
 *
 * サムネイルのバリアントのように、キャラクターの話を知らなくてよい
 * コンポーネントを間に挟むためにpropsではなくコンテキストで渡している。
 */
const CharacterContext = React.createContext<CharacterDefinition | null>(null);

export const CharacterProvider: React.FC<{
  name?: string;
  children: React.ReactNode;
}> = ({ name, children }) => (
  <CharacterContext.Provider value={getCharacter(name)}>
    {children}
  </CharacterContext.Provider>
);

/** Provider が無ければ既定のキャラクターを返す */
export const useCharacter = (): CharacterDefinition =>
  React.useContext(CharacterContext) ?? getCharacter();
