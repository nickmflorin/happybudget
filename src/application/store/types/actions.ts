import { Optional, OptionalKeys } from "utility-types";

import * as api from "../../api";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type ActionPayloadMap<P = any> = Record<string, P>;

type _ActionContext = {
  readonly publicTokenId?: string;
  readonly errorMessage?: string;
};

export type ActionContext<T extends Action | undefined = undefined> = T extends Action<
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  any,
  infer C extends _ActionContext
>
  ? C
  : T extends undefined
  ? _ActionContext
  : never;

export type WithActionContext<T> = T extends null ? ActionContext : T & ActionContext;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type BasicAction<P = any, T extends string = string> = P extends any
  ? {
      readonly payload: P;
      readonly type: T;
    }
  : never;

export type Action<
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  P = any,
  C extends ActionContext = ActionContext,
  T extends string = string,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
> = P extends any
  ? {
      readonly payload: P;
      readonly context: C;
      readonly user?: import("lib/model").User | null;
      readonly type: T;
    }
  : never;

export type ActionFromPayloadMap<
  M extends ActionPayloadMap,
  C extends ActionContext = ActionContext,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
> = M[keyof M] extends any ? Action<M[keyof M], C> : never;

type ActionCreatorFn<P, C extends ActionContext = ActionContext, T extends string = string> = {
  <Pi extends P = P, Ci extends C = C>(p: Pi, ctx: Omit<Ci, "publicTokenId">): Action<Pi, Ci, T>;
};

export type ActionCreator<P, C extends ActionContext = ActionContext, T extends string = string> = {
  readonly type: T;
  readonly toString: () => T;
} & ActionCreatorFn<P, C, T>;

export type ActionTypeMap<S extends ActionPayloadMap> = { [key in keyof S & string]: string };

export type ActionCreatorMap<
  S extends ActionPayloadMap = ActionPayloadMap,
  C extends ActionContext = ActionContext,
  MAP extends ActionTypeMap<S> = ActionTypeMap<S>,
> = Optional<
  {
    [K in keyof S & string]: K extends OptionalKeys<S>
      ? ActionCreator<Exclude<S[K], undefined>, C, MAP[K]>
      : ActionCreator<S[K], C, MAP[K]>;
  },
  OptionalKeys<S> & keyof S & string
>;

type _ActionMapWithDefinedKey<
  T extends keyof S,
  S extends ActionPayloadMap,
  C extends ActionContext,
  MAP extends ActionTypeMap<S>,
> = ActionCreatorMap<S, C, MAP> & { [key in T]: S[key & keyof S] };

export const actionMapDefinesKey = <
  T extends keyof S,
  S extends ActionPayloadMap,
  C extends ActionContext,
  MAP extends ActionTypeMap<S>,
>(
  actions: ActionCreatorMap<S, C, MAP>,
  type: T,
): actions is _ActionMapWithDefinedKey<T, S, C, MAP> =>
  (actions as _ActionMapWithDefinedKey<T, S, C, MAP>)[type] !== undefined;

export const actionQualifiesMap = <
  T extends keyof S,
  S extends ActionPayloadMap,
  C extends ActionContext,
  MAP extends ActionTypeMap<S> = ActionTypeMap<S>,
>(
  actions: ActionCreatorMap<S, C, MAP>,
  type: T,
  action: ActionFromPayloadMap<S, C>,
): action is Action<Exclude<S[T], undefined>, C> =>
  actionMapDefinesKey<T, S, C, MAP>(actions, type) && action.type === actions[type].toString();

export type RequestActionPayload = null | { force: true };
export type UpdateOrderingPayload<F extends string = string> = { field: F; order: api.Order };

export const requestActionIsForced = <C extends ActionContext>(
  a: RequestAction<C>,
): a is Action<{ force: true }, C> =>
  a.payload !== null && (a as Action<{ force: true }, C>).payload.force === true;

export type RequestAction<C extends ActionContext = ActionContext> = Action<
  RequestActionPayload,
  C
>;

export type RequestActionCreator<C extends ActionContext = ActionContext> = ActionCreator<
  RequestActionPayload,
  C
>;

export type ApiModelListActionPayloadMap<M extends import("lib/model").ApiModel> =
  ListActionPayloadMap<M>;

export type ModelListActionCreatorMap<
  M extends import("lib/model").ApiModel,
  C extends ActionContext = ActionContext,
> = Omit<ActionCreatorMap<ApiModelListActionPayloadMap<M>, C>, "request"> & {
  readonly request: RequestActionCreator<C>;
};

export type AuthenticatedApiModelListActionPayloadMap<M extends import("lib/model").ApiModel> =
  ApiModelListActionPayloadMap<M> & {
    readonly updating: ModelListActionAction;
    readonly creating: boolean;
    readonly removeFromState: number;
    readonly deleting: ModelListActionAction;
    readonly addToState: M;
    readonly updateInState: UpdateModelPayload<M>;
    readonly setSearch: string;
    readonly setPagination: import("lib/ui").Pagination;
    readonly updateOrdering: UpdateOrderingPayload<string>;
  };

export type AuthenticatedApiModelListActionCreatorMap<
  M extends import("lib/model").ApiModel,
  C extends ActionContext = ActionContext,
> = Omit<ActionCreatorMap<AuthenticatedApiModelListActionPayloadMap<M>, C>, "request"> & {
  readonly request: RequestActionCreator<C>;
};

export type ModelDetailActionPayloadMap<M extends import("lib/model").ApiModel> = {
  readonly loading: boolean;
  readonly response: api.ClientResponse<api.ApiSuccessResponse<M>>;
  readonly updateInState: UpdateModelPayload<M>;
  readonly invalidate: null;
};

export type UpdateModelPayload<T extends import("lib/model").Model> = {
  id: T["id"];
  data: Partial<T>;
};

export type ModelListActionCompleteAction<
  M extends import("lib/model").Model = import("lib/model").Model,
> = {
  readonly id: M["id"];
  readonly value: false;
  readonly success?: boolean;
};

export type ModelListActionStartAction<
  M extends import("lib/model").Model = import("lib/model").Model,
> = {
  readonly id: M["id"];
  readonly value: true;
};

export type ModelListActionAction<M extends import("lib/model").Model = import("lib/model").Model> =
  ModelListActionStartAction<M> | ModelListActionCompleteAction<M>;

export type ListActionPayloadMap<T extends api.ListResponseIteree> = {
  readonly request: RequestActionPayload;
  readonly loading: boolean;
  readonly invalidate: boolean;
  readonly response: api.ClientResponse<api.ApiListResponse<T>>;
};

export type ListActionCreatorMap<
  T extends api.ListResponseIteree,
  C extends ActionContext = ActionContext,
> = Omit<ActionCreatorMap<ListActionPayloadMap<T>, C>, "request"> & {
  readonly request: RequestActionCreator<C>;
};

export type HttpUpdateModelPayload<T extends import("lib/model").Model, P> = {
  id: T["id"];
  data: Partial<P>;
};
