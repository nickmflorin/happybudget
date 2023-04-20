import { uniq } from "lodash";

import { logger } from "internal";

import { findDuplicates, removeObjAttributes } from "../../../../lib/util";
import * as constants from "../constants";
import * as typeguards from "../typeguards";
import * as types from "../types";
import * as util from "../util";
import { ClearFeedbackAction } from "./types";

const removeGlobalFeedback = <N extends string = string>(
  state: types.FeedbackManagerFeedback<N>,
  filter: (f: types.ManagedGlobalFeedback) => boolean,
) => ({
  ...state,
  global: state.global.filter(filter),
});

const removeFields = <N extends string = string>(
  state: types.FeedbackManagerFeedback<N>,
  fields: N[],
): types.FeedbackManagerFeedback<N> => ({
  ...state,
  fields: removeObjAttributes<types.FeedbackManagerFeedback<N>["fields"], N>(
    state.fields,
    fields,
  ) as types.FeedbackManagerFeedback<N>["fields"],
  fieldErrors: removeObjAttributes<types.FeedbackManagerFeedback<N>["fieldErrors"], N>(
    state.fieldErrors,
    fields,
  ) as types.FeedbackManagerFeedback<N>["fieldErrors"],
  fieldWarnings: removeObjAttributes<types.FeedbackManagerFeedback<N>["fieldWarnings"], N>(
    state.fieldWarnings,
    fields,
  ) as types.FeedbackManagerFeedback<N>["fieldWarnings"],
  fieldSuccesses: removeObjAttributes<types.FeedbackManagerFeedback<N>["fieldSuccesses"], N>(
    state.fieldSuccesses,
    fields,
  ) as types.FeedbackManagerFeedback<N>["fieldSuccesses"],
});

const removeFieldFeedbackByType = <N extends string = string>(
  state: types.FeedbackManagerFeedback<N>,
  feedbackType: types.FeedbackType,
): types.FeedbackManagerFeedback<N> => ({
  ...state,
  [util.getFeedbackManagerFieldKey(feedbackType)]: {},
  fields: Object.keys(state.fields).reduce(
    (
      prev: types.FeedbackManagerFeedback<N>["fields"],
      field: string,
    ): types.FeedbackManagerFeedback<N>["fields"] => {
      const fieldFeedback = state.fields[field as N];
      if (fieldFeedback !== undefined) {
        /* Include the field in the filter so that feedback for a given field can be cleared based
           on the field (which is the index of the object). */
        const newFieldFeedback = fieldFeedback.filter(
          (f: types.GlobalFeedback) => f.feedbackType !== feedbackType,
        );
        if (newFieldFeedback.length === 0) {
          return removeObjAttributes<types.FeedbackManagerFeedback<N>["fields"], N>(prev, [
            field as N,
          ]) as types.FeedbackManagerFeedback<N>["fields"];
        }
        return { ...prev, [field]: newFieldFeedback };
      }
      return prev;
    },
    {} as types.FeedbackManagerFeedback<N>["fields"],
  ),
});

/**
 * A reducer, {@link Reducer}, that handles state updates to the feedback managed by the feedback
 * manager, {@link types.FeedbackManager}, when feedback is being cleared from its state.
 */
export const clearFeedbackReducer = <N extends string = string>(
  state: types.FeedbackManagerFeedback<N>,
  action: ClearFeedbackAction<N>,
): types.FeedbackManagerFeedback<N> => {
  const options = action.options;
  if (options !== undefined && typeguards.isClearFeedbackTypeOptions(options)) {
    if (options.meta === "global") {
      return removeGlobalFeedback(
        state,
        (f: types.ManagedGlobalFeedback) => f.feedbackType !== options.feedbackType,
      );
    } else if (options.meta === "field") {
      return removeFieldFeedbackByType(state, options.feedbackType);
    }
    return removeFieldFeedbackByType(
      removeGlobalFeedback(
        state,
        (f: types.ManagedGlobalFeedback) => f.feedbackType !== options.feedbackType,
      ),
      options.feedbackType,
    );
  } else if (options !== undefined && typeguards.isClearGlobalFeedbackOptions(options)) {
    const ids = uniq(Array.isArray(options.ids) ? options.ids : [options.ids]);
    const existing = (
      state.global.filter((f: types.ManagedGlobalFeedback) =>
        typeguards.isGlobalFeedback(f),
      ) as types.ManagedGlobalFeedback[]
    ).map((f: types.ManagedGlobalFeedback) => f.id);

    const duplicates = findDuplicates(existing);
    if (duplicates.length !== 0) {
      logger.error(
        { duplicates: JSON.stringify(duplicates) },
        `Invalid State: Feedback elements with ID(s) ${duplicates.join(
          ", ",
        )} are in the state multiple times.`,
      );
    }
    const missing = ids.filter((id: string) => !existing.includes(id));
    if (missing.length !== 0) {
      logger.error(
        { missing: JSON.stringify(missing), existing: JSON.stringify(existing) },
        `Inconsistent State: Feedback(s) with ID(s) ${missing.join(
          ",",
        )} do not exist in state when expected to - they will not be removed.`,
      );
    }
    return removeGlobalFeedback(state, (f: types.ManagedGlobalFeedback) => !ids.includes(f.id));
  } else if (options !== undefined && typeguards.isClearFieldFeedbackOptions(options)) {
    const fields = Array.isArray(options.fields) ? options.fields : ([options.fields] as N[]);

    const missing = fields.filter((id: string) => !Object.keys(state.fields).includes(id));
    if (missing.length !== 0) {
      logger.error(
        { missing: JSON.stringify(missing), existing: JSON.stringify(Object.keys(state.fields)) },
        `Inconsistent State: Feedback(s) with field(s) ${missing.join(
          ",",
        )} do not exist in state when expected to - they will not be removed.`,
      );
    }
    return removeFields(state, fields);
  }
  return options?.meta === "field"
    ? { ...state, fields: {}, fieldErrors: {}, fieldSuccesses: {}, fieldWarnings: {} }
    : options?.meta === "global"
    ? { ...state, global: [] }
    : constants.InitialManagerFeedback;
};
