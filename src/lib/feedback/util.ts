import { logger } from "internal";

import * as constants from "./constants";
import * as types from "./types";

/**
 * Returns the most severe feedback type, {@link types.FeedbackType}, for a series of feedback
 * elements, {@link F[]}.
 */
export const getMostSevereFeedbackType = <F extends types.GlobalFeedback>(
  feedback: F[],
): types.FeedbackType | null => {
  for (const index in constants.FeedbackTypeSeverity) {
    if (
      feedback.filter((f: F) => f.feedbackType === constants.FeedbackTypeSeverity[index]).length !==
      0
    ) {
      return constants.FeedbackTypeSeverity[index];
    }
  }
  return null;
};

const getFeedbackManagerConfigValue = <
  P extends Exclude<keyof types.FeedbackManagerConfig, "defaults" | "initialFeedback">,
>(
  param: P,
  config: types.FeedbackManagerConfig,
  options?: Omit<types.FeedbackManagerConfig, "defaults">,
): types.GlobalManagedFeedbackConfig[P] => {
  const constantValue = config[param];
  const defaultValue = config.defaults !== undefined ? config.defaults[param] : undefined;
  const optionValue = options !== undefined ? options[param] : undefined;

  if (constantValue !== undefined) {
    /* When a configuration parameter is defined at the top level of the configuration object, its
       intention is that it is not a default but a constant that should be overridden. */
    if (defaultValue !== undefined) {
      logger.warn(
        {
          param,
          constantValue,
          defaultValue,
        },
        `The feedback manager configuration parameter '${param}' is provided as a constant ` +
          `'${constantValue}', so the provided default '${defaultValue}' is not applicable.`,
      );
    }
    if (optionValue !== undefined) {
      logger.warn(
        {
          param,
          constantValue,
          optionValue,
        },
        `The feedback manager configuration parameter '${param}' is provided as a constant ` +
          `'${constantValue}', so the providing as an option '${optionValue}' is not allowed.`,
      );
    }
    return constantValue;
  }
  return optionValue !== undefined
    ? optionValue
    : defaultValue !== undefined
    ? defaultValue
    : constants.DEFAULT_GLOBAL_CONFIG[param];
};

/**
 * Returns the options for the {@link types.FeedbackManager} based on the options provided when
 * it was configured and the options that may have been dynamically provided when using a method
 * on the manager.
 *
 * @param {types.FeedbackManagerConfig} config
 *   The configuration options that were provided to the {@link types.FeedbackManager} when it was
 *   established.
 * @param {types.GlobalManagedFeedbackConfig} options
 *   Dynamically provide configuration values that will take precedence over default values.
 *
 * @returns {types.GlobalManagedFeedbackConfig}
 *   The configuration options with all values present, either due to a default value, a
 *   configuration value or a dynamically provided value.
 */
export const getFeedbackManagerConfig = (
  config: types.FeedbackManagerConfig,
  options?: Partial<types.GlobalManagedFeedbackConfig>,
): types.GlobalManagedFeedbackConfig => ({
  closable: getFeedbackManagerConfigValue("closable", config, options),
});

/**
 * Returns the associated field-level feedback key for the feedback that is included on the return
 * of the {@link types.FeedbackManager} hook, {@link types.FeedbackManagerFeedback<N>}.
 *
 * @param {types.FeedbackType} feedbackType The type of feedback for the lookup.
 * @returns {"fieldErrors" | "fieldSuccesses" | "fieldWarnings"}
 */
export const getFeedbackManagerFieldKey = <N extends string = string>(
  feedbackType: types.FeedbackType,
): keyof types.FeedbackManagerFeedback<N> & ("fieldErrors" | "fieldSuccesses" | "fieldWarnings") =>
  ({
    [types.FeedbackTypes.ERROR]: "fieldErrors" as const,
    [types.FeedbackTypes.SUCCESS]: "fieldSuccesses" as const,
    [types.FeedbackTypes.WARNING]: "fieldWarnings" as const,
  }[feedbackType]);
