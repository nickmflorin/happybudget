import { type Dispatch } from "react";

import { store, errors } from "application";

import { enumeratedLiterals, OneOrMany } from "../../util";
import * as types from "../types";

export const FeedbackActionTypes = enumeratedLiterals(["clear", "add", "set"] as const);

export type ClearFeedbackAction<N extends string = string> = store.BasicAction<
  {
    readonly options?: types.ClearFeedbackOptions<types.FeedbackType, N>;
  },
  typeof FeedbackActionTypes.CLEAR
>;

export type AddFeedbackAction<N extends string = string> = store.BasicAction<
  {
    readonly feedback:
      | errors.HttpError
      | OneOrMany<types.GlobalFeedback | types.FieldFeedback<types.FeedbackType, N>>;
    readonly dispatch: Dispatch<ClearFeedbackAction<N>>;
    readonly options?: Partial<types.GlobalManagedFeedbackConfig>;
  },
  typeof FeedbackActionTypes.ADD
>;

export type SetFeedbackAction<N extends string = string> = store.BasicAction<
  {
    readonly feedback:
      | errors.HttpError
      | OneOrMany<types.GlobalFeedback | types.FieldFeedback<types.FeedbackType, N>>;
    readonly dispatch: Dispatch<ClearFeedbackAction<N>>;
    readonly options?: Partial<types.GlobalManagedFeedbackConfig>;
  },
  typeof FeedbackActionTypes.SET
>;

export type FeedbackAction<N extends string = string> =
  | AddFeedbackAction<N>
  | ClearFeedbackAction<N>
  | SetFeedbackAction<N>;
