import * as types from "../types";
import * as util from "../util";
import { type AddFeedbackAction, type SetFeedbackAction, FeedbackActionTypes } from "./types";

/**
 * A reducer, {@link Reducer}, that handles state updates to the feedback managed by the feedback
 * manager, {@link types.FeedbackManager}, when field level feedback is being added to or set as
 * its state.
 */
export const addFieldFeedbackReducer = <N extends string = string>(
  state: types.FeedbackManagerFeedback<N>,
  feedback: types.FieldFeedback<types.FeedbackType, N>[],
  action: Pick<AddFeedbackAction<N> | SetFeedbackAction<N>, "type">,
): types.FeedbackManagerFeedback<N> =>
  feedback.reduce(
    (
      prev: types.FeedbackManagerFeedback<N>,
      f: types.FieldFeedback<types.FeedbackType, N>,
    ): types.FeedbackManagerFeedback<N> => {
      const feedbackElement = { message: f.message, feedbackType: f.feedbackType };
      let newState = { ...prev };

      /* Add the field level feedback element to the feedback that is maintained and stored in state
         for all feedback types of each field. */
      const current = newState.fields[f.field];
      if (current === undefined) {
        newState = {
          ...newState,
          fields: {
            ...newState.fields,
            [f.field]: [feedbackElement],
          },
        };
      } else {
        newState = {
          ...newState,
          fields: {
            ...newState.fields,
            [f.field]: [...current, feedbackElement],
          },
        };
      }
      /* Add the field level feedback element to the feedback that is maintained and stored in state
         for the specific feedback type. */
      const key = util.getFeedbackManagerFieldKey(f.feedbackType);
      const currentFeedbackTypeState = newState[key][f.field];
      if (currentFeedbackTypeState === undefined) {
        return { ...newState, [key]: { ...newState[key], [f.field]: [f.message] } };
      }
      return {
        ...newState,
        [key]: { ...newState[key], [f.field]: [...currentFeedbackTypeState, f.message] },
      };
    },
    action.type === FeedbackActionTypes.ADD
      ? state
      : { ...state, fields: {}, fieldSuccesses: {}, fieldErrors: {}, fieldWarnings: {} },
  );
