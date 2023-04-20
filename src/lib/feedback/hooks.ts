import { useEffect, useMemo, useReducer } from "react";

import * as constants from "./constants";
import * as reducers from "./reducers";
import * as types from "./types";

/**
 * Creates a usable hook based on the provided configuration, {@link types.FeedbackManagerConfig},
 * that can be used to manage feedback elements in state for a particular component.
 *
 * @param {Partial<types.FeedbackManagerConfig>} config
 *   Configuration for the feedback hook.
 *
 * @returns {types.FeedbackManager}
 */
export const createFeedbackHook = <N extends string = string>(
  config: Omit<Partial<types.FeedbackManagerConfig<N>>, "initialFeedback"> = {
    defaults: constants.DEFAULT_GLOBAL_CONFIG,
  },
) => {
  const reducer = reducers.createFeedbackReducer(config);

  return (
    initialFeedback?: types.FeedbackManagerConfig<N>["initialFeedback"],
  ): types.FeedbackManager<N> => {
    const [feedback, dispatch] = useReducer(reducer, constants.InitialManagerFeedback);

    useEffect(() => {
      /* The initial feedback should only be set in state if it is provided on the first render.
         Subsequent renders should not ever reset the initial feedback even if it changes */
      if (initialFeedback !== undefined) {
        dispatch({
          type: reducers.FeedbackActionTypes.SET,
          payload: { feedback: initialFeedback, dispatch },
        });
      }
      /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, []);

    return useMemo<types.FeedbackManager<N>>(
      () => ({
        feedback,
        addFeedback: (f, options?) =>
          dispatch({
            type: reducers.FeedbackActionTypes.ADD,
            payload: { options, feedback: f, dispatch },
          }),
        setFeedback: (f, options?) => {
          dispatch({
            type: reducers.FeedbackActionTypes.SET,
            payload: {
              options,
              feedback: f,
              dispatch,
            },
          });
        },
        clearFeedback: (options?) =>
          dispatch({ type: reducers.FeedbackActionTypes.CLEAR, payload: { options } }),
      }),
      [feedback],
    );
  };
};
