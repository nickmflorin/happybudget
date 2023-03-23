import { type Reducer as RootReducer } from "redux";

import {
  Action,
  ActionContext,
  ActionPayload,
  ActionCreatorMap,
  ActionPayloadMap,
} from "./actions";

export type BasicReducer<S, A extends Action = Action> = RootReducer<S, A>;

export type BasicDynamicReducer<S, ARG, A> = (s: S | undefined, a: A, arg?: ARG) => S;

export type BasicDynamicRequiredReducer<S, ARG, A> = (s: S | undefined, a: A, arg: ARG) => S;

export type Reducer<
  S,
  C extends ActionContext = ActionContext,
  P extends ActionPayload = ActionPayload,
  A extends Action<P, C> = Action<P, C>,
> = BasicReducer<S, A>;

export type DynamicReducer<
  S,
  ARG,
  C extends ActionContext = ActionContext,
  P extends ActionPayload = ActionPayload,
  A extends Action<P, C> = Action<P, C>,
> = BasicDynamicReducer<S, ARG, A>;

export type DynamicRequiredReducer<
  S,
  ARG,
  C extends ActionContext = ActionContext,
  P extends ActionPayload = ActionPayload,
  A extends Action<P, C> = Action<P, C>,
> = BasicDynamicRequiredReducer<S, ARG, A>;

export type BasicReducerWithDefinedState<S, A = Action> = (s: S, a: A) => S;

export type ReducerWithDefinedState<
  S,
  C extends ActionContext = ActionContext,
  P extends ActionPayload = ActionPayload,
  A extends Action<P, C> = Action<P, C>,
> = BasicReducerWithDefinedState<S, A>;

export type ReducersMapObject<
  S,
  C extends ActionContext = ActionContext,
  P extends ActionPayload = ActionPayload,
  A extends Action<P, C> = Action<P, C>,
> = {
  [K in keyof S]-?: Reducer<S[K], C, A>;
};

export type ReducerConfig<
  S,
  A extends ActionCreatorMap<ActionPayloadMap, C>,
  C extends ActionContext = ActionContext,
> = {
  readonly initialState: S;
  readonly actions: Partial<A>;
};
