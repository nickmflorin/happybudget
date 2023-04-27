import classNames from "classnames";

import * as feedback from "lib/feedback";
import { icons } from "lib/ui";

import { Icon } from "./Icon";

export type FeedbackIconProps = Omit<icons.IconProps, "color" | "icon" | "spin"> & {
  readonly feedbackType: feedback.FeedbackType;
};

export const FeedbackIcon = ({ feedbackType, ...props }: FeedbackIconProps) => (
  <Icon
    {...props}
    className={classNames("icon--feedback", `icon--feedback-${feedbackType}`)}
    icon={feedback.FeedbackIcons[feedbackType]}
  />
);
