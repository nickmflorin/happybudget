import { type Icon, IconNames, IconCodes } from "../ui/icons";

import {
  type FeedbackType,
  type GlobalManagedFeedbackConfig,
  type FeedbackManagerFeedback,
  FeedbackTypes,
} from "./types";

export const FeedbackIcons: { [key in FeedbackType]: Icon } = {
  [FeedbackTypes.SUCCESS]: { type: IconCodes.SOLID, name: IconNames.CIRCLE_CHECK },
  [FeedbackTypes.ERROR]: { type: IconCodes.SOLID, name: IconNames.CIRCLE_EXCLAMATION },
  [FeedbackTypes.WARNING]: { type: IconCodes.SOLID, name: IconNames.TRIANGLE_EXCLAMATION },
};

export const DEFAULT_GLOBAL_CONFIG: GlobalManagedFeedbackConfig = {
  closable: true,
};

export const InitialManagerFeedback: FeedbackManagerFeedback = {
  global: [],
  fields: {},
  fieldErrors: {},
  fieldWarnings: {},
  fieldSuccesses: {},
};

export const FeedbackTypeSeverity: FeedbackType[] = [
  FeedbackTypes.ERROR,
  FeedbackTypes.WARNING,
  FeedbackTypes.SUCCESS,
];
