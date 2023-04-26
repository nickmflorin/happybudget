import classNames from "classnames";

import * as errors from "application/errors";
import * as messages from "application/errors/messages";
import { ui, feedback as Feedback } from "lib";

export type FieldFeedbackProps<
  D extends ui.FormData,
  N extends ui.FieldName<D> = ui.FieldName<D>,
> = ui.ComponentProps<{
  readonly feedback: errors.ClientValidationError | ui.FormFieldFeedback<D, N>;
}>;

export const FieldFeedback = <D extends ui.FormData, N extends ui.FieldName<D> = ui.FieldName<D>>({
  feedback,
  ...props
}: FieldFeedbackProps<D, N>): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "field-feedback",
      ui.isFormFieldFeedback(feedback)
        ? `field-feedback--${feedback.feedbackType}`
        : `field-feedback--${Feedback.FeedbackTypes.ERROR}`,
      props.className,
    )}
  >
    {ui.isFormFieldFeedback(feedback) ? feedback.message : messages.getErrorMessage(feedback.type)}
  </div>
);
