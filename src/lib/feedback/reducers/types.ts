import { type Dispatch } from "react";

import * as errors from "application/errors";
import * as store from "application/store/types";

import { enumeratedLiterals, EnumeratedLiteralType } from "../../util/literals";
import { OneOrMany } from "../../util/types/arrays";
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
