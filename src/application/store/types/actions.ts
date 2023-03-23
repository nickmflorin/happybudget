import * as api from "api";
import { model, tabling } from "lib";

export type ActionPayloadMap = Record<string, ActionPayload>;

export type ActionContext = {
  readonly publicTokenId?: string;
  readonly errorMessage?: string;
};

export type WithActionContext<T> = T extends null ? ActionContext : T & ActionContext;

export type ActionPayload =
  | Record<string, unknown>
  | string
  | number
  | null
  | boolean
  | ActionPayload[];

export type InferAction<CREATOR> = CREATOR extends ActionCreator<infer P, infer C>
  ? Action<P, C>
  : never;

export type BasicAction<P extends ActionPayload = ActionPayload, T extends string = string> = {
  readonly payload: P;
  readonly type: T;
};

export type Action<
  P extends ActionPayload = ActionPayload,
  C extends ActionContext = ActionContext,
  T extends string = string,
> = BasicAction<P, T> & {
  readonly context: C;
  readonly label: string | null;
  readonly user?: model.User | null;
};

/* export type AnyPayloadAction<
     C extends ActionContext = ActionContext,
     T extends string = string,
   > = Action<ActionPayload, C, T>; */

export type ActionCreator<
  P extends ActionPayload = ActionPayload,
  C extends ActionContext = ActionContext,
> = {
  readonly type: string;
  readonly label: string | null;
  readonly toString: () => string;
  (p: P, ctx: Omit<C, "publicTokenId">): Action<P>;
};

export type ActionCreatorMap<
  S extends ActionPayloadMap,
  C extends ActionContext = ActionContext,
> = {
  [K in keyof S]-?: ActionCreator<S[K], C>;
};

export type RequestActionPayload = null | { force: true };
export type TableRequestActionPayload = { ids: number[] } | RequestActionPayload;
export type UpdateOrderingPayload<F extends string = string> = { field: F; order: api.Order };

export type RequestAction<C extends ActionContext = ActionContext> = Action<
  RequestActionPayload,
  C
>;
export type TableRequestAction<C extends ActionContext = ActionContext> = Action<
  TableRequestActionPayload,
  C
>;

export type RequestActionCreator<C extends ActionContext = ActionContext> = ActionCreator<
  RequestActionPayload,
  C
>;
export type TableRequestActionCreator<C extends ActionContext = ActionContext> = ActionCreator<
  TableRequestActionPayload,
  C
>;

/* export type AnyPayloadActionCreator<C extends ActionContext = ActionContext> = ActionCreator<
     ActionPayload,
     C
   >; */

export type ModelListActionPayloadMap<M extends model.ApiModel> = ListActionPayloadMap<M>;

export type ModelListActionCreatorMap<
  M extends model.ApiModel,
  C extends ActionContext = ActionContext,
> = Omit<ActionCreatorMap<ModelListActionPayloadMap<M>, C>, "request"> & {
  readonly request: RequestActionCreator<C>;
};

export type AuthenticatedModelListActionPayloadMap<M extends model.ApiModel> =
  ModelListActionPayloadMap<M> & {
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

export type AuthenticatedModelListActionCreatorMap<
  M extends model.ApiModel,
  C extends ActionContext = ActionContext,
> = Omit<ActionCreatorMap<AuthenticatedModelListActionPayloadMap<M>, C>, "request"> & {
  readonly request: RequestActionCreator<C>;
};

export type TableActionPayloadMap<M extends model.RowTypedApiModel = model.RowTypedApiModel> = {
  readonly request: TableRequestActionPayload;
  readonly loading: boolean;
  // readonly response: Http.TableResponse<M>;
  readonly setSearch: string;
  readonly invalidate: null;
};

export type TableActionCreatorMap<
  M extends model.RowTypedApiModel,
  C extends ActionContext = ActionContext,
> = Optional<ActionCreatorMap<TableActionPayloadMap<M>, C>, "invalidate">;

export type AuthenticatedTableActionPayloadMap<
  R extends tabling.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = TableActionPayloadMap<M> & {
  readonly handleEvent: tabling.TableEvent<R>;
};

export type AuthenticatedTableActionCreatorMap<
  R extends tabling.Row,
  M extends model.RowTypedApiModel,
  C extends ActionContext = ActionContext,
> = Optional<ActionCreatorMap<AuthenticatedTableActionPayloadMap<R, M>, C>, "invalidate">;

export type UserMetricsActionPayload =
  | UserMetricsIncrementByPayload
  | UserMetricsDecrementByPayload
  | UserMetricsChangePayload
  | UserMetricsValuePayload;

export type UserMetricsAction =
  | Action<UserMetricsIncrementByPayload>
  | Action<UserMetricsDecrementByPayload>
  | Action<UserMetricsChangePayload>
  | Action<UserMetricsValuePayload>;

export type ModelDetailActionPayloadMap<M extends model.ApiModel> = {
  readonly loading: boolean;
  // readonly response: Http.RenderedDetailResponse<M>;
  readonly updateInState: UpdateModelPayload<M>;
  readonly invalidate: null;
};

export type UpdateModelPayload<T extends model.Model> = {
  id: T["id"];
  data: Partial<T>;
};

export type UserMetricsIncrementByPayload = {
  readonly incrementBy: number;
  readonly metric: keyof model.User["metrics"];
};

export type UserMetricsDecrementByPayload = {
  readonly decrementBy: number;
  readonly metric: keyof model.User["metrics"];
};

export type UserMetricsChangePayload = {
  readonly change: "increment" | "decrement";
  readonly metric: keyof model.User["metrics"];
};

export type UserMetricsValuePayload = {
  readonly value: number;
  readonly metric: keyof model.User["metrics"];
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

export type ListActionPayloadMap<T> = {
  readonly request: RequestActionPayload;
  readonly loading: boolean;
  readonly invalidate: boolean;
  // readonly response: Http.RenderedListResponse<T>;
};

export type ListActionCreatorMap<T, C extends ActionContext = ActionContext> = Omit<
  ActionCreatorMap<ListActionPayloadMap<T>, C>,
  "request"
> & { readonly request: RequestActionCreator<C> };

export type HttpUpdateModelPayload<T extends model.Model, P> = {
  id: T["id"];
  data: Partial<P>;
};
