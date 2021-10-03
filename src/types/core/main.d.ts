/// <reference types="@welldone-software/why-did-you-render" />

/// <reference path="../modeling/http.d.ts" />
/// <reference path="./redux.d.ts" />
/// <reference path="./ui.d.ts" />
/// <reference path="./files.d.ts" />

interface Window {
  analytics: any;
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}

type ID = string | number;

type FnWithTypedArgs<T, ARGS extends any[]> = (...args: ARGS) => T;

type NonNullable<T> = Exclude<T, null | undefined>;

type Writeable<T extends { [x: string]: any }, K extends string> = {
  [P in K]: T[P];
}

type SingleOrArray<T> = T | T[];

type FlattenIfArray<T> = T extends (infer R)[] ? R : T
type ArrayIfSingle<T> = T extends Array<any> ? T : T[];

type NonNullRef<T> = {
  readonly current: T;
}

type SetUndefined<T, W extends keyof T> = Omit<T, W> & Record<W, undefined>;
type SetOptional<T, W extends keyof T> = Omit<T, W> & Partial<Pick<T, W>>;
type SetRequired<T, W extends keyof T> = Omit<T, W> & Required<Pick<T, W>>;

type RenderPropChild<PARAMS = any> = (p: PARAMS) => import("react").ReactElement<any, any>;
