import { ulid } from "ulid";

import * as types from "../types";
import * as util from "../util";

import { type AddFeedbackAction, type SetFeedbackAction, FeedbackActionTypes } from "./types";

/**
 * Creates a reducer, {@link Reducer}, that handles state updates to the feedback managed by the
 * feedback manager, {@link types.FeedbackManager}, when global level feedback is being added to or
 * set as its state.
 */
export const createAddGlobalFeedbackReducer =
  <N extends string = string>(config: Partial<types.FeedbackManagerConfig> = { defaults: {} }) =>
  (
    state: types.FeedbackManagerFeedback<N>,
    feedback: types.GlobalFeedback[],
    action: AddFeedbackAction<N> | SetFeedbackAction<N>,
  ): types.FeedbackManagerFeedback<N> => {
    const configuration = util.getFeedbackManagerConfig(config, action.payload.options);
    /* Convert each GlobalFeedback element into a ManagedGlobalFeedback element by attributing the
       element with a randomly generated ID and optionally an onClose callback - if applicable. */
    return feedback.reduce(
      (prev: types.FeedbackManagerFeedback<N>, f: types.GlobalFeedback) => {
        let managedFeedback: types.ManagedGlobalFeedback = {
          ...f,
          id: ulid(),
        };
        if (configuration.closable) {
          managedFeedback = {
            ...managedFeedback,
            onClose: () => {
              action.payload.dispatch({
                type: FeedbackActionTypes.CLEAR,
                payload: { options: { ids: [managedFeedback.id] } },
              });
            },
          };
        }
        return { ...prev, global: [...prev.global, managedFeedback] };
      },
      action.type === FeedbackActionTypes.ADD ? state : { ...state, global: [] },
    );
  };
