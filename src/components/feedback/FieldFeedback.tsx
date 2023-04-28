import classNames from "classnames";

import * as errors from "application/errors";
import * as messages from "application/errors/messages";
import * as Feedback from "lib/feedback";
import * as ui from "lib/ui";
import { forms } from "lib/ui";

export type FieldFeedbackProps<
  D extends forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
> = ui.ComponentProps<{
  readonly feedback: errors.ClientValidationError | forms.FormFieldFeedback<D, N>;
}>;

export const FieldFeedback = <
  D extends forms.FormData,
  N extends forms.FieldName<D> = forms.FieldName<D>,
>({
  feedback,
  ...props
}: FieldFeedbackProps<D, N>): JSX.Element => (
  <div
    {...props}
    className={classNames(
      "field-feedback",
      forms.isFormFieldFeedback(feedback)
        ? `field-feedback--${feedback.feedbackType}`
        : `field-feedback--${Feedback.FeedbackTypes.ERROR}`,
      props.className,
    )}
  >
    {forms.isFormFieldFeedback(feedback)
      ? feedback.message
      : messages.getErrorMessage(feedback.type)}
  </div>
);
