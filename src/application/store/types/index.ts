import { type Dispatch as RootDispatch } from "redux";

import { Action } from "./actions";

export * from "./actions";
export * from "./application";
export * from "./context";
export * from "./reducers";
export * from "./sagas";
export * from "./store";
export * from "./tasks";
export * from "./tabling";

export type Dispatch = RootDispatch<Action>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type GenericSelectorFunc<S, T = any> = (state: S) => T;

/* export type RecalculateRowReducerCallback<S extends TableStore<R>, R extends tabling.RowData> = (
     state: S,
     row: tabling.DataRow<R>,
   ) => Partial<R>; */
