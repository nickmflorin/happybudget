import { type Reducer as RootReducer } from "redux";

import { Action, ActionContext, BasicAction, ActionCreatorMap, ActionPayloadMap } from "./actions";

export type BasicReducer<S, A extends BasicAction = BasicAction> = RootReducer<S, A>;

export type BasicDynamicReducer<S, ARG, A> = (s: S | undefined, a: A, arg?: ARG) => S;

export type BasicDynamicRequiredReducer<S, ARG, A> = (s: S | undefined, a: A, arg: ARG) => S;

export type Reducer<S, A extends Action = Action> = BasicReducer<S, A>;

export type DynamicReducer<S, ARG, A extends Action> = BasicDynamicReducer<S, ARG, A>;

export type DynamicRequiredReducer<S, ARG, A extends Action> = BasicDynamicRequiredReducer<
  S,
  ARG,
  A
>;

export type BasicReducerWithDefinedState<S, A = Action> = (s: S, a: A) => S;

export type ReducerWithDefinedState<S, A extends Action> = BasicReducerWithDefinedState<S, A>;

export type ReducerConfig<
  S,
  M extends ActionPayloadMap,
  C extends ActionContext = ActionContext,
  A extends ActionCreatorMap<M, C> = ActionCreatorMap<M, C>,
> = {
  readonly initialState: S;
  readonly actions: A;
};
