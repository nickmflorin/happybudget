import { SagaIterator } from "redux-saga";

import * as actions from "./actions";

export type Task<A extends actions.Action> = (action: A) => SagaIterator;

export type ContextTask<A extends actions.Action> = (
  context?: actions.ActionContext<A>,
) => SagaIterator;

export type ListTaskMap<C extends actions.ActionContext = actions.ActionContext> = {
  readonly request:
    | Task<actions.Action<actions.RequestActionPayload, C>>
    | Task<actions.Action<null, C>>;
};

export type ModelListTaskMap<C extends actions.ActionContext = actions.ActionContext> = {
  readonly request:
    | Task<actions.Action<actions.RequestActionPayload, C>>
    | Task<actions.Action<null, C>>;
};

export type TaskConfig<
  M extends actions.ActionPayloadMap,
  C extends actions.ActionContext = actions.ActionContext,
  A extends actions.ActionCreatorMap<M, C> = actions.ActionCreatorMap<M, C>,
> = {
  readonly actions: Omit<A, "request">;
};
