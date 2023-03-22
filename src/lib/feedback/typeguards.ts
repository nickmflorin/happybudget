import * as types from "./types";

export const isClearGlobalFeedbackOptions = <
  T extends types.FeedbackType = types.FeedbackType,
  N extends string = string,
>(
  options: types.ClearFeedbackOptions<T, N>,
): options is types.ClearGlobalFeedbackOptions<T> =>
  (options as types.ClearGlobalFeedbackOptions<T>).ids !== undefined;

export const isClearFeedbackTypeOptions = <
  T extends types.FeedbackType = types.FeedbackType,
  N extends string = string,
>(
  options: types.ClearFeedbackOptions<T, N>,
): options is types.ClearFeedbackTypeOptions<T> =>
  (options as types.ClearFeedbackTypeOptions<T>).feedbackType !== undefined;

export const isClearFieldFeedbackOptions = <
  T extends types.FeedbackType = types.FeedbackType,
  N extends string = string,
>(
  options: types.ClearFeedbackOptions<T, N>,
): options is types.ClearFieldFeedbackOptions<N> =>
  (options as types.ClearFieldFeedbackOptions<N>).fields !== undefined;

export const isFieldFeedback = <
  T extends types.FeedbackType = types.FeedbackType,
  N extends string = string,
>(
  feedback: types.Feedback<T, N>,
): feedback is types.FieldFeedback<T, N> =>
  (feedback as types.FieldFeedback<T, N>).field !== undefined;

export const isGlobalFeedback = <
  T extends types.FeedbackType = types.FeedbackType,
  N extends string = string,
>(
  feedback: types.Feedback<T, N>,
): feedback is types.GlobalFeedback<T> => !isFieldFeedback(feedback);
