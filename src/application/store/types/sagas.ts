import * as actions from "./actions";

export type SagaConfig<
  T,
  M extends actions.ActionPayloadMap,
  C extends actions.ActionContext = actions.ActionContext,
  A extends actions.ActionCreatorMap<M, C> = actions.ActionCreatorMap<M, C>,
> = {
  readonly tasks: T;
  readonly actions: A;
};
