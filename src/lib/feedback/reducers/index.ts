import { type Reducer } from "react";

import * as errors from "application/errors";

import * as constants from "../constants";
import * as typeguards from "../typeguards";
import * as types from "../types";

import { addFieldFeedbackReducer } from "./addFieldFeedbackReducer";
import { createAddGlobalFeedbackReducer } from "./addGlobalFeedbackReducer";
import { clearFeedbackReducer } from "./clearFeedbackReducer";
import { type FeedbackAction, FeedbackActionTypes } from "./types";

export * from "./types";

/**
 * Creates a reducer capable of handling state updates to the feedback managed by the feedback
 * manager, {@link types.FeedbackManager}.
 */
export const createFeedbackReducer = <N extends string = string>(
  config: Omit<Partial<types.FeedbackManagerConfig>, "initialFeedback"> = { defaults: {} },
): Reducer<types.FeedbackManagerFeedback<N>, FeedbackAction<N>> => {
  const addGlobalFeedbackReducer = createAddGlobalFeedbackReducer<N>(config);

  return (
    state: types.FeedbackManagerFeedback<N> = constants.InitialManagerFeedback,
    action: FeedbackAction<N>,
  ): types.FeedbackManagerFeedback<N> => {
    if (action.type === FeedbackActionTypes.CLEAR) {
      return clearFeedbackReducer<N>(state, action);
    }
    const feedback = Array.isArray(action.payload.feedback)
      ? action.payload.feedback
      : [action.payload.feedback];

    const fieldFeedbackElements: (
      | errors.ApiFieldError
      | types.FieldFeedback<types.FeedbackType, N>
    )[] = feedback.filter(
      (f: errors.HttpError | types.Feedback | types.FieldFeedback<types.FeedbackType, N>) =>
        (f instanceof Error && errors.isApiFieldError(f)) ||
        (!(f instanceof Error) && typeguards.isFieldFeedback(f)),
    ) as (errors.ApiFieldError | types.FieldFeedback<types.FeedbackType, N>)[];

    const fieldFeedback = fieldFeedbackElements.reduce(
      (
        prev: types.FieldFeedback<types.FeedbackType, N>[],
        curr: errors.ApiFieldError | types.FieldFeedback<types.FeedbackType, N>,
      ) => (curr instanceof Error ? [...prev, ...curr.toFeedback<N>()] : [...prev, curr]),
      [],
    );

    const globalFeedbackElements: (errors.GlobalFeedbackError | types.GlobalFeedback)[] =
      feedback.filter(
        (f: errors.HttpError | types.Feedback | types.FieldFeedback<types.FeedbackType, N>) =>
          (f instanceof Error && (errors.isApiGlobalError(f) || errors.isNetworkError(f))) ||
          (!(f instanceof Error) && typeguards.isGlobalFeedback(f)),
      ) as (errors.GlobalFeedbackError | types.GlobalFeedback)[];

    const globalFeedback = globalFeedbackElements.map(
      (f: errors.GlobalFeedbackError | types.GlobalFeedback) =>
        f instanceof Error && (errors.isApiGlobalError(f) || errors.isNetworkError(f))
          ? f.toFeedback()
          : f,
    );

    return addFieldFeedbackReducer(
      addGlobalFeedbackReducer(state, globalFeedback, action),
      fieldFeedback,
      action,
    );
  };
};
