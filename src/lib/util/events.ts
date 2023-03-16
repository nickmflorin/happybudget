export const isCharacterKeyPress = (evt: KeyboardEvent) =>
  typeof evt.key === "string" && evt.key.length === 1 && /[a-zA-Z]/.test(evt.key);

export const isBackspaceKeyPress = (evt: KeyboardEvent) => evt.code === "Backspace";
