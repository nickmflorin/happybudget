import { type Dispatch as RootDispatch } from "redux";

import { Action } from "./actions";

export * from "./actions";
export * from "./application";
export * from "./reducers";
export * from "./store";
export * from "./tasks";

export type Dispatch = RootDispatch<Action>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type GenericSelectorFunc<S, T = any> = (state: S) => T;

// export type StoreObj = Record<string, unknown> | boolean | number;

/* // The return type will be `null` in the case that the data is already present in the store.
   export type RequestEffectError = { readonly error: Error };
   export type ListRequestEffectRT<C> = Http.RenderedListResponse<C> | null;
   export type ListRequestEffectRTWithError<C> = ListRequestEffectRT<C> | RequestEffectError; */

/* export type RecalculateRowReducerCallback<S extends TableStore<R>, R extends tabling.RowData> = (
     state: S,
     row: tabling.DataRow<R>,
   ) => Partial<R>; */
