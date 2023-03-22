import { sumChars } from "./string";

export * as colors from "./colors";
export * as clipboard from "./clipboard";
export * as dates from "./dates";
export * as events from "./events";
export * as formatters from "./formatters";
export * as html from "./html";
export * as messages from "./messages";
export * as parsers from "./parsers";
export * as validators from "./validators";

export * from "./arrays";
export * from "./string";
export * from "./types";
export * from "./typeguards";
export * from "./util";

export const selectRandom = <T = Record<string, unknown>>(array: T[]): T =>
  array[Math.floor(Math.random() * array.length)];

export const selectConsistent = <T = Record<string, unknown>>(array: T[], name: string): T => {
  const index = sumChars(name) % array.length;
  return array[index];
};

export const generateRandomNumericId = (): number =>
  parseInt(Math.random().toString().slice(2, 11));

export const getKeyValue =
  <T extends Record<string, unknown>, U extends keyof T>(key: U) =>
  (obj: T): T[U] =>
    obj[key];
