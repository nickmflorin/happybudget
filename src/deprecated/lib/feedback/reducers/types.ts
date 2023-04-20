import { type Dispatch } from "react";

import { Action } from "../../../../lib/core";
import * as errors from "../../errors";
import { enumeratedLiteralsMap, OneOrMany } from "../../../../lib/util";
import * as types from "../types";

export const FeedbackActionTypes = enumeratedLiteralsMap(["clear", "add", "set"] as const);

export type ClearFeedbackAction<N extends string = string> = Action<
  typeof FeedbackActionTypes.CLEAR,
  {
    readonly options?: types.ClearFeedbackOptions<types.FeedbackType, N>;
  }
>;

export type AddFeedbackAction<N extends string = string> = Action<
  typeof FeedbackActionTypes.ADD,
  {
    readonly feedback:
      | errors.HttpError
      | OneOrMany<types.GlobalFeedback | types.FieldFeedback<types.FeedbackType, N>>;
    readonly dispatch: Dispatch<ClearFeedbackAction<N>>;
    readonly options?: Partial<types.GlobalManagedFeedbackConfig>;
  }
>;

export type SetFeedbackAction<N extends string = string> = Action<
  typeof FeedbackActionTypes.SET,
  {
    readonly feedback:
      | errors.HttpError
      | OneOrMany<types.GlobalFeedback | types.FieldFeedback<types.FeedbackType, N>>;
    readonly dispatch: Dispatch<ClearFeedbackAction<N>>;
    readonly options?: Partial<types.GlobalManagedFeedbackConfig>;
  }
>;

export type FeedbackAction<N extends string = string> =
  | AddFeedbackAction<N>
  | ClearFeedbackAction<N>
  | SetFeedbackAction<N>;
