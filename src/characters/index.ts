export type {
  CharacterDefinition,
  CharacterLayer,
  CharacterArt,
  CharacterPlacement,
} from "./types";
export {
  CHARACTERS,
  DEFAULT_CHARACTER,
  getCharacter,
  resolveMouth,
} from "./registry";
export { CharacterRenderer } from "./CharacterRenderer";
export { CharacterProvider, useCharacter } from "./context";
