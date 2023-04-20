import classNames from "classnames";

import { ui, feedback } from "lib";

import { Icon } from "./Icon";

export type FeedbackIconProps = Omit<ui.IconProps, "color" | "icon" | "spin"> & {
  readonly feedbackType: feedback.FeedbackType;
};

export const FeedbackIcon = ({ feedbackType, ...props }: FeedbackIconProps) => (
  <Icon
    {...props}
    className={classNames("icon--feedback", `icon--feedback-${feedbackType}`)}
    icon={feedback.FeedbackIcons[feedbackType]}
  />
);
