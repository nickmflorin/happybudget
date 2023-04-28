import React from "react";

import * as errors from "application/errors";

import { enumeratedLiterals, EnumeratedLiteralType } from "../util/literals";
import { OneOrMany } from "../util/types/arrays";

export const FeedbackMetaTypes = enumeratedLiterals(["global", "field"] as const);
export type FeedbackMetaType = EnumeratedLiteralType<typeof FeedbackMetaTypes>;

export const FeedbackTypes = enumeratedLiterals(["error", "warning", "success"] as const);
export type FeedbackType = EnumeratedLiteralType<typeof FeedbackTypes>;

export type SUCCESS = typeof FeedbackTypes.SUCCESS;
export type ERROR = typeof FeedbackTypes.ERROR;
export type WARNING = typeof FeedbackTypes.WARNING;

/**
 * General feeedback that does not pertain to a specific field.
 */
export interface GlobalFeedback<T extends FeedbackType = FeedbackType> {
  readonly feedbackType: T;
  readonly message: string;
}

export type GlobalSuccessFeedback = GlobalFeedback<SUCCESS>;
export type GlobalErrorFeedback = GlobalFeedback<ERROR>;
export type GlobalWarningFeedback = GlobalFeedback<WARNING>;

export type GlobalManagedFeedbackConfig = {
  readonly closable: boolean;
};

/**
 * Feeedback that pertains to a specific field.
 */
export interface FieldFeedback<T extends FeedbackType = FeedbackType, N extends string = string>
  extends GlobalFeedback<T> {
  readonly field: N;
}

export type FieldSuccessFeedback<N extends string = string> = FieldFeedback<SUCCESS, N>;
export type FieldErrorFeedback<N extends string = string> = FieldFeedback<ERROR, N>;
export type FieldWarningFeedback<N extends string = string> = FieldFeedback<WARNING, N>;

export type Feedback<T extends FeedbackType = FeedbackType, N extends string = string> =
  | GlobalFeedback<T>
  | FieldFeedback<T, N>;

/**
 * Global feedback that is managed by the feedback manager, {@link FeedbackManager}.  The global
 * managed feedback elements are attributed with a randomly generated ID and, if applicable, an
 * `onClose` handler that can remove the feedback from the state associated with the manager,
 * {@link FeedbackManager}.
 */
export interface ManagedGlobalFeedback<T extends FeedbackType = FeedbackType>
  extends GlobalFeedback<T> {
  readonly id: string;
  readonly onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Used to clear all of the feedback stored in the state of the manager, {@link FeedbackManager},
 * at either the field level, global level or both.
 */
export type ClearAllFeedbackOptions = {
  readonly meta?: FeedbackMetaType;
};

/**
 * Used to identify specific global feedback elements, {@link GlobalFeedback[]}, that should be
 * removed from the feedback stored in the state of the manager, {@link FeedbackManager}, based
 * on a provided set of IDs.
 *
 * This is primarily used for cases where the feedback element is being rendered in the UI and it
 * allows a given user to click an action that removes the rendered feedback element from view.
 */
export type ClearGlobalFeedbackOptions<T extends FeedbackType = FeedbackType> = {
  readonly ids: OneOrMany<ManagedGlobalFeedback<T>["id"]>;
};

/**
 * Used to identify specific feedback elements, {@link Feedback[]}, that should be removed from
 * the feedback stored in the state of the manager, {@link FeedbackManager}, based on the type of
 * feedback that is in the state, {@link FeedbackType}.
 */
export type ClearFeedbackTypeOptions<T extends FeedbackType = FeedbackType> = {
  readonly feedbackType: T;
  readonly meta?: FeedbackMetaType;
};

/**
 * Used to identify specific field level feedback elements, {@link FieldFeedback[]}, that should
 * be removed from the feedback stored in the state of the manager, {@link FeedbackManager}, based
 * on a provided set of fields.
 */
export type ClearFieldFeedbackOptions<N extends string = string> = {
  readonly fields: N[];
};

/**
 * Defines the options that can be used to control the manner in which feedback is cleared from the
 * state of the manager, {@link FeedbackManager}.
 */
export type ClearFeedbackOptions<
  T extends FeedbackType = FeedbackType,
  N extends string = string,
> =
  | ClearAllFeedbackOptions
  | ClearGlobalFeedbackOptions<T>
  | ClearFeedbackTypeOptions<T>
  | ClearFieldFeedbackOptions<N>;

export type FeedbackManagerConfig<N extends string = string> =
  Partial<GlobalManagedFeedbackConfig> & {
    defaults?: Partial<GlobalManagedFeedbackConfig>;
    initialFeedback?: (GlobalFeedback | FieldFeedback<FeedbackType, N>)[];
  };

export type FieldsFeedback<T extends FeedbackType = FeedbackType, N extends string = string> = {
  [key in N]?: FieldFeedback<T, N>["message"][];
};

export type FieldErrors<N extends string = string> = FieldsFeedback<ERROR, N>;
export type FieldWarnings<N extends string = string> = FieldsFeedback<WARNING, N>;
export type FieldSuccesses<N extends string = string> = FieldsFeedback<SUCCESS, N>;

export type FeedbackManagerFeedback<N extends string = string> = {
  global: ManagedGlobalFeedback[];
  /* The feedback type is global when the feedback is indexed by the field because the field is
     already dictated by the index in the object type.  In other words:

     Omit<FieldFeedback<FeedbackType, N>, "field"> = GlobalFeedback<FeedbackType> */
  fields: { [key in N]?: GlobalFeedback<FeedbackType>[] };
  fieldErrors: FieldErrors<N>;
  fieldWarnings: FieldWarnings<N>;
  fieldSuccesses: FieldSuccesses<N>;
};

export type FeedbackManager<
  N extends string = string,
  C extends Record<string, unknown> = Partial<GlobalManagedFeedbackConfig>,
> = {
  /**
   * The feedback that is stored in the state of the feedback manager, {@link FeedbackManager}.
   */
  readonly feedback: FeedbackManagerFeedback<N>;
  /**
   * Adds one or multiple feedback elements to the feedback stored in the state of the manager,
   * {@link FeedbackManager}.  Added feedback will append to the existing feedback, it will not
   * erase the existing feedback stored in state.
   */
  readonly addFeedback: (
    feedback: errors.HttpError | OneOrMany<GlobalFeedback | FieldFeedback<FeedbackType, N>>,
    options?: Partial<C>,
  ) => void;
  /**
   * Sets the feedback stored in the state of the {@link FeedbackManager}. Setting the feedback will
   * replace pre-existing feedback with the provided feedback elements.
   */
  readonly setFeedback: (
    feedback: errors.HttpError | OneOrMany<GlobalFeedback | FieldFeedback<FeedbackType, N>>,
    options?: Partial<C>,
  ) => void;
  /**
   * Clears the feedback stored in the state of the {@link FeedbackManager} either based on certain
   * filter criteria or as a whole.
   */
  readonly clearFeedback: (options?: ClearFeedbackOptions<FeedbackType, N>) => void;
};
