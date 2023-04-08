import { model } from "lib";

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
export type BasicAction<P, T extends string = string> = P extends any
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
      readonly user?: model.User | null;
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
> = {
  [K in keyof S & string]: ActionCreator<S[K], C, MAP[K]>;
};

export type RequestActionPayload = null | { force: true };
export type UpdateOrderingPayload<F extends string = string> = { field: F; order: api.Order };

export type RequestAction<C extends ActionContext = ActionContext> = Action<
  RequestActionPayload,
  C
>;

export type RequestActionCreator<C extends ActionContext = ActionContext> = ActionCreator<
  RequestActionPayload,
  C
>;

export type ApiModelListActionPayloadMap<M extends model.ApiModel> = ListActionPayloadMap<M>;

export type ModelListActionCreatorMap<
  M extends model.ApiModel,
  C extends ActionContext = ActionContext,
> = Omit<ActionCreatorMap<ApiModelListActionPayloadMap<M>, C>, "request"> & {
  readonly request: RequestActionCreator<C>;
};

export type AuthenticatedApiModelListActionPayloadMap<M extends model.ApiModel> =
  ApiModelListActionPayloadMap<M> & {
    readonly updating: ModelListActionAction;
    readonly creating: boolean;
    readonly removeFromState: number;
    readonly deleting: ModelListActionAction;
    readonly addToState: M;
    readonly updateInState: UpdateModelPayload<M>;
    readonly setSearch: string;
    readonly setPagination: Pagination;
    readonly updateOrdering: UpdateOrderingPayload<string>;
  };

export type AuthenticatedApiModelListActionCreatorMap<
  M extends model.ApiModel,
  C extends ActionContext = ActionContext,
> = Omit<ActionCreatorMap<AuthenticatedApiModelListActionPayloadMap<M>, C>, "request"> & {
  readonly request: RequestActionCreator<C>;
};

export type ModelDetailActionPayloadMap<M extends model.ApiModel> = {
  readonly loading: boolean;
  readonly response: api.ClientResponse<api.ApiSuccessResponse<M>>;
  readonly updateInState: UpdateModelPayload<M>;
  readonly invalidate: null;
};

export type UpdateModelPayload<T extends model.Model> = {
  id: T["id"];
  data: Partial<T>;
};

export type ModelListActionCompleteAction<M extends model.Model = model.Model> = {
  readonly id: M["id"];
  readonly value: false;
  readonly success?: boolean;
};

export type ModelListActionStartAction<M extends model.Model = model.Model> = {
  readonly id: M["id"];
  readonly value: true;
};

export type ModelListActionAction<M extends model.Model = model.Model> =
  | ModelListActionStartAction<M>
  | ModelListActionCompleteAction<M>;

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

export type HttpUpdateModelPayload<T extends model.Model, P> = {
  id: T["id"];
  data: Partial<P>;
};
