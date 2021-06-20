/// <reference path="./http.d.ts" />
/// <reference path="./redux.d.ts" />
/// <reference path="./ui.d.ts" />
/// <reference path="./table.d.ts" />
/// <reference path="./files.d.ts" />
/// <reference path="./modeling.d.ts" />

interface Window {
  analytics: any;
}

type NonNullable<T> = Exclude<T, null | undefined>;
